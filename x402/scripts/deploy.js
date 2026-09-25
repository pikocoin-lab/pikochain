// Deploys wUSDC to PikoChain and funds demo wallets.
// Uses node1's already-unlocked signer via eth_sendTransaction (no passwords handled here).
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const RPC = 'http://127.0.0.1:8545';
const SIGNER = '0xc4c319e7f366224f2ff2bbb8b8fc0c2de5b99084'; // node1 unlocked signer

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const net = await provider.getNetwork();
  if (net.chainId !== 2049n) throw new Error('not PikoChain!');
  console.log('chainId ok:', net.chainId.toString());

  const signer = await provider.getSigner(SIGNER);
  const { abi, bytecode } = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../artifacts.json'), 'utf8')
  );

  console.log('deploying wUSDC...');
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const token = await factory.deploy();
  await token.waitForDeployment();
  const wusdc = await token.getAddress();
  console.log('wUSDC deployed at:', wusdc);

  // Fresh demo wallets (test dust only)
  const buyer = ethers.Wallet.createRandom();
  const seller = ethers.Wallet.createRandom();
  const facilitator = ethers.Wallet.createRandom();

  const dust = ethers.parseEther('0.05');
  for (const w of [buyer, seller, facilitator]) {
    const tx = await signer.sendTransaction({ to: w.address, value: dust });
    await tx.wait();
  }
  console.log('demo wallets funded with PIKO dust');

  // Mint wUSDC (6 decimals)
  for (const [to, amt] of [[buyer.address, 10_000_000000n], [seller.address, 1_000_000000n]]) {
    const tx = await token.mint(to, amt);
    await tx.wait();
  }
  console.log('minted wUSDC: buyer 10000, seller 1000');

  fs.writeFileSync(
    path.join(__dirname, '../deployment.json'),
    JSON.stringify({ chainId: 2049, network: 'eip155:2049', wusdc, deployer: SIGNER, rpc: RPC }, null, 2)
  );
  fs.writeFileSync(
    path.join(__dirname, '../demo-keys.json'),
    JSON.stringify(
      {
        note: 'DEMO ONLY - throwaway wallets with test dust on PikoChain',
        buyer: { address: buyer.address, privateKey: buyer.privateKey },
        seller: { address: seller.address, privateKey: seller.privateKey },
        facilitator: { address: facilitator.address, privateKey: facilitator.privateKey },
      },
      null, 2
    )
  );
  console.log('saved deployment.json + demo-keys.json');
  console.log('buyer:      ', buyer.address);
  console.log('seller:     ', seller.address);
  console.log('facilitator:', facilitator.address);
}

main().catch((e) => { console.error(e); process.exit(1); });
