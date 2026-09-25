// End-to-end x402 test for the 3 new demo services (+ regression check on insight).
// Flow per service: GET -> 402 -> sign EIP-712 -> GET with X-PAYMENT -> 200.
// Uses the existing demo buyer key (same flow as scripts/buyer.js); key never printed.
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const BASE = 'http://127.0.0.1:8091';
const RPC = 'http://127.0.0.1:8545';
const SERVICES = [
  { name: 'translate', url: `${BASE}/api/translate?text=hello%20blockchain%20world&to=zh` },
  { name: 'chaindata', url: `${BASE}/api/chaindata?action=blockNumber` },
  { name: 'chaindata-balance', url: `${BASE}/api/chaindata?action=pikoBalance&address=0xc4c319e7f366224f2ff2bbb8b8fc0c2de5b99084` },
  { name: 'ask', url: `${BASE}/api/ask?q=what%20is%20the%20chain%20id` },
  { name: 'insight', url: `${BASE}/api/insight` }, // regression
];

const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, '../deployment.json'), 'utf8'));
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '../demo-keys.json'), 'utf8'));
const artifacts = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts.json'), 'utf8'));

const TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' }, { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' }, { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' }, { name: 'nonce', type: 'bytes32' },
  ],
};

async function payFor(url, buyer) {
  let r = await fetch(url);
  if (r.status !== 402) throw new Error(`expected 402, got ${r.status}`);
  const req402 = await r.json();
  const accept = req402.accepts.find((a) => a.network === 'eip155:2049');
  if (!accept) throw new Error('no eip155:2049 option');
  const now = Math.floor(Date.now() / 1000);
  const authorization = {
    from: buyer.address,
    to: accept.payTo,
    value: accept.maxAmountRequired,
    validAfter: (now - 60).toString(),
    validBefore: (now + 600).toString(),
    nonce: ethers.hexlify(ethers.randomBytes(32)),
  };
  const signature = await buyer.signTypedData(
    { name: 'Wrapped USD Coin', version: '1', chainId: 2049, verifyingContract: deployment.wusdc },
    TYPES, authorization);
  const paymentPayload = { x402Version: 1, scheme: 'exact', network: 'eip155:2049', payload: { signature, authorization } };
  r = await fetch(url, {
    headers: { 'X-PAYMENT': Buffer.from(JSON.stringify(paymentPayload)).toString('base64') },
  });
  const body = await r.json();
  if (r.status !== 200) throw new Error(`payment failed: ${r.status} ${JSON.stringify(body).slice(0, 160)}`);
  return { price: accept.maxAmountRequired, tx: body.tx, body };
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const token = new ethers.Contract(deployment.wusdc, artifacts.WUSDCv2.abi, provider);
  const buyer = new ethers.Wallet(keys.buyer.privateKey);
  const sellerAddr = keys.seller.address;

  const balBefore = await token.balanceOf(buyer.address);
  const sellerBefore = await token.balanceOf(sellerAddr);
  console.log('buyer wUSDC before: ', (balBefore / 1000000n).toString());

  const results = [];
  for (const s of SERVICES) {
    try {
      const { price, tx, body } = await payFor(s.url, buyer);
      console.log(`[OK] ${s.name}: paid $${(Number(price) / 1e6).toFixed(2)} tx=${tx}`);
      console.log(`     response: ${JSON.stringify(body).slice(0, 220)}`);
      results.push({ service: s.name, ok: true, price, tx });
    } catch (e) {
      console.log(`[FAIL] ${s.name}: ${e.message}`);
      results.push({ service: s.name, ok: false, error: e.message });
    }
  }

  const balAfter = await token.balanceOf(buyer.address);
  const sellerAfter = await token.balanceOf(sellerAddr);
  const fmt = (v) => (Number(v) / 1e6).toFixed(6);
  console.log('buyer wUSDC after:  ', fmt(balAfter));
  console.log('buyer spent total:  ', fmt(balBefore - balAfter), 'wUSDC');
  console.log('seller received:   +', fmt(sellerAfter - sellerBefore), 'wUSDC');
  const failed = results.filter((r) => !r.ok);
  console.log(failed.length ? `RESULT: ${failed.length} FAILED` : 'RESULT: ALL PASSED');
  fs.writeFileSync('/tmp/x402-new-services-test.json', JSON.stringify(results, null, 2));
  if (failed.length) process.exit(1);
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
