// Deploys PikoHTLC to Circle Arc mainnet (chainId 5042).
// The deployer wallet must hold USDC on Arc (gas is paid in native USDC).
// Private key comes ONLY from the ARC_PRIVATE_KEY env var — never stored.
//
//   ARC_PRIVATE_KEY=0x... NODE_PATH=~/workspace/my-chain/x402/node_modules \
//     node scripts/deploy_htlc_arc.js
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const ARC_RPC = 'https://rpc.mainnet.arc.io';
const ARC_CHAIN_ID = 5042;

async function main() {
  const pk = process.env.ARC_PRIVATE_KEY;
  if (!pk || !/^0x[0-9a-fA-F]{64}$/.test(pk)) {
    throw new Error('set ARC_PRIVATE_KEY env var (0x + 64 hex chars)');
  }
  const provider = new ethers.JsonRpcProvider(ARC_RPC, ARC_CHAIN_ID, { staticNetwork: true });
  const chainId = Number((await provider.getNetwork()).chainId);
  if (chainId !== ARC_CHAIN_ID) throw new Error(`not Arc: chainId=${chainId}`);
  console.log('connected to Arc mainnet, block', await provider.getBlockNumber());

  const wallet = new ethers.Wallet(pk, provider);
  const bal = await provider.getBalance(wallet.address);
  console.log('deployer:', wallet.address, '| native USDC balance:', ethers.formatUnits(bal, 18));
  if (bal === 0n) throw new Error('deployer has no USDC on Arc — fund it first');

  const bin = fs.readFileSync(path.join(__dirname, '../contracts/PikoHTLC.bin'), 'utf8').trim();
  const abi = JSON.parse(fs.readFileSync(path.join(__dirname, '../contracts/PikoHTLC_abi.json'), 'utf8'));
  const factory = new ethers.ContractFactory(abi, bin, wallet);
  const htlc = await factory.deploy();
  await htlc.waitForDeployment();
  const addr = await htlc.getAddress();
  console.log('PikoHTLC on Arc:', addr);
  console.log('explorer: https://explorer.arc.io/address/' + addr);
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
