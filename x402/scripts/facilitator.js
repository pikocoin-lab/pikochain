// x402 facilitator for PikoChain (eip155:2049).
// Endpoints: POST /verify, POST /settle  (x402 "exact" scheme, EIP-3009)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const PORT = parseInt(process.env.X402_PORT || '8090', 10);
const NETWORK = 'eip155:2049';
const RPC = 'http://127.0.0.1:8545';

const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, '../deployment.json'), 'utf8'));
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '../demo-keys.json'), 'utf8'));
const artifacts = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts.json'), 'utf8'));

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(keys.facilitator.privateKey, provider);
const token = new ethers.Contract(deployment.wusdc, artifacts.WUSDCv2.abi, wallet);
const settler = deployment.settler
  ? new ethers.Contract(deployment.settler, artifacts.PikoPaySettler.abi, wallet)
  : null;

// ---- facilitator fee: per-settlement cut, in basis points (100 = 1%) ----
// X402_FEE_BPS=0 (default) -> behavior is exactly as before, no fee charged.
// When > 0, the payer must attach a second EIP-3009 authorization
// (feePayload) paying `value * bps / 10000` to FEE_RECIPIENT, on top of the
// merchant price. A second signature is required because EIP-3009 locks the
// exact (to, value) — the facilitator cannot split one signed authorization.
const FEE_BPS = (() => {
  const v = parseInt(process.env.X402_FEE_BPS || '0', 10);
  if (!Number.isInteger(v) || v < 0 || v > 10000)
    throw new Error('X402_FEE_BPS must be an integer 0..10000');
  return v;
})();
const FEE_RECIPIENT = (process.env.X402_FEE_RECIPIENT || wallet.address).toLowerCase();
if (!ethers.isAddress(FEE_RECIPIENT)) throw new Error('bad X402_FEE_RECIPIENT');

function expectedFee(value) {
  if (FEE_BPS === 0) return 0n;
  return (BigInt(value) * BigInt(FEE_BPS)) / 10000n; // round down; dust -> 0 = no fee
}

// ---- bounty faucet: one $0.05 test-wUSDC grant per address (Moltbook bounty) ----
// Enabled only with X402_BOUNTY_ENABLED=1. Test tokens only (zero real backing).
const BOUNTY_ENABLED = process.env.X402_BOUNTY_ENABLED === '1';
const BOUNTY_AMOUNT = 50000n; // $0.05 wUSDC
const BOUNTY_DB = path.join(__dirname, '../bounty-claims.json');
let bountyClaimed = new Set();
try { bountyClaimed = new Set(JSON.parse(fs.readFileSync(BOUNTY_DB, 'utf8'))); } catch {}
function bountySave() {
  try { fs.writeFileSync(BOUNTY_DB, JSON.stringify([...bountyClaimed])); } catch {}
}

const DOMAIN = {
  name: 'Wrapped USD Coin',
  version: '1',
  chainId: 2049,
  verifyingContract: deployment.wusdc,
};
const TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};

const UPTO_DOMAIN = {
  name: 'PikoChain x402 Upto',
  version: '1',
  chainId: 2049,
  verifyingContract: wallet.address, // binds the auth to THIS facilitator
};
const UPTO_TYPES = {
  UptoAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'payTo', type: 'address' },
    { name: 'maxAmount', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};
// Single-use enforcement for upto authorizations (Permit2-style nonce tracking).
const UPTO_NONCE_DB = path.join(__dirname, '../upto-nonces.json');
const uptoUsedNonces = new Set();
try {
  for (const n of JSON.parse(fs.readFileSync(UPTO_NONCE_DB, 'utf8')))
    uptoUsedNonces.add(String(n).toLowerCase());
} catch {}
function uptoSaveNonces() {
  try { fs.writeFileSync(UPTO_NONCE_DB, JSON.stringify([...uptoUsedNonces])); } catch {}
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); }
    });
  });
}
const send = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
};

async function verifyPayload(pp, expect) {
  // pp = { scheme, network, payload: { signature, authorization } }
  // expect = optional { to, value } the authorization must match (used for fee legs)
  if (!pp || pp.scheme !== 'exact') return { ok: false, reason: 'unsupported scheme' };
  if (pp.network !== NETWORK) return { ok: false, reason: `unsupported network ${pp.network}` };
  const { signature, authorization: a } = pp.payload || {};
  if (!signature || !a) return { ok: false, reason: 'missing signature/authorization' };
  if (expect) {
    if ((a.to || '').toLowerCase() !== String(expect.to).toLowerCase())
      return { ok: false, reason: 'authorization recipient mismatch' };
    if (BigInt(a.value) !== BigInt(expect.value))
      return { ok: false, reason: `authorization amount mismatch: expected ${expect.value}` };
  }
  let recovered;
  try {
    recovered = ethers.verifyTypedData(DOMAIN, TYPES, {
      from: a.from, to: a.to, value: a.value,
      validAfter: a.validAfter, validBefore: a.validBefore, nonce: a.nonce,
    }, signature);
  } catch (e) {
    return { ok: false, reason: 'bad signature encoding' };
  }
  if (recovered.toLowerCase() !== a.from.toLowerCase())
    return { ok: false, reason: 'signature does not match payer' };
  const now = Math.floor(Date.now() / 1000);
  if (now < Number(a.validAfter)) return { ok: false, reason: 'authorization not yet valid' };
  if (now > Number(a.validBefore)) return { ok: false, reason: 'authorization expired' };
  if (await token.authorizationState(a.from, a.nonce))
    return { ok: false, reason: 'authorization already used' };
  const bal = await token.balanceOf(a.from);
  if (bal < BigInt(a.value)) return { ok: false, reason: 'insufficient wUSDC balance' };
  return { ok: true, payer: a.from };
}

// ---- x402 v2: normalize v1 and v2 payload shapes ----
// v1: { x402Version: 1, scheme, network, payload }  (or bare { scheme, network, payload })
// v2: { x402Version: 2, accepted: { scheme, network, ... }, payload }  (inside paymentPayload)
// Returns { version: 1|2, scheme, network, payload, accepted, paymentRequirements }
function normalizeIncoming(body) {
  const pp = body.paymentPayload || body;
  if (pp && (pp.x402Version === 2 || pp.accepted)) {
    const accepted = pp.accepted || {};
    return {
      version: 2,
      scheme: accepted.scheme || 'exact',
      network: accepted.network || NETWORK,
      payload: pp.payload || {},
      accepted,
      paymentRequirements: body.paymentRequirements || null,
    };
  }
  return {
    version: 1,
    scheme: pp.scheme || 'exact',
    network: pp.network || NETWORK,
    payload: pp.payload || {},
    accepted: null,
    paymentRequirements: null,
  };
}

// ---- scheme: upto (usage-based, PikoChain asset transfer method) ----
// Official x402 v2 upto/EVM requires Permit2, which is not deployed on eip155:2049.
// PikoChain implements identical upto SEMANTICS via a different transfer method,
// advertised as assetTransferMethod "piko-allowance":
//   1. client approves the facilitator for >= maxAmount (+maxFee) on the token
//   2. client signs EIP-712 UptoAuthorization (recipient-bound, time-bound, single-use nonce)
//   3. facilitator settles the ACTUAL metered amount via transferFrom (<= maxAmount)
// Trust assumption (documented): like exact settlement, the facilitator is trusted
// to honor the signed payTo and the metered amount.
async function verifyUpto(n, pr) {
  const { signature, uptoAuthorization: u } = n.payload || {};
  if (!signature || !u) return { ok: false, reason: 'missing signature/uptoAuthorization' };
  if (n.network !== NETWORK) return { ok: false, reason: `unsupported network ${n.network}` };
  const accepted = n.accepted || {};
  const payTo = (pr && pr.payTo) || accepted.payTo;
  if (!payTo) return { ok: false, reason: 'missing payTo in requirements' };
  if ((u.payTo || '').toLowerCase() !== String(payTo).toLowerCase())
    return { ok: false, reason: 'upto payTo mismatch' };
  let recovered;
  try {
    recovered = ethers.verifyTypedData(UPTO_DOMAIN, UPTO_TYPES, {
      from: u.from, payTo: u.payTo, maxAmount: u.maxAmount,
      validAfter: u.validAfter, validBefore: u.validBefore, nonce: u.nonce,
    }, signature);
  } catch (e) {
    return { ok: false, reason: 'bad signature encoding' };
  }
  if (recovered.toLowerCase() !== String(u.from).toLowerCase())
    return { ok: false, reason: 'signature does not match payer' };
  const now = Math.floor(Date.now() / 1000);
  if (now < Number(u.validAfter)) return { ok: false, reason: 'upto authorization not yet valid' };
  if (now > Number(u.validBefore)) return { ok: false, reason: 'upto authorization expired' };
  const nonceKey = String(u.nonce).toLowerCase();
  if (uptoUsedNonces.has(nonceKey)) return { ok: false, reason: 'upto authorization already used' };
  const maxAmount = BigInt(u.maxAmount);
  if (maxAmount <= 0n) return { ok: false, reason: 'upto maxAmount must be > 0' };
  // Phase-dependent amount: at settle time paymentRequirements.amount = ACTUAL metered
  // amount (must be <= signed max). Signature is always re-verified against the max.
  let actual = maxAmount;
  if (pr && pr.amount !== undefined && pr.amount !== null && String(pr.amount) !== '') {
    actual = BigInt(pr.amount);
    if (actual < 0n || actual > maxAmount)
      return { ok: false, reason: 'settle amount exceeds authorized maximum' };
  }
  const maxFee = expectedFee(maxAmount.toString());
  const need = maxAmount + maxFee;
  const allowance = await token.allowance(u.from, wallet.address);
  if (allowance < need) return { ok: false, reason: 'insufficient facilitator allowance for upto max' };
  const bal = await token.balanceOf(u.from);
  if (bal < need) return { ok: false, reason: 'insufficient wUSDC balance for upto max' };
  return { ok: true, payer: u.from, payTo: u.payTo, maxAmount, actual, nonce: u.nonce, auth: u };
}

async function settleUpto(n) {
  const v = await verifyUpto(n, n.paymentRequirements);
  if (!v.ok) return { ok: false, status: 400, reason: v.reason };
  uptoUsedNonces.add(String(v.nonce).toLowerCase());
  uptoSaveNonces();
  let txHash = '';
  if (v.actual > 0n) {
    try {
      const tx = await token.transferFrom(v.payer, v.payTo, v.actual);
      const receipt = await tx.wait();
      if (receipt.status !== 1) throw new Error('upto tx reverted');
      txHash = tx.hash;
    } catch (e) {
      return { ok: false, status: 500, reason: String(e.message || e).slice(0, 200) };
    }
  }
  // fee leg on the ACTUAL settled amount; a fee failure never fails the payment
  const fee = expectedFee(v.actual.toString());
  let feeTx = null, feeError = null;
  if (fee > 0n) {
    try {
      const ftx = await token.transferFrom(v.payer, FEE_RECIPIENT, fee);
      const freceipt = await ftx.wait();
      if (freceipt.status !== 1) throw new Error('upto fee tx reverted');
      feeTx = ftx.hash;
    } catch (e) { feeError = String(e.message || e).slice(0, 200); }
  }
  return { ok: true, txHash, payer: v.payer, actual: v.actual.toString(), fee: fee.toString(), feeTx, feeError };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/bounty') {
    let body;
    try { body = await readBody(req); } catch { return send(res, 400, { error: 'bad json' }); }
    if (!BOUNTY_ENABLED) return send(res, 403, { error: 'bounty faucet disabled' });
    const addr = String(body.address || '');
    if (!ethers.isAddress(addr)) return send(res, 400, { error: 'bad address' });
    const a = addr.toLowerCase();
    if (bountyClaimed.has(a)) return send(res, 400, { error: 'already claimed' });
    try {
      const tx = await token.transfer(a, BOUNTY_AMOUNT);
      const receipt = await tx.wait();
      if (receipt.status !== 1) throw new Error('tx reverted');
      bountyClaimed.add(a); bountySave();
      return send(res, 200, { success: true, transaction: tx.hash, amount: BOUNTY_AMOUNT.toString() });
    } catch (e) {
      return send(res, 500, { success: false, errorReason: String(e.message || e).slice(0, 200) });
    }
  }
  // ---- x402 v2 discovery: GET /supported ----
  if (req.method === 'GET' && req.url === '/supported') {
    return send(res, 200, {
      kinds: [
        { x402Version: 2, scheme: 'exact', network: NETWORK, extra: { assetTransferMethod: 'eip3009' } },
        { x402Version: 2, scheme: 'upto', network: NETWORK, extra: { assetTransferMethod: 'piko-allowance', facilitatorAddress: wallet.address } },
      ],
      extensions: [],
      signers: { 'eip155:*': [wallet.address] },
      // platform fee discovery: when bps > 0, clients must attach a second
      // EIP-3009 authorization (feePayload) of `value * bps / 10000` to FEE_RECIPIENT
      fee: { bps: FEE_BPS, recipient: FEE_RECIPIENT },
    });
  }
  if (req.method !== 'POST' || !['/verify', '/settle', '/settleBatch'].includes(req.url)) {
    return send(res, 404, { error: 'use GET /supported, POST /verify, /settle, /settleBatch or /bounty' });
  }
  let body;
  try { body = await readBody(req); } catch { return send(res, 400, { error: 'bad json' }); }

  const n = normalizeIncoming(body);
  if (n.scheme !== 'exact' && n.scheme !== 'upto') {
    const err = `unsupported scheme ${n.scheme}`;
    if (req.url === '/verify') return send(res, 200, { isValid: false, invalidReason: err, payer: null });
    return send(res, 400, { success: false, errorReason: err });
  }

  if (req.url === '/verify') {
    let out;
    if (n.scheme === 'upto') {
      const v = await verifyUpto(n, n.paymentRequirements);
      out = v.ok
        ? { isValid: true, invalidReason: null, payer: v.payer }
        : { isValid: false, invalidReason: v.reason, payer: null };
    } else {
      const v = await verifyPayload(n);
      out = v.ok
        ? { isValid: true, invalidReason: null, payer: v.payer }
        : { isValid: false, invalidReason: v.reason, payer: null };
    }
    out.feeBps = FEE_BPS; // advertised so clients can sign the fee leg when > 0
    out.feeRecipient = FEE_RECIPIENT;
    return send(res, 200, out);
  }

  // /settle — upto has phase-dependent amount semantics
  if (n.scheme === 'upto') {
    const r = await settleUpto(n);
    if (!r.ok) return send(res, r.status, { success: false, errorReason: r.reason });
    const out = {
      success: true, transaction: r.txHash, network: NETWORK, payer: r.payer,
      amount: r.actual, // upto SettlementResponse extension: actual settled amount
    };
    if (r.feeTx || r.feeError) { out.fee = r.fee; out.feeTransaction = r.feeTx; out.feeError = r.feeError; }
    return send(res, 200, out);
  }

  // exact /settle path below works on the normalized shape `n`

  // ---- batch: verify N payments, settle all in ONE tx ----
  if (req.url === '/settleBatch') {
    if (!settler) return send(res, 500, { success: false, errorReason: 'settler not deployed' });
    const payments = body.payments || [];
    if (!payments.length || payments.length > 50)
      return send(res, 400, { success: false, errorReason: '1..50 payments per batch' });
    const auths = [];
    const feeAuths = [];
    for (const pp of payments) {
      const v = await verifyPayload(pp);
      if (!v.ok) return send(res, 400, { success: false, errorReason: `batch item invalid: ${v.reason}` });
      const { signature, authorization: a } = pp.payload;
      const sig = ethers.Signature.from(signature);
      auths.push({ from: a.from, to: a.to, value: a.value, validAfter: a.validAfter,
        validBefore: a.validBefore, nonce: a.nonce, v: sig.v, r: sig.r, s: sig.s });
      const fee = expectedFee(a.value);
      if (fee > 0n) {
        const fv = await verifyPayload(
          { scheme: 'exact', network: NETWORK, payload: pp.feePayload },
          { to: FEE_RECIPIENT, value: fee.toString() });
        if (!fv.ok) return send(res, 400, { success: false, errorReason: `batch fee invalid: ${fv.reason}` });
        if (fv.payer.toLowerCase() !== v.payer.toLowerCase())
          return send(res, 400, { success: false, errorReason: 'batch fee payer mismatch' });
        const bal = await token.balanceOf(v.payer);
        if (bal < BigInt(a.value) + fee)
          return send(res, 400, { success: false, errorReason: 'insufficient balance for payment + fee' });
        const fsig = ethers.Signature.from(pp.feePayload.signature);
        const fa = pp.feePayload.authorization;
        feeAuths.push({ from: fa.from, to: fa.to, value: fa.value, validAfter: fa.validAfter,
          validBefore: fa.validBefore, nonce: fa.nonce, v: fsig.v, r: fsig.r, s: fsig.s });
      }
    }
    try {
      const tx = await settler.batchTransfer(deployment.wusdc, auths);
      const receipt = await tx.wait();
      if (receipt.status !== 1) throw new Error('batch tx reverted');
      let feeTx = null, feeError = null;
      if (feeAuths.length) {
        try {
          const ftx = await settler.batchTransfer(deployment.wusdc, feeAuths);
          const freceipt = await ftx.wait();
          if (freceipt.status !== 1) throw new Error('fee batch tx reverted');
          feeTx = ftx.hash;
        } catch (e) { feeError = String(e.message || e).slice(0, 200); }
      }
      const out = { success: true, transaction: tx.hash, network: NETWORK, count: auths.length };
      if (feeAuths.length) { out.feeTransaction = feeTx; out.feeError = feeError; }
      return send(res, 200, out);
    } catch (e) {
      return send(res, 500, { success: false, errorReason: String(e.message || e).slice(0, 200) });
    }
  }

  const v = await verifyPayload(n);
  // /settle (exact) — /verify was already handled above via normalizeIncoming dispatch
  if (!v.ok) return send(res, 400, { success: false, errorReason: v.reason });
  const { signature, authorization: a } = n.payload;
  const sig = ethers.Signature.from(signature);
  const fee = expectedFee(a.value);
  let feeAuth = null, feeSig = null;
  if (fee > 0n) {
    const fv = await verifyPayload(
      { scheme: 'exact', network: NETWORK, payload: body.feePayload },
      { to: FEE_RECIPIENT, value: fee.toString() });
    if (!fv.ok) return send(res, 400, { success: false, errorReason: `fee invalid: ${fv.reason}` });
    if (fv.payer.toLowerCase() !== v.payer.toLowerCase())
      return send(res, 400, { success: false, errorReason: 'fee payer mismatch' });
    const bal = await token.balanceOf(v.payer);
    if (bal < BigInt(a.value) + fee)
      return send(res, 400, { success: false, errorReason: 'insufficient balance for payment + fee' });
    feeAuth = body.feePayload.authorization;
    feeSig = ethers.Signature.from(body.feePayload.signature);
  }
  try {
    // Submit the main + fee legs in parallel with explicit nonces so both
    // settle in the same/consecutive blocks. Wall time ~= one tx instead of
    // two — the public tunnel edge gives up on slow (>~5s) origins.
    const baseNonce = await wallet.getNonce('pending');
    const mainP = token.transferWithAuthorization(
      a.from, a.to, a.value, a.validAfter, a.validBefore, a.nonce, sig.v, sig.r, sig.s,
      { nonce: baseNonce }
    );
    let feeP = null;
    if (feeAuth) {
      feeP = token.transferWithAuthorization(
        feeAuth.from, feeAuth.to, feeAuth.value, feeAuth.validAfter, feeAuth.validBefore,
        feeAuth.nonce, feeSig.v, feeSig.r, feeSig.s,
        { nonce: baseNonce + 1 }
      );
      feeP.catch(() => {}); // avoid unhandled rejection if the main leg throws first
    }
    const tx = await mainP;
    const receipt = await tx.wait();
    if (receipt.status !== 1) throw new Error('tx reverted');
    // fee leg settles alongside the main payment; a fee failure never fails the payment itself
    let feeTx = null, feeError = null;
    if (feeP) {
      try {
        const ftx = await feeP;
        const freceipt = await ftx.wait();
        if (freceipt.status !== 1) throw new Error('fee tx reverted');
        feeTx = ftx.hash;
      } catch (e) { feeError = String(e.message || e).slice(0, 200); }
    }
    const out = {
      success: true, transaction: tx.hash, network: NETWORK, payer: a.from,
    };
    if (feeAuth) { out.fee = fee.toString(); out.feeTransaction = feeTx; out.feeError = feeError; }
    return send(res, 200, out);
  } catch (e) {
    return send(res, 500, { success: false, errorReason: String(e.message || e).slice(0, 200) });
  }
});

server.listen(PORT, () => console.log(`x402 facilitator on :${PORT} (network ${NETWORK})`));
