// Shared plumbing for the piko-* registry scripts.
// Security: the seller key comes ONLY from env PIKO_SELLER_KEY.
// It is never printed, never written to disk, never embedded in a URL.
const { ethers } = require('ethers');

const REGISTRY_ABI = [
  'function register(bytes32,string,uint256,address,string)',
  'function setPrice(bytes32,uint256)',
  'function setActive(bytes32,bool)',
  'function get(bytes32) view returns (tuple(address owner,string endpoint,uint256 pricePerCall,address payTo,string meta,bool active))',
];
const WUSDC_ABI = ['function balanceOf(address) view returns (uint256)'];

function arg(name, def = null) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
function needArg(name) {
  const v = arg(name);
  if (!v) { console.error(`missing --${name}`); process.exit(1); }
  return v;
}
// --id accepts a seed string (hashed to bytes32) or a literal 0x bytes32 id.
function serviceId(s) {
  if (/^0x[0-9a-fA-F]{64}$/.test(s)) return s;
  return ethers.keccak256(ethers.toUtf8Bytes(s));
}
async function rpcProvider() {
  const rpcs = [
    process.env.PIKO_RPC,
    'http://127.0.0.1:8545',
    'https://pikochain.serveousercontent.com',
  ].filter(Boolean);
  for (const url of rpcs) {
    try {
      const p = new ethers.JsonRpcProvider(url, undefined, { timeout: 8000 });
      await p.getBlockNumber();
      return p;
    } catch { /* try next */ }
  }
  console.error('no reachable PikoChain RPC');
  process.exit(1);
}
async function registryContract(signerOrProvider) {
  const registryAddr = process.env.PIKO_REGISTRY || '0x7aE738fA0652761cFd0347b8D387461877417a74';
  return new ethers.Contract(registryAddr, REGISTRY_ABI, signerOrProvider);
}
function sellerWallet(provider) {
  const key = process.env.PIKO_SELLER_KEY;
  if (!key) {
    console.error('PIKO_SELLER_KEY is not set — export it (never hardcode, never print it)');
    process.exit(1);
  }
  return new ethers.Wallet(key.trim(), provider);
}
const WUSDC = process.env.PIKO_WUSDC || '0x83de4653D2851Ff2175e71683054B876ABA55533';

module.exports = { arg, needArg, serviceId, rpcProvider, registryContract, sellerWallet, WUSDC_ABI, WUSDC, ethers };
