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

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || !['/verify', '/settle', '/settleBatch'].includes(req.url)) {
    return send(res, 404, { error: 'use POST /verify, /settle or /settleBatch' });
  }
  let body;
  try { body = await readBody(req); } catch { return send(res, 400, { error: 'bad json' }); }

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

  const pp = body.paymentPayload || body;

  const v = await verifyPayload(pp);
  if (req.url === '/verify') {
    const out = v.ok
      ? { isValid: true, invalidReason: null, payer: v.payer }
      : { isValid: false, invalidReason: v.reason, payer: null };
    out.feeBps = FEE_BPS; // advertised so clients can sign the fee leg when > 0
    out.feeRecipient = FEE_RECIPIENT;
    return send(res, 200, out);
  }

  // /settle
  if (!v.ok) return send(res, 400, { success: false, errorReason: v.reason });
  const { signature, authorization: a } = pp.payload;
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
    const tx = await token.transferWithAuthorization(
      a.from, a.to, a.value, a.validAfter, a.validBefore, a.nonce, sig.v, sig.r, sig.s
    );
    const receipt = await tx.wait();
    if (receipt.status !== 1) throw new Error('tx reverted');
    // fee leg settles after the main payment; a fee failure never fails the payment itself
    let feeTx = null, feeError = null;
    if (feeAuth) {
      try {
        const ftx = await token.transferWithAuthorization(
          feeAuth.from, feeAuth.to, feeAuth.value, feeAuth.validAfter, feeAuth.validBefore,
          feeAuth.nonce, feeSig.v, feeSig.r, feeSig.s
        );
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
