const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractsDir = path.join(__dirname, '../contracts');
const sources = {};
for (const f of fs.readdirSync(contractsDir)) {
  if (f.endsWith('.sol')) sources[f] = { content: fs.readFileSync(path.join(contractsDir, f), 'utf8') };
}
const input = {
  language: 'Solidity',
  sources,
  settings: {
    evmVersion: 'london',
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
  },
};
const out = JSON.parse(solc.compile(JSON.stringify(input)));
if (out.errors) {
  for (const e of out.errors) console.log(e.formattedMessage);
  if (out.errors.some((e) => e.severity === 'error')) process.exit(1);
}
const artifacts = {};
for (const [file, contracts] of Object.entries(out.contracts)) {
  for (const [name, c] of Object.entries(contracts)) {
    if (name.startsWith('I')) continue;
    artifacts[name] = { abi: c.abi, bytecode: c.evm.bytecode.object };
    console.log(`compiled ${name}: ${c.evm.bytecode.object.length / 2} bytes`);
  }
}
fs.writeFileSync(path.join(__dirname, '../artifacts.json'), JSON.stringify(artifacts, null, 2));
console.log('artifacts.json written');
