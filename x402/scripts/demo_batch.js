// Batch settlement demo: buyer signs 5 x402 authorizations,
// facilitator settles ALL FIVE in a single on-chain transaction.
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const RPC = 'http://127.0.0.1:8545';
const FACILITATOR = 'http://127.0.0.1:8090';
const dir = __dirname + '/..';
const deployment = JSON.parse(fs.readFileSync(path.join(dir, 'deployment.json'), 'utf8'));
const keys = JSON.parse(fs.readFileSync(path.join(dir, 'demo-keys.json'), 'utf8'));
const artifacts = JSON.parse(fs.readFileSync(path.join(dir, 'artifacts.json'), 'utf8'));

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const buyer = new ethers.Wallet(keys.buyer.privateKey);
  const token = new ethers.Contract(deployment.wusdc, artifacts.WUSDC.abi, provider);

  const sellerBalBefore = await token.balanceOf(keys.seller.address);
  const now = Math.floor(Date.now() / 1000);
  const payments = [];
  for (let i = 0; i < 5; i++) {
    const authorization = {
      from: buyer.address,
      to: keys.seller.address,
      value: '2000', // $0.002 each
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
    payments.push({ x402Version: 1, scheme: 'exact', network: 'eip155:2049', payload: { signature, authorization } });
  }
  console.log('buyer signed 5 authorizations (gasless)');

  const r = await fetch(`${FACILITATOR}/settleBatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payments }),
  });
  const res = await r.json();
  console.log('settleBatch ->', JSON.stringify(res, null, 2));
  if (!res.success) throw new Error('batch failed');

  const sellerBalAfter = await token.balanceOf(keys.seller.address);
  console.log(`seller +${(Number(sellerBalAfter - sellerBalBefore) / 1e6).toFixed(6)} wUSDC in ONE tx (${res.transaction})`);
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
