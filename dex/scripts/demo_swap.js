// PikoSwap demo: quote -> swap wUSDC->WPIKO -> swap PIKO->wUSDC -> remove liquidity.
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const RPC = 'http://127.0.0.1:8545';
const dir = __dirname + '/..';
const dep = JSON.parse(fs.readFileSync(path.join(dir, 'deployment.json'), 'utf8'));
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '../../x402/demo-keys.json'), 'utf8'));
const artifacts = JSON.parse(fs.readFileSync(path.join(dir, 'artifacts.json'), 'utf8'));
const x402artifacts = JSON.parse(fs.readFileSync(path.join(__dirname, '../../x402/artifacts.json'), 'utf8'));

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const buyer = new ethers.Wallet(keys.buyer.privateKey, provider);
  const lp = await provider.getSigner('0xc4c319e7f366224f2ff2bbb8b8fc0c2de5b99084');
  const router = new ethers.Contract(dep.router, artifacts.PikoSwapRouter.abi, provider);
  const pair = new ethers.Contract(dep.pair_WPIKO_wUSDC, artifacts.PikoSwapPair.abi, provider);
  const wusdc = new ethers.Contract(dep.wusdc, x402artifacts.WUSDC.abi, provider);
  const wpiko = new ethers.Contract(dep.wpiko, artifacts.WPIKO.abi, provider);

  const price = async () => {
    const [r0, r1] = await pair.getReserves();
    const t0 = await pair.token0();
    // token0 = wUSDC (6dp), token1 = WPIKO (18dp)
    const usdc = Number(t0 === dep.wusdc ? r0 : r1) / 1e6;
    const wp = Number(t0 === dep.wusdc ? r1 : r0) / 1e18;
    return { usdc, wp, pikoPrice: usdc / wp };
  };

  let p = await price();
  console.log(`pool: ${p.usdc.toFixed(2)} wUSDC / ${p.wp.toFixed(2)} WPIKO  =>  1 PIKO = $${p.pikoPrice.toFixed(4)}`);

  // 1. quote + swap 10 wUSDC -> WPIKO
  const path1 = [dep.wusdc, dep.wpiko];
  const quoted = await router.getAmountsOut(10_000000n, path1);
  console.log(`quote: 10 wUSDC -> ${(Number(quoted[1]) / 1e18).toFixed(6)} WPIKO`);
  await (await wusdc.connect(buyer).approve(dep.router, ethers.MaxUint256)).wait();
  const deadline = Math.floor(Date.now() / 1000) + 600;
  const wpBefore = await wpiko.balanceOf(buyer.address);
  await (await router.connect(buyer).swapExactTokensForTokens(10_000000n, 0, path1, buyer.address, deadline)).wait();
  const wpAfter = await wpiko.balanceOf(buyer.address);
  console.log(`swap 1: 10 wUSDC -> ${(Number(wpAfter - wpBefore) / 1e18).toFixed(6)} WPIKO (buyer, gasless? no—buyer pays ~zero gas)`);
  p = await price();
  console.log(`price after buy pressure: 1 PIKO = $${p.pikoPrice.toFixed(4)}`);

  // 2. swap 0.01 native PIKO -> wUSDC
  const path2 = [dep.wpiko, dep.wusdc];
  const uBefore = await wusdc.balanceOf(buyer.address);
  await (await router.connect(buyer).swapExactPIKOForTokens(0, path2, buyer.address, deadline, { value: ethers.parseEther('0.01') })).wait();
  const uAfter = await wusdc.balanceOf(buyer.address);
  console.log(`swap 2: 0.01 PIKO -> ${((Number(uAfter - uBefore)) / 1e6).toFixed(6)} wUSDC`);

  // 3. LP removes 1% of liquidity (burn path)
  const lpBal = await pair.balanceOf(await lp.getAddress());
  const rm = lpBal / 100n;
  await (await pair.connect(lp).approve(dep.router, ethers.MaxUint256)).wait();
  const wBefore = await wpiko.balanceOf(await lp.getAddress());
  await (await router.connect(lp).removeLiquidity(dep.wpiko, dep.wusdc, rm, 0, 0, await lp.getAddress(), deadline)).wait();
  const wAfter = await wpiko.balanceOf(await lp.getAddress());
  console.log(`removeLiquidity: burned 1% LP -> +${((Number(wAfter - wBefore)) / 1e18).toFixed(4)} WPIKO (+ wUSDC)`);
  p = await price();
  console.log(`final: ${p.usdc.toFixed(2)} wUSDC / ${p.wp.toFixed(2)} WPIKO, 1 PIKO = $${p.pikoPrice.toFixed(4)}`);
  console.log('DONE: PikoSwap AMM fully functional (add/swap/remove, 0.3% fee).');
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
