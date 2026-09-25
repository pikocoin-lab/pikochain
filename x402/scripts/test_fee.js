// Fee mechanism test for the x402 facilitator.
// Spawns the facilitator on :8099 (does NOT touch the live :8090 instance).
// Phase A: X402_FEE_BPS=0  -> behavior identical to before.
// Phase B: X402_FEE_BPS=100 -> fee enforced, math verified on-chain.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const FAC = 'http://127.0.0.1:8099';
const RPC = 'http://127.0.0.1:8545';
const dir = path.join(__dirname, '..');
const deployment = JSON.parse(fs.readFileSync(path.join(dir, 'deployment.json'), 'utf8'));
const keys = JSON.parse(fs.readFileSync(path.join(dir, 'demo-keys.json'), 'utf8'));
const tokenAbi = JSON.parse(fs.readFileSync(path.join(dir, 'artifacts.json'), 'utf8')).WUSDCv2.abi;

const DOMAIN = { name: 'Wrapped USD Coin', version: '1', chainId: 2049, verifyingContract: deployment.wusdc };
const TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' }, { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' }, { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' }, { name: 'nonce', type: 'bytes32' },
  ],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const provider = new ethers.JsonRpcProvider(RPC);
const token = new ethers.Contract(deployment.wusdc, tokenAbi, provider);
const buyer = new ethers.Wallet(keys.buyer.privateKey);
const seller = keys.seller.address;
const feeRecipient = ethers.Wallet.createRandom().address;
let pass = 0, fail = 0;
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra}`); }
}

async function post(p, obj) {
  const r = await fetch(FAC + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) });
  return { status: r.status, body: await r.json() };
}
async function signAuth(to, value) {
  const now = Math.floor(Date.now() / 1000);
  const authorization = {
    from: buyer.address, to, value: value.toString(),
    validAfter: (now - 60).toString(), validBefore: (now + 600).toString(),
    nonce: ethers.hexlify(ethers.randomBytes(32)),
  };
  const signature = await buyer.signTypedData(DOMAIN, TYPES, authorization);
  return { signature, authorization };
}
const bal = async (a) => await token.balanceOf(a);

async function startFacilitator(extraEnv) {
  const child = spawn('node', ['scripts/facilitator.js'], {
    cwd: dir, env: { ...process.env, X402_PORT: '8099', ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stderr.on('data', (d) => process.stderr.write('[fac] ' + d));
  for (let i = 0; i < 60; i++) {
    try { await post('/verify', {}); return child; } catch { await sleep(250); }
  }
  throw new Error('facilitator did not start');
}
const stop = (child) => child.kill('SIGTERM');

async function main() {
  // ---------- Phase A: fee = 0 ----------
  console.log('Phase A: X402_FEE_BPS=0 (must behave exactly as before)');
  let fac = await startFacilitator({ X402_FEE_BPS: '0' });
  let vr = await post('/verify', {});
  check('verify advertises feeBps=0', vr.body.feeBps === 0, JSON.stringify(vr.body).slice(0, 120));

  const sBefore = await bal(seller), bBefore = await bal(buyer.address);
  const pp = { x402Version: 1, scheme: 'exact', network: 'eip155:2049', payload: await signAuth(seller, 10000n) };
  let sr = await post('/settle', pp);
  check('settle succeeds', sr.body.success === true, JSON.stringify(sr.body).slice(0, 160));
  check('no fee fields in response', sr.body.fee === undefined && sr.body.feeTransaction === undefined);
  check('seller got full 10000', (await bal(seller)) - sBefore === 10000n);
  check('buyer spent exactly 10000', bBefore - (await bal(buyer.address)) === 10000n);
  check('fee recipient got nothing', (await bal(feeRecipient)) === 0n);
  stop(fac); await sleep(500);

  // ---------- Phase B: fee = 100 bps (1%) ----------
  console.log('Phase B: X402_FEE_BPS=100 (1%), recipient=' + feeRecipient);
  fac = await startFacilitator({ X402_FEE_BPS: '100', X402_FEE_RECIPIENT: feeRecipient });
  vr = await post('/verify', {});
  check('verify advertises feeBps=100', vr.body.feeBps === 100, JSON.stringify(vr.body).slice(0, 160));
  check('verify advertises feeRecipient', (vr.body.feeRecipient || '').toLowerCase() === feeRecipient.toLowerCase());

  // B1: missing feePayload -> rejected
  const pp1 = { x402Version: 1, scheme: 'exact', network: 'eip155:2049', payload: await signAuth(seller, 10000n) };
  sr = await post('/settle', pp1);
  check('settle without feePayload rejected', sr.status === 400 && /fee/i.test(sr.body.errorReason || ''), JSON.stringify(sr.body).slice(0, 160));

  // B2: wrong fee amount -> rejected (expected 100, send 99)
  const badFee = await signAuth(feeRecipient, 99n);
  sr = await post('/settle', { ...pp1, feePayload: badFee });
  check('wrong fee amount rejected', sr.status === 400 && /fee/i.test(sr.body.errorReason || ''), JSON.stringify(sr.body).slice(0, 160));

  // B3: correct fee -> success, math exact
  const sB = await bal(seller), bB = await bal(buyer.address), fB = await bal(feeRecipient);
  const main = await signAuth(seller, 10000n);
  const fee = await signAuth(feeRecipient, 100n); // 10000 * 100 / 10000 = 100
  sr = await post('/settle', { x402Version: 1, scheme: 'exact', network: 'eip155:2049', payload: main, feePayload: fee });
  check('settle with fee succeeds', sr.body.success === true, JSON.stringify(sr.body).slice(0, 200));
  check('response reports fee=100', sr.body.fee === '100', JSON.stringify(sr.body).slice(0, 200));
  check('response has feeTransaction', !!sr.body.feeTransaction);
  check('seller got full 10000 (fee on top)', (await bal(seller)) - sB === 10000n);
  check('fee recipient got exactly 100', (await bal(feeRecipient)) - fB === 100n);
  check('buyer spent 10100 total', bB - (await bal(buyer.address)) === 10100n);

  // B4: replay same payloads -> rejected (nonce reuse, both legs)
  sr = await post('/settle', { x402Version: 1, scheme: 'exact', network: 'eip155:2049', payload: main, feePayload: fee });
  check('replay rejected', sr.status === 400, JSON.stringify(sr.body).slice(0, 160));

  // B5: batch with fees — 2 x 2000, fee 20 each
  const sC = await bal(seller), fC = await bal(feeRecipient), bC = await bal(buyer.address);
  const payments = [];
  for (let i = 0; i < 2; i++) {
    payments.push({
      x402Version: 1, scheme: 'exact', network: 'eip155:2049',
      payload: await signAuth(seller, 2000n),
      feePayload: await signAuth(feeRecipient, 20n), // 2000 * 100 / 10000 = 20
    });
  }
  const br = await post('/settleBatch', { payments });
  check('batch with fees succeeds', br.body.success === true && br.body.count === 2, JSON.stringify(br.body).slice(0, 200));
  check('batch: seller +4000', (await bal(seller)) - sC === 4000n);
  check('batch: fee recipient +40', (await bal(feeRecipient)) - fC === 40n);
  check('batch: buyer spent 4040', bC - (await bal(buyer.address)) === 4040n);
  stop(fac);

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
