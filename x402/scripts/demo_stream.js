// PikoStream demo: open channel -> 3 INSTANT off-chain vouchers -> claim latest -> refund.
// Shows the "fast" layer: micropayments in <1ms with zero gas, settled on-chain later.
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const RPC = 'http://127.0.0.1:8545';
const dir = __dirname + '/..';
const deployment = JSON.parse(fs.readFileSync(path.join(dir, 'deployment.json'), 'utf8'));
const keys = JSON.parse(fs.readFileSync(path.join(dir, 'demo-keys.json'), 'utf8'));
const artifacts = JSON.parse(fs.readFileSync(path.join(dir, 'artifacts.json'), 'utf8'));

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const buyer = new ethers.Wallet(keys.buyer.privateKey, provider);   // sender
  const seller = new ethers.Wallet(keys.seller.privateKey, provider); // receiver
  const token = new ethers.Contract(deployment.wusdc, artifacts.WUSDC.abi, provider);
  const stream = new ethers.Contract(deployment.stream, artifacts.PikoStream.abi, provider);

  const deposit = 1_000000n; // 1.00 wUSDC
  const duration = 40;       // seconds
  const channelId = ethers.hexlify(ethers.randomBytes(32));

  await (await token.connect(buyer).approve(deployment.stream, deposit)).wait();
  await (await stream.connect(buyer).open(channelId, seller.address, deployment.wusdc, deposit, duration)).wait();
  console.log('channel opened, deposit 1.00 wUSDC');

  const domain = { name: 'PikoStream', version: '1', chainId: 2049, verifyingContract: deployment.stream };
  const types = { Voucher: [{ name: 'channelId', type: 'bytes32' }, { name: 'cumulativeAmount', type: 'uint256' }] };
  const amounts = [10000n, 20000n, 30000n];
  let lastSig;
  for (const amt of amounts) {
    const s = Date.now();
    lastSig = await buyer.signTypedData(domain, types, { channelId, cumulativeAmount: amt });
    console.log(`voucher $${(Number(amt) / 1e6).toFixed(2)} signed off-chain in ${Date.now() - s}ms — instant, zero gas`);
  }

  const sig = ethers.Signature.from(lastSig);
  const before = await token.balanceOf(seller.address);
  await (await stream.connect(seller).payout(channelId, amounts[2], sig.v, sig.r, sig.s)).wait();
  const after = await token.balanceOf(seller.address);
  console.log(`receiver submitted ONLY the latest voucher -> +${(Number(after - before) / 1e6).toFixed(2)} wUSDC`);
  console.log('3 micropayments, 1 claim tx. Older vouchers need never touch the chain.');

  console.log(`waiting ${duration + 4}s for expiry...`);
  await new Promise((r) => setTimeout(r, (duration + 4) * 1000));
  const bBefore = await token.balanceOf(buyer.address);
  await (await stream.connect(buyer).refund(channelId)).wait();
  const bAfter = await token.balanceOf(buyer.address);
  console.log(`sender refunded +${(Number(bAfter - bBefore) / 1e6).toFixed(2)} wUSDC (unspent remainder)`);
  console.log('DONE: 3 on-chain txs (open/payout/refund) carried N off-chain micropayments.');
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
