// Deploys wUSDC v2 + PikoUSDBridge on PikoChain.
// After this, ONLY the bridge can mint wUSDC v2 (rule-bound issuance).
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const RPC = 'http://127.0.0.1:8545';
const SIGNER = '0xc4c319e7f366224f2ff2bbb8b8fc0c2de5b99084';

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const signer = await provider.getSigner(SIGNER);
  const artifacts = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts.json'), 'utf8'));

  const wusdcF = new ethers.ContractFactory(artifacts.WUSDCv2.abi, artifacts.WUSDCv2.bytecode, signer);
  const wusdc = await wusdcF.deploy();
  await wusdc.waitForDeployment();
  const wusdcAddr = await wusdc.getAddress();
  console.log('WUSDCv2:', wusdcAddr);

  const bridgeF = new ethers.ContractFactory(artifacts.PikoUSDBridge.abi, artifacts.PikoUSDBridge.bytecode, signer);
  const bridge = await bridgeF.deploy(wusdcAddr, SIGNER); // operator = node key (move to multisig later)
  await bridge.waitForDeployment();
  const bridgeAddr = await bridge.getAddress();
  console.log('PikoUSDBridge:', bridgeAddr);

  // hand mint authority to the bridge — the point of no return
  await (await wusdc.setMinter(bridgeAddr)).wait();
  console.log('minter -> bridge');

  const minter = await wusdc.minter();
  const owner = await wusdc.owner();
  console.log(`verify: minter=${minter} owner=${owner}`);
  if (minter.toLowerCase() !== bridgeAddr.toLowerCase()) throw new Error('minter handoff failed');

  // prove the old owner can NO LONGER mint directly
  try {
    await wusdc.mint(SIGNER, 1);
    throw new Error('SECURITY HOLE: direct mint still possible');
  } catch (e) {
    if (!/not minter/.test(e.message)) throw e;
    console.log('verify: direct owner mint reverts ("not minter") — issuance is rule-bound');
  }

  const deployment = { wusdcV2: wusdcAddr, bridge: bridgeAddr, vaultBase: null, chainId: 2049 };
  fs.writeFileSync(path.join(__dirname, '../deployment.json'), JSON.stringify(deployment, null, 2));
  console.log('deployment.json written');
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
