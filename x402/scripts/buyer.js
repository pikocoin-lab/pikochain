// x402 buyer demo: pays $0.01 wUSDC for /api/insight on PikoChain.
// Flow: GET -> 402 -> sign EIP-712 authorization -> GET with X-PAYMENT -> 200.
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const RESOURCE = 'http://127.0.0.1:8091/api/insight';
const RPC = 'http://127.0.0.1:8545';

const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, '../deployment.json'), 'utf8'));
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '../demo-keys.json'), 'utf8'));
const artifacts = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts.json'), 'utf8'));
const abi = artifacts.WUSDC.abi;

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const token = new ethers.Contract(deployment.wusdc, abi, provider);
  const buyer = new ethers.Wallet(keys.buyer.privateKey);

  const balBefore = await token.balanceOf(buyer.address);
  const sellerBalBefore = await token.balanceOf(keys.seller.address);
  console.log('buyer wUSDC before:  ', (balBefore / 1000000n).toString());

  // 1. request without payment -> expect 402
  let r = await fetch(RESOURCE);
  console.log('step 1: GET ->', r.status, '(expect 402)');
  if (r.status !== 402) throw new Error('expected 402');
  const req402 = await r.json();
  const accept = req402.accepts.find((a) => a.network === 'eip155:2049');
  if (!accept) throw new Error('no eip155:2049 option');
  console.log('step 2: price', accept.maxAmountRequired, 'payTo', accept.payTo);

  // 2. sign EIP-712 TransferWithAuthorization (gasless for buyer)
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
    { TransferWithAuthorization: [
      { name: 'from', type: 'address' }, { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' }, { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' }, { name: 'nonce', type: 'bytes32' },
    ]},
    authorization
  );
  console.log('step 3: signed authorization (buyer pays zero gas)');

  // 3. retry with X-PAYMENT
  const paymentPayload = { x402Version: 1, scheme: 'exact', network: 'eip155:2049', payload: { signature, authorization } };
  fs.writeFileSync('/tmp/x402-payment.json', JSON.stringify(paymentPayload)); // for replay test
  r = await fetch(RESOURCE, {
    headers: { 'X-PAYMENT': Buffer.from(JSON.stringify(paymentPayload)).toString('base64') },
  });
  console.log('step 4: GET + X-PAYMENT ->', r.status, '(expect 200)');
  const body = await r.json();
  console.log('response:', JSON.stringify(body, null, 2));
  if (r.status !== 200) throw new Error('payment flow failed');

  const fmt = (v) => (Number(v) / 1e6).toFixed(6);
  const balAfter = await token.balanceOf(buyer.address);
  const sellerBalAfter = await token.balanceOf(keys.seller.address);
  console.log('buyer wUSDC after:   ', fmt(balAfter));
  console.log('seller received:      +', fmt(sellerBalAfter - sellerBalBefore), 'wUSDC');
  console.log('buyer spent:          ', fmt(balBefore - balAfter), 'wUSDC');
  console.log('settlement tx:', body.tx);
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
