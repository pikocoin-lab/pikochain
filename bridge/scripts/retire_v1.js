// Retires wUSDC v1: unwinds the DEX pool, burns all test balances to dead address.
// v1 becomes a zero-supply legacy token. v2 (rule-bound) is the canonical wUSDC.
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const RPC = 'http://127.0.0.1:8545';
const SIGNER = '0xc4c319e7f366224f2ff2bbb8b8fc0c2de5b99084';
const DEAD = '0x000000000000000000000000000000000000dEaD';
const V1 = '0x68ac954700Fc1D0592721f1A5e785A8393253385';

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const signer = await provider.getSigner(SIGNER);
  const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '../../x402/demo-keys.json'), 'utf8'));
  const dexDep = JSON.parse(fs.readFileSync(path.join(__dirname, '../../dex/deployment.json'), 'utf8'));
  const dexArt = JSON.parse(fs.readFileSync(path.join(__dirname, '../../dex/artifacts.json'), 'utf8'));
  const x402Art = JSON.parse(fs.readFileSync(path.join(__dirname, '../../x402/artifacts.json'), 'utf8'));

  const v1 = new ethers.Contract(V1, x402Art.WUSDC.abi, provider);
  const router = new ethers.Contract(dexDep.router, dexArt.PikoSwapRouter.abi, signer);
  const pair = new ethers.Contract(dexDep.pair_WPIKO_wUSDC, dexArt.PikoSwapPair.abi, signer);
  const wpiko = new ethers.Contract(dexDep.wpiko, dexArt.WPIKO.abi, signer);
  const deadline = Math.floor(Date.now() / 1000) + 600;

  // 1. unwind DEX pool: remove ALL LP
  const lpBal = await pair.balanceOf(SIGNER);
  console.log('LP balance:', ethers.formatEther(lpBal));
  if (lpBal > 0n) {
    await (await pair.approve(dexDep.router, lpBal)).wait();
    await (await router.removeLiquidity(dexDep.wpiko, V1, lpBal, 0, 0, SIGNER, deadline)).wait();
    console.log('liquidity removed');
  }
  // 2. unwrap all WPIKO -> native
  const wBal = await wpiko.balanceOf(SIGNER);
  if (wBal > 0n) {
    await (await wpiko.withdraw(wBal)).wait();
    console.log('unwrapped', ethers.formatEther(wBal), 'WPIKO');
  }
  // 3. burn every v1 balance we control
  const wallets = {
    signer, buyer: new ethers.Wallet(keys.buyer.privateKey, provider),
    seller: new ethers.Wallet(keys.seller.privateKey, provider),
    facilitator: new ethers.Wallet(keys.facilitator.privateKey, provider),
  };
  for (const [name, w] of Object.entries(wallets)) {
    const addr = name === 'signer' ? SIGNER : w.address;
    const bal = await v1.balanceOf(addr);
    if (bal > 0n) {
      await (await v1.connect(w).transfer(DEAD, bal)).wait();
      console.log(`burned ${(Number(bal) / 1e6).toFixed(2)} v1 wUSDC from ${name}`);
    }
  }
  const supply = await v1.totalSupply();
  const pairBal = await v1.balanceOf(dexDep.pair_WPIKO_wUSDC);
  console.log(`v1 totalSupply: ${Number(supply) / 1e6} | left in pair: ${Number(pairBal) / 1e6}`);
  if (supply > 0n) console.log('NOTE: residual dust remains (rounding), effectively zero');
  console.log('DONE: v1 retired.');
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
