// Deploys PikoPay network contracts: Registry, Stream, Settler.
// Then registers the demo insight service in the registry.
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const RPC = 'http://127.0.0.1:8545';
const SIGNER = '0xc4c319e7f366224f2ff2bbb8b8fc0c2de5b99084';

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const signer = await provider.getSigner(SIGNER);
  const artifacts = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts.json'), 'utf8'));
  const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, '../deployment.json'), 'utf8'));
  const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '../demo-keys.json'), 'utf8'));

  const addrs = {};
  for (const name of ['PikoPayRegistry', 'PikoStream', 'PikoPaySettler']) {
    const f = new ethers.ContractFactory(artifacts[name].abi, artifacts[name].bytecode, signer);
    const c = await f.deploy();
    await c.waitForDeployment();
    addrs[name] = await c.getAddress();
    console.log(`${name}: ${addrs[name]}`);
  }

  // register demo service
  const registry = new ethers.Contract(addrs.PikoPayRegistry, artifacts.PikoPayRegistry.abi, signer);
  const serviceId = ethers.keccak256(ethers.toUtf8Bytes('pikopay-demo-insight'));
  const tx = await registry.register(
    serviceId,
    'http://127.0.0.1:8091/api/insight',
    10000, // $0.01 in wUSDC
    keys.seller.address,
    'PikoPay demo: AI insight API, $0.01 per call, x402 on PikoChain'
  );
  await tx.wait();
  console.log('registered demo service:', serviceId);

  deployment.registry = addrs.PikoPayRegistry;
  deployment.stream = addrs.PikoStream;
  deployment.settler = addrs.PikoPaySettler;
  deployment.demoServiceId = serviceId;
  fs.writeFileSync(path.join(__dirname, '../deployment.json'), JSON.stringify(deployment, null, 2));
  console.log('deployment.json updated');
}
main().catch((e) => { console.error(e); process.exit(1); });
