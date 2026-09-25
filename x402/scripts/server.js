// Demo x402 resource server: GET /api/insight costs $0.01 in wUSDC.
// No X-PAYMENT -> 402 with payment requirements. Valid X-PAYMENT -> verify+settle -> 200.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8091;
const FACILITATOR = 'http://127.0.0.1:8090';
const PRICE = '10000'; // $0.01 in wUSDC (6 decimals)

const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, '../deployment.json'), 'utf8'));
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '../demo-keys.json'), 'utf8'));
const SELLER = keys.seller.address;

const paymentRequirements = {
  x402Version: 1,
  error: 'Payment required: this API costs $0.01 in wUSDC on PikoChain',
  accepts: [{
    scheme: 'exact',
    network: 'eip155:2049',
    maxAmountRequired: PRICE,
    resource: `http://127.0.0.1:${PORT}/api/insight`,
    description: 'PikoChain AI insight API - $0.01 per call',
    mimeType: 'application/json',
    payTo: SELLER,
    maxTimeoutSeconds: 300,
    asset: deployment.wusdc,
    extra: { name: 'Wrapped USD Coin', version: '1' },
  }],
};

async function postJson(url, obj) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  });
  return r.json();
}

const server = http.createServer(async (req, res) => {
  if (req.url !== '/api/insight') {
    res.writeHead(404); res.end('not found'); return;
  }
  const paymentB64 = req.headers['x-payment'];
  if (!paymentB64) {
    res.writeHead(402, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(paymentRequirements));
    return;
  }
  let paymentPayload;
  try {
    paymentPayload = JSON.parse(Buffer.from(paymentB64, 'base64').toString('utf8'));
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'malformed X-PAYMENT header' }));
    return;
  }

  // amount must cover price, payee must be us
  const auth = paymentPayload?.payload?.authorization || {};
  if (BigInt(auth.value || '0') < BigInt(PRICE) || (auth.to || '').toLowerCase() !== SELLER.toLowerCase()) {
    res.writeHead(402, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ...paymentRequirements, error: 'payment amount/payee mismatch' }));
    return;
  }

  const vr = await postJson(`${FACILITATOR}/verify`, { paymentPayload });
  if (!vr.isValid) {
    res.writeHead(402, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ...paymentRequirements, error: `payment invalid: ${vr.invalidReason}` }));
    return;
  }
  const sr = await postJson(`${FACILITATOR}/settle`, { paymentPayload });
  if (!sr.success) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `settlement failed: ${sr.errorReason}` }));
    return;
  }

  const paymentResponseB64 = Buffer.from(JSON.stringify(sr)).toString('base64');
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'PAYMENT-RESPONSE': paymentResponseB64,
  });
  res.end(JSON.stringify({
    insight: 'PikoChain says: the best time to build was yesterday; the second best time is block ' +
      (await (await fetch('http://127.0.0.1:8545', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
      })).json()).result,
    paid: '$0.01 wUSDC',
    tx: sr.transaction,
  }));
});

server.listen(PORT, () => console.log(`x402 demo resource server on :${PORT}  (GET /api/insight = $0.01)`));
