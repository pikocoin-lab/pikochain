// x402 v2 upgrade tests: v1 regression + v2 exact + v2 upto + negative cases.
// v1 regression reuses scripts/test-services.js logic via X-PAYMENT.
// v2 exact: PAYMENT-SIGNATURE header, v2 payload shape, PAYMENT-REQUIRED/RESPONSE headers.
// v2 upto: approve facilitator for max, sign UptoAuthorization, metered settle, replay rejection.
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const BASE = 'http://127.0.0.1:8091';
const FAC = 'http://127.0.0.1:8090';
const RPC = 'http://127.0.0.1:8545';

const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, '../deployment.json'), 'utf8'));
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '../demo-keys.json'), 'utf8'));
const artifacts = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts.json'), 'utf8'));

const EIP3009_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' }, { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' }, { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' }, { name: 'nonce', type: 'bytes32' },
  ],
};
const UPTO_TYPES = {
  UptoAuthorization: [
    { name: 'from', type: 'address' }, { name: 'payTo', type: 'address' },
    { name: 'maxAmount', type: 'uint256' }, { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' }, { name: 'nonce', type: 'bytes32' },
  ],
};

const results = [];
function ok(name, detail) { console.log(`[OK] ${name}${detail ? ' — ' + detail : ''}`); results.push({ name, ok: true, detail }); }
function fail(name, detail) { console.log(`[FAIL] ${name} — ${detail}`); results.push({ name, ok: false, detail }); }

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64');
const unb64 = (s) => JSON.parse(Buffer.from(s, 'base64').toString('utf8'));

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const token = new ethers.Contract(deployment.wusdc, artifacts.WUSDCv2.abi, provider);
  const buyer = new ethers.Wallet(keys.buyer.privateKey, provider);
  const sellerAddr = keys.seller.address;

  // ---- 1. facilitator /supported (v2 discovery) ----
  try {
    const s = await (await fetch(`${FAC}/supported`)).json();
    const kinds = (s.kinds || []).map((k) => `${k.scheme}@${k.network}`).sort();
    if (kinds.includes('exact@eip155:2049') && kinds.includes('upto@eip155:2049')
        && s.signers && s.signers['eip155:*'] && s.signers['eip155:*'].length)
      ok('/supported v2', kinds.join(', '));
    else fail('/supported v2', 'missing kinds/signers: ' + JSON.stringify(s).slice(0, 200));
  } catch (e) { fail('/supported v2', e.message); }

  // ---- 2. v1 regression: X-PAYMENT still works (insight) ----
  try {
    let r = await fetch(`${BASE}/api/insight`);
    if (r.status !== 402) throw new Error(`402 expected, got ${r.status}`);
    const req402 = await r.json();
    const accept = req402.accepts.find((a) => a.network === 'eip155:2049');
    const now = Math.floor(Date.now() / 1000);
    const authorization = {
      from: buyer.address, to: accept.payTo, value: accept.maxAmountRequired,
      validAfter: (now - 60).toString(), validBefore: (now + 600).toString(),
      nonce: ethers.hexlify(ethers.randomBytes(32)),
    };
    const signature = await buyer.signTypedData(
      { name: 'Wrapped USD Coin', version: '1', chainId: 2049, verifyingContract: deployment.wusdc },
      EIP3009_TYPES, authorization);
    const pp = { x402Version: 1, scheme: 'exact', network: 'eip155:2049', payload: { signature, authorization } };
    r = await fetch(`${BASE}/api/insight`, { headers: { 'X-PAYMENT': b64(pp) } });
    const body = await r.json();
    if (r.status === 200 && body.tx) ok('v1 regression (X-PAYMENT)', `tx=${body.tx.slice(0, 18)}…`);
    else fail('v1 regression (X-PAYMENT)', `${r.status} ${JSON.stringify(body).slice(0, 160)}`);
  } catch (e) { fail('v1 regression (X-PAYMENT)', e.message); }

  // ---- 3. v2 exact: PAYMENT-SIGNATURE + v2 headers ----
  try {
    let r = await fetch(`${BASE}/api/insight`);
    const prHeader = r.headers.get('payment-required');
    if (r.status !== 402 || !prHeader) throw new Error(`402 + PAYMENT-REQUIRED expected, got ${r.status}`);
    const pr = unb64(prHeader);
    if (pr.x402Version !== 2 || !pr.accepts || !pr.resource) throw new Error('bad v2 PaymentRequired shape');
    const accept = pr.accepts.find((a) => a.scheme === 'exact' && a.network === 'eip155:2049');
    if (!accept) throw new Error('no exact/eip155:2049 in accepts');
    ok('v2 402 PAYMENT-REQUIRED', `accepts: ${pr.accepts.map((a) => a.scheme).join(',')}`);
    const now = Math.floor(Date.now() / 1000);
    const authorization = {
      from: buyer.address, to: accept.payTo, value: accept.amount,
      validAfter: (now - 60).toString(), validBefore: (now + 600).toString(),
      nonce: ethers.hexlify(ethers.randomBytes(32)),
    };
    const signature = await buyer.signTypedData(
      { name: accept.extra.name, version: accept.extra.version, chainId: 2049, verifyingContract: deployment.wusdc },
      EIP3009_TYPES, authorization);
    const payload = { x402Version: 2, accepted: accept, payload: { signature, authorization } };
    r = await fetch(`${BASE}/api/insight`, { headers: { 'PAYMENT-SIGNATURE': b64(payload) } });
    const body = await r.json();
    const prResp = r.headers.get('payment-response');
    if (r.status === 200 && body.tx && prResp) {
      const sr = unb64(prResp);
      if (sr.success && sr.transaction === body.tx) ok('v2 exact (PAYMENT-SIGNATURE)', `tx=${body.tx.slice(0, 18)}…`);
      else fail('v2 exact (PAYMENT-SIGNATURE)', 'PAYMENT-RESPONSE mismatch');
    } else fail('v2 exact (PAYMENT-SIGNATURE)', `${r.status} ${JSON.stringify(body).slice(0, 160)}`);
  } catch (e) { fail('v2 exact (PAYMENT-SIGNATURE)', e.message); }

  // ---- 4. v2 exact negative: tampered signature -> 402 ----
  try {
    let r = await fetch(`${BASE}/api/insight`);
    const pr = unb64(r.headers.get('payment-required'));
    const accept = pr.accepts.find((a) => a.scheme === 'exact');
    const now = Math.floor(Date.now() / 1000);
    const authorization = {
      from: buyer.address, to: accept.payTo, value: accept.amount,
      validAfter: (now - 60).toString(), validBefore: (now + 600).toString(),
      nonce: ethers.hexlify(ethers.randomBytes(32)),
    };
    let signature = await buyer.signTypedData(
      { name: accept.extra.name, version: accept.extra.version, chainId: 2049, verifyingContract: deployment.wusdc },
      EIP3009_TYPES, authorization);
    signature = signature.slice(0, -2) + (signature.slice(-2) === '00' ? 'ff' : '00'); // tamper
    const payload = { x402Version: 2, accepted: accept, payload: { signature, authorization } };
    r = await fetch(`${BASE}/api/insight`, { headers: { 'PAYMENT-SIGNATURE': b64(payload) } });
    if (r.status === 402) ok('v2 exact invalid signature rejected', 'got 402');
    else fail('v2 exact invalid signature rejected', `expected 402, got ${r.status}`);
  } catch (e) { fail('v2 exact invalid signature rejected', e.message); }

  // ---- 5. v2 upto: metered translate ----
  let uptoPayload = null, uptoAccept = null;
  try {
    const text = 'hello blockchain world payment agent';
    let r = await fetch(`${BASE}/api/upto-translate?text=${encodeURIComponent(text)}&to=zh`);
    if (r.status !== 402) throw new Error(`402 expected, got ${r.status}`);
    const pr = unb64(r.headers.get('payment-required'));
    uptoAccept = pr.accepts.find((a) => a.scheme === 'upto' && a.network === 'eip155:2049');
    if (!uptoAccept) throw new Error('no upto accept entry');
    if (uptoAccept.extra.assetTransferMethod !== 'piko-allowance' || !uptoAccept.extra.facilitatorAddress)
      throw new Error('upto extra missing piko-allowance/facilitatorAddress');
    ok('v2 upto 402', `max=$${Number(uptoAccept.amount) / 1e6} rate=$${Number(uptoAccept.extra.pricePerUnit) / 1e6}/${uptoAccept.extra.unit}`);

    // approve facilitator for the max (one-time; PikoChain gas ~ zero)
    const tokenW = new ethers.Contract(deployment.wusdc, artifacts.WUSDCv2.abi, buyer);
    const allowBefore = await token.allowance(buyer.address, uptoAccept.extra.facilitatorAddress);
    if (allowBefore < BigInt(uptoAccept.amount)) {
      const atx = await tokenW.approve(uptoAccept.extra.facilitatorAddress, uptoAccept.amount);
      await atx.wait();
    }
    const now = Math.floor(Date.now() / 1000);
    const uptoAuthorization = {
      from: buyer.address, payTo: uptoAccept.payTo, maxAmount: uptoAccept.amount,
      validAfter: (now - 60).toString(), validBefore: (now + 900).toString(),
      nonce: ethers.hexlify(ethers.randomBytes(32)),
    };
    const signature = await buyer.signTypedData(
      { name: 'PikoChain x402 Upto', version: '1', chainId: 2049, verifyingContract: uptoAccept.extra.facilitatorAddress },
      UPTO_TYPES, uptoAuthorization);
    uptoPayload = { x402Version: 2, accepted: uptoAccept, payload: { signature, uptoAuthorization } };

    const sellerBefore = await token.balanceOf(sellerAddr);
    const buyerBefore = await token.balanceOf(buyer.address);
    r = await fetch(`${BASE}/api/upto-translate?text=${encodeURIComponent(text)}&to=zh`,
      { headers: { 'PAYMENT-SIGNATURE': b64(uptoPayload) } });
    const body = await r.json();
    if (r.status !== 200) throw new Error(`200 expected, got ${r.status}: ${JSON.stringify(body).slice(0, 200)}`);
    const sellerAfter = await token.balanceOf(sellerAddr);
    const buyerAfter = await token.balanceOf(buyer.address);
    const words = body.translated.split(/\s+/).filter(Boolean).length;
    const expected = BigInt(words) * BigInt(uptoAccept.extra.pricePerUnit);
    const gotSeller = sellerAfter - sellerBefore;
    const spentBuyer = buyerBefore - buyerAfter;
    if (gotSeller === expected && spentBuyer === expected && expected < BigInt(uptoAccept.amount)) {
      ok('v2 upto metered settle', `${words} words -> charged $${Number(expected) / 1e6} (< max $${Number(uptoAccept.amount) / 1e6}), tx=${body.tx.slice(0, 18)}…`);
    } else {
      fail('v2 upto metered settle', `expected ${expected}, seller+${gotSeller} buyer-${spentBuyer}`);
    }
    // PAYMENT-RESPONSE carries actual amount (upto extension)
    const sr = unb64(r.headers.get('payment-response'));
    if (sr.amount === expected.toString()) ok('v2 upto PAYMENT-RESPONSE amount', sr.amount);
    else fail('v2 upto PAYMENT-RESPONSE amount', JSON.stringify(sr).slice(0, 160));
  } catch (e) { fail('v2 upto metered settle', e.message); }

  // ---- 6. v2 upto replay: same auth again -> 402 ----
  try {
    if (!uptoPayload) throw new Error('skipped (upto setup failed)');
    const r = await fetch(`${BASE}/api/upto-translate?text=hello&to=zh`,
      { headers: { 'PAYMENT-SIGNATURE': b64(uptoPayload) } });
    if (r.status === 402) ok('v2 upto replay rejected', 'got 402 (nonce consumed)');
    else fail('v2 upto replay rejected', `expected 402, got ${r.status}`);
  } catch (e) { fail('v2 upto replay rejected', e.message); }

  // ---- 7. v2 upto over-max settle attempt (facilitator-level) ----
  try {
    if (!uptoAccept) throw new Error('skipped');
    const now = Math.floor(Date.now() / 1000);
    const uptoAuthorization = {
      from: buyer.address, payTo: uptoAccept.payTo, maxAmount: uptoAccept.amount,
      validAfter: (now - 60).toString(), validBefore: (now + 900).toString(),
      nonce: ethers.hexlify(ethers.randomBytes(32)),
    };
    const signature = await buyer.signTypedData(
      { name: 'PikoChain x402 Upto', version: '1', chainId: 2049, verifyingContract: uptoAccept.extra.facilitatorAddress },
      UPTO_TYPES, uptoAuthorization);
    const payload = { x402Version: 2, accepted: uptoAccept, payload: { signature, uptoAuthorization } };
    const overMax = (BigInt(uptoAccept.amount) + 1n).toString();
    const sr = await (await fetch(`${FAC}/settle`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayload: payload, paymentRequirements: { ...uptoAccept, amount: overMax } }),
    })).json();
    if (!sr.success && /exceeds authorized maximum/.test(sr.errorReason || ''))
      ok('v2 upto over-max settle rejected', sr.errorReason);
    else fail('v2 upto over-max settle rejected', JSON.stringify(sr).slice(0, 160));
  } catch (e) { fail('v2 upto over-max settle rejected', e.message); }

  const failed = results.filter((x) => !x.ok);
  console.log(`\nRESULT: ${results.length - failed.length}/${results.length} passed${failed.length ? `, ${failed.length} FAILED` : ''}`);
  fs.writeFileSync('/tmp/x402-v2-test.json', JSON.stringify(results, null, 2));
  if (failed.length) process.exit(1);
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
