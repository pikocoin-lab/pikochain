// Registers the 3 new PikoPay demo services in PikoPayRegistry.
// Uses the local unlocked signer account (no private key handled here).
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const RPC = 'http://127.0.0.1:8545';
const SIGNER = '0xc4c319e7f366224f2ff2bbb8b8fc0c2de5b99084';
const PUBLIC = 'https://pikochain.serveousercontent.com';
const SELLER = '0xc59Ff0d9C33f03E5bf126E05aac4FA53F2720d35'; // demo merchant (from on-chain record)

const SERVICES = [
  {
    seed: 'pikopay-demo-translate',
    endpoint: `${PUBLIC}/x402/translate`,
    price: 20000n, // $0.02 wUSDC
    meta: 'PikoPay demo: EN->ZH dictionary translation, $0.02 per call, x402 on PikoChain',
  },
  {
    seed: 'pikopay-demo-chaindata',
    endpoint: `${PUBLIC}/x402/chaindata`,
    price: 10000n, // $0.01 wUSDC
    meta: 'PikoPay demo: live PikoChain data (block, balances), $0.01 per call, x402 on PikoChain',
  },
  {
    seed: 'pikopay-demo-ask',
    endpoint: `${PUBLIC}/x402/ask`,
    price: 10000n, // $0.01 wUSDC
    meta: 'PikoPay demo: rule-based PikoChain Q&A, $0.01 per call, x402 on PikoChain',
  },
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const signer = await provider.getSigner(SIGNER);
  const artifacts = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts.json'), 'utf8'));
  const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, '../deployment.json'), 'utf8'));
  const registry = new ethers.Contract(deployment.registry, artifacts.PikoPayRegistry.abi, signer);

  const out = {};
  for (const s of SERVICES) {
    const id = ethers.keccak256(ethers.toUtf8Bytes(s.seed));
    const existing = await registry.get(id);
    if (existing.owner !== ethers.ZeroAddress) {
      console.log(`${s.seed}: already registered (${id}), owner ${existing.owner} — skipping`);
      out[s.seed] = { id, skipped: true };
      continue;
    }
    const tx = await registry.register(id, s.endpoint, s.price, SELLER, s.meta);
    const receipt = await tx.wait();
    if (receipt.status !== 1) throw new Error(`register reverted for ${s.seed}`);
    console.log(`${s.seed}: registered id=${id} tx=${tx.hash}`);
    out[s.seed] = { id, tx: tx.hash };
  }
  fs.writeFileSync(path.join(__dirname, '../service-registration.json'), JSON.stringify(out, null, 2));
  console.log('service-registration.json written');
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
