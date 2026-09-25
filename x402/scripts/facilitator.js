// x402 facilitator for PikoChain (eip155:2049).
// Endpoints: POST /verify, POST /settle  (x402 "exact" scheme, EIP-3009)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const PORT = 8090;
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

async function verifyPayload(pp) {
  // pp = { scheme, network, payload: { signature, authorization } }
  if (!pp || pp.scheme !== 'exact') return { ok: false, reason: 'unsupported scheme' };
  if (pp.network !== NETWORK) return { ok: false, reason: `unsupported network ${pp.network}` };
  const { signature, authorization: a } = pp.payload || {};
  if (!signature || !a) return { ok: false, reason: 'missing signature/authorization' };
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
    for (const pp of payments) {
      const v = await verifyPayload(pp);
      if (!v.ok) return send(res, 400, { success: false, errorReason: `batch item invalid: ${v.reason}` });
      const { signature, authorization: a } = pp.payload;
      const sig = ethers.Signature.from(signature);
      auths.push({ from: a.from, to: a.to, value: a.value, validAfter: a.validAfter,
        validBefore: a.validBefore, nonce: a.nonce, v: sig.v, r: sig.r, s: sig.s });
    }
    try {
      const tx = await settler.batchTransfer(deployment.wusdc, auths);
      const receipt = await tx.wait();
      if (receipt.status !== 1) throw new Error('batch tx reverted');
      return send(res, 200, { success: true, transaction: tx.hash, network: NETWORK, count: auths.length });
    } catch (e) {
      return send(res, 500, { success: false, errorReason: String(e.message || e).slice(0, 200) });
    }
  }

  const pp = body.paymentPayload || body;

  const v = await verifyPayload(pp);
  if (req.url === '/verify') {
    return v.ok
      ? send(res, 200, { isValid: true, invalidReason: null, payer: v.payer })
      : send(res, 200, { isValid: false, invalidReason: v.reason, payer: null });
  }

  // /settle
  if (!v.ok) return send(res, 400, { success: false, errorReason: v.reason });
  const { signature, authorization: a } = pp.payload;
  const sig = ethers.Signature.from(signature);
  try {
    const tx = await token.transferWithAuthorization(
      a.from, a.to, a.value, a.validAfter, a.validBefore, a.nonce, sig.v, sig.r, sig.s
    );
    const receipt = await tx.wait();
    if (receipt.status !== 1) throw new Error('tx reverted');
    return send(res, 200, {
      success: true, transaction: tx.hash, network: NETWORK, payer: a.from,
    });
  } catch (e) {
    return send(res, 500, { success: false, errorReason: String(e.message || e).slice(0, 200) });
  }
});

server.listen(PORT, () => console.log(`x402 facilitator on :${PORT} (network ${NETWORK})`));
