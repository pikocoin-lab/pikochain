// Deploys PikoHTLC to any EVM network listed in ../networks.json.
// Usage:
//   HTLC_PRIVATE_KEY=0x... NODE_PATH=~/workspace/my-chain/x402/node_modules \
//     node scripts/deploy_htlc.js <network>
// Example:
//   HTLC_PRIVATE_KEY=0x... NODE_PATH=~/workspace/my-chain/x402/node_modules \
//     node scripts/deploy_htlc.js arc
//
// The deployer wallet must hold the network's native gas token.
// Private key comes ONLY from the HTLC_PRIVATE_KEY env var — never stored.
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

async function main() {
  const net = process.argv[2];
  const networks = JSON.parse(fs.readFileSync(path.join(__dirname, '../networks.json'), 'utf8'));
  if (!net || !networks[net]) {
    throw new Error(`unknown network. choices: ${Object.keys(networks).filter((k) => k !== 'pikochain').join(', ')}`);
  }
  const cfg = networks[net];
  if (cfg.home) throw new Error('pikochain already has HTLC deployed');

  const pk = process.env.HTLC_PRIVATE_KEY;
  if (!pk || !/^0x[0-9a-fA-F]{64}$/.test(pk)) {
    throw new Error('set HTLC_PRIVATE_KEY env var (0x + 64 hex chars)');
  }

  const provider = new ethers.JsonRpcProvider(cfg.rpc, cfg.chainId, { staticNetwork: true });
  const chainId = Number((await provider.getNetwork()).chainId);
  if (chainId !== cfg.chainId) throw new Error(`chainId mismatch: want ${cfg.chainId}, got ${chainId}`);
  console.log(`connected to ${cfg.name}, block`, await provider.getBlockNumber());

  const wallet = new ethers.Wallet(pk, provider);
  const bal = await provider.getBalance(wallet.address);
  const sym = cfg.nativeCurrency.symbol;
  console.log(`deployer: ${wallet.address} | ${sym} balance:`, ethers.formatUnits(bal, cfg.nativeCurrency.decimals));
  if (bal === 0n) throw new Error(`deployer has no ${sym} — fund it first`);

  const dir = path.join(__dirname, '../contracts');
  const bin = fs.readFileSync(path.join(dir, 'PikoHTLC.bin'), 'utf8').trim();
  const abi = JSON.parse(fs.readFileSync(path.join(dir, 'PikoHTLC_abi.json'), 'utf8'));
  const htlc = await new ethers.ContractFactory(abi, bin, wallet).deploy();
  await htlc.waitForDeployment();
  const addr = await htlc.getAddress();
  console.log(`PikoHTLC on ${cfg.name}: ${addr}`);
  console.log(`explorer: ${cfg.explorer.replace(/\/$/, '')}/address/${addr}`);
  console.log(`\nNext: set "htlc" for "${net}" in evm/networks.json to ${addr}`);
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
