// chain-risk-scan: PikoChain address risk report (example piko-seller handler).
// Suggested price: $0.05/call (50000 wUSDC base units) — the seller sets their own.
// GET ?address=0x... -> {
//   address, isContract, codeSize, nativePIKO, pikoERC20, txCount,
//   flags: [...], riskScore: 0-100, riskLevel: 'low'|'medium'|'high', note
// }
// Heuristics are documented and labeled as such — this is a screening aid, not an audit.
const PIKO_TOKEN = '0x14c2bc5130c102d0fa78460eebb1a88a975c785e';

function validate(u) {
  const a = u.searchParams.get('address') || '';
  if (!/^0x[0-9a-fA-F]{40}$/.test(a)) return 'bad or missing ?address= (e.g. ?address=0x...)';
  return null;
}

async function handler(u, ctx) {
  const { ethers, provider } = ctx;
  const address = (u.searchParams.get('address') || '').toLowerCase();

  const [bal, txCount, code] = await Promise.all([
    provider.getBalance(address),
    provider.getTransactionCount(address),
    provider.getCode(address),
  ]);
  const token = new ethers.Contract(PIKO_TOKEN,
    ['function balanceOf(address) view returns (uint256)'], provider);
  const pikoBal = await token.balanceOf(address).catch(() => 0n);

  const isContract = code !== '0x';
  const codeSize = isContract ? (code.length - 2) / 2 : 0;

  const flags = [];
  if (txCount === 0 && bal === 0n && pikoBal === 0n)
    flags.push('virgin-address: no transactions and zero balances');
  if (isContract && codeSize > 24576)
    flags.push('oversize-contract: bytecode exceeds the 24KB Spurious Dragon limit (unusual on this chain)');
  if (isContract && txCount <= 2)
    flags.push('fresh-contract: very few transactions since deployment');
  if (!isContract && txCount > 0 && bal === 0n && pikoBal === 0n)
    flags.push('drained-eoa: transacted before but now holds nothing');
  if (pikoBal > 0n) flags.push('holds PIKO ERC-20');
  if (isContract) flags.push('is-contract');

  // Heuristic score (transparent, not a security proof):
  // fresh/virgin/drained add risk; plain funded EOAs score low.
  let score = 10;
  if (flags.some((f) => f.startsWith('virgin-address'))) score += 25;
  if (flags.some((f) => f.startsWith('drained-eoa'))) score += 30;
  if (flags.some((f) => f.startsWith('fresh-contract'))) score += 20;
  if (flags.some((f) => f.startsWith('oversize-contract'))) score += 25;
  score = Math.min(100, score);
  const riskLevel = score >= 60 ? 'high' : score >= 35 ? 'medium' : 'low';

  return {
    service: 'chain-risk-scan',
    address,
    isContract,
    codeSize,
    nativePIKO: ethers.formatEther(bal),
    pikoERC20: ethers.formatEther(pikoBal),
    txCount,
    flags,
    riskScore: score,
    riskLevel,
    note: 'heuristic screening only — flags describe on-chain shape, not intent; not a security audit',
  };
}

module.exports = {
  name: 'chain-risk-scan',
  description: 'PikoChain address risk scan — balances, contract/code, tx count, heuristic risk score ($0.05/call suggested)',
  validate,
  handler,
};
