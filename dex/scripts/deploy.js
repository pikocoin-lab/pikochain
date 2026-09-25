// Deploys PikoSwap: WPIKO, Factory, Router; creates WPIKO/wUSDC pool;
// seeds initial liquidity: 1000 WPIKO + 1000 wUSDC (price: 1 PIKO = $1).
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const RPC = 'http://127.0.0.1:8545';
const SIGNER = '0xc4c319e7f366224f2ff2bbb8b8fc0c2de5b99084'; // unlocked node key, wUSDC owner
const WUSDC = '0x68ac954700Fc1D0592721f1A5e785A8393253385';

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const signer = await provider.getSigner(SIGNER);
  const artifacts = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts.json'), 'utf8'));
  const x402artifacts = JSON.parse(fs.readFileSync(path.join(__dirname, '../../x402/artifacts.json'), 'utf8'));

  async function deploy(name, ...args) {
    const f = new ethers.ContractFactory(artifacts[name].abi, artifacts[name].bytecode, signer);
    const c = await f.deploy(...args);
    await c.waitForDeployment();
    const addr = await c.getAddress();
    console.log(`${name}: ${addr}`);
    return { contract: c, address: addr };
  }

  const wpiko = await deploy('WPIKO');
  const factory = await deploy('PikoSwapFactory');
  const router = await deploy('PikoSwapRouter', factory.address, wpiko.address);

  const wusdc = new ethers.Contract(WUSDC, x402artifacts.WUSDC.abi, signer);
  const wpikoC = new ethers.Contract(wpiko.address, artifacts.WPIKO.abi, signer);
  const routerC = new ethers.Contract(router.address, artifacts.PikoSwapRouter.abi, signer);

  // mint 2000 wUSDC (signer is owner) + wrap 1000 native PIKO
  await (await wusdc.mint(SIGNER, 2000_000000n)).wait();
  console.log('minted 2000 wUSDC');
  await (await wpikoC.deposit({ value: ethers.parseEther('1000') })).wait();
  console.log('wrapped 1000 PIKO -> WPIKO');

  // approve router
  await (await wusdc.approve(router.address, ethers.MaxUint256)).wait();
  await (await wpikoC.approve(router.address, ethers.MaxUint256)).wait();

  // add liquidity: 1000 WPIKO + 1000 wUSDC
  const deadline = Math.floor(Date.now() / 1000) + 600;
  const tx = await routerC.addLiquidity(
    wpiko.address, WUSDC,
    ethers.parseEther('1000'), 1000_000000n,
    0, 0, SIGNER, deadline
  );
  const receipt = await tx.wait();
  console.log('liquidity added, tx:', tx.hash);

  const pairAddr = await new ethers.Contract(factory.address, artifacts.PikoSwapFactory.abi, provider)
    .getPair(wpiko.address, WUSDC);
  const pair = new ethers.Contract(pairAddr, artifacts.PikoSwapPair.abi, provider);
  const [r0, r1] = await pair.getReserves();
  const t0 = await pair.token0();
  console.log(`pair: ${pairAddr}`);
  console.log(`reserves: token0=${r0} token1=${r1} (token0=${t0})`);

  const deployment = {
    wpiko: wpiko.address, factory: factory.address, router: router.address,
    pair_WPIKO_wUSDC: pairAddr, wusdc: WUSDC, chainId: 2049,
  };
  fs.writeFileSync(path.join(__dirname, '../deployment.json'), JSON.stringify(deployment, null, 2));
  console.log('deployment.json written');
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
