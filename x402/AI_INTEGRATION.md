# PikoChain x402 in 5 lines — for AI agents

Pay for an API call on PikoChain with wUSDC. You sign (EIP-712), you pay **zero gas** —
the facilitator submits the EIP-3009 meta-transaction for you.

## Prerequisites

1. **An EVM private key.** Any wallet works. You only sign; you never spend gas.
2. **$0.05 test wUSDC** (one claim per address, test tokens, no real value):
   ```bash
   curl -X POST https://pikochain.serveousercontent.com/x402/bounty \
     -H 'Content-Type: application/json' \
     -d '{"address": "0xYourAddress"}'
   ```
3. (Optional, for on-chain verification) PikoChain RPC: `https://pikochain.serveousercontent.com`,
   chain ID `2049` (`0x801`), 2-second blocks.

## The 5 lines

```js
const { ethers } = require('ethers');                                   // 1
const { pay } = require('./scripts/pikopay-client');                    // 2
const wallet = new ethers.Wallet('0xYOUR_PRIVATE_KEY');                 // 3
const res = await pay('https://pikochain.serveousercontent.com/x402/insight', wallet); // 4
console.log(res.paid ? 'paid! tx: ' + res.paymentResponse.transaction : 'failed');    // 5
```

`pay()` handles the whole x402 flow for you: `GET` → `402` → sign EIP-712
`TransferWithAuthorization` → retry with `X-PAYMENT` header → `200`.
(`scripts/pikopay-client.js` lives in this repo's `x402/scripts/`; needs `ethers` v6.)

## Verify it worked

- `res.paid === true` and `res.paymentResponse.transaction` is the on-chain settlement hash.
- Look the transaction up: `https://pikochain.serveousercontent.com/explorer.html`
- Your wUSDC balance dropped by exactly `$0.01`; the seller received `$0.01`.

## More demo services

Same 5-line flow, different endpoints (all under `https://pikochain.serveousercontent.com/x402/`).
All settle in test wUSDC on PikoChain; all are registered on-chain in
`PikoPayRegistry` (`0x7aE738fA0652761cFd0347b8D387461877417a74`) — agents can
discover endpoint + price there instead of hardcoding.

| Service | Public URL | Price | What it does |
|---|---|---|---|
| `insight` | `/x402/insight` | $0.01 | AI insight of the day (see above) |
| `translate` | `/x402/translate?text=hello%20world&to=zh` | $0.02 | Demo EN→ZH dictionary translation (word-by-word; unknown words pass through) |
| `chaindata` | `/x402/chaindata?action=blockNumber` | $0.01 | Live chain data: `blockNumber`, or `balance` / `pikoBalance` with `&address=0x…` |
| `ask` | `/x402/ask?q=what%20is%20the%20chain%20id` | $0.01 | Demo rule-based PikoChain Q&A (chain id, rpc, faucet, staking, x402, bridge, nodes…) |
| `upto-translate` | `/x402/upto-translate?text=hello%20world&to=zh` | $0.001/word, $0.10 max | **Metered** EN→ZH translation — x402 v2 `upto`: authorize the max, pay only per word |

```js
const { pay } = require('./scripts/pikopay-client');
const wallet = new ethers.Wallet('0xYOUR_PRIVATE_KEY');

// $0.02 — translate
await pay('https://pikochain.serveousercontent.com/x402/translate?text=hello%20blockchain&to=zh', wallet);
// $0.01 — live block number
await pay('https://pikochain.serveousercontent.com/x402/chaindata?action=blockNumber', wallet);
// $0.01 — ask about PikoChain
await pay('https://pikochain.serveousercontent.com/x402/ask?q=where%20is%20the%20faucet', wallet);
```

Notes:
- `translate`/`ask` are honest demos (dictionary / keyword rules), not LLM calls —
  they exist so agents have more things to actually spend on, not to fake AI.
- Input is validated **before** payment: bad params return `400` without charging you.
- Registry IDs (`keccak256` seeds): `pikopay-demo-translate` → `0x681c18331adb0f185dfb78d15713d5c2498f4c3808b67619f6692d32ba5fa647`,
  `pikopay-demo-chaindata` → `0x9b5cf39584de3963343bf47b0fd4737864f16ae03d105608e4cb90dcb5b00271`,
  `pikopay-demo-ask` → `0x1731bdf3950fce9e40b2646643ecd64ce78dc27b462d82783437aa2ebfb1286b`,
  `pikopay-demo-upto-translate` → `0x64fd22719a26558fbedd79f8dcc114749fef0732176e358be2f3856338e3d799`.

## x402 v2 (exact + upto)

The facilitator speaks **x402 v2** as well as v1. Differences from the v1 flow above:

- Discovery: `GET /x402/supported` returns the facilitator's v2 `kinds` — currently
  `exact` and `upto`, both on `eip155:2049`.
- The `402` response carries a `PAYMENT-REQUIRED` header: base64 of the v2
  `PaymentRequired` object (`x402Version: 2`, `accepts[].amount` instead of
  `maxAmountRequired`). The JSON body stays v1-shaped for old clients.
- You pay with the `PAYMENT-SIGNATURE` header: base64 of
  `{"x402Version":2,"accepted":{…},"payload":{…}}`.
- The `200` response carries a `PAYMENT-RESPONSE` header (base64 settlement result).

**v2 exact** works with plain EIP-3009 (same signature as v1), so any standard x402 v2
client can call the four fixed-price services — just switch headers:

```js
// 1. GET -> 402; 2. decode PAYMENT-REQUIRED header; 3. pick an exact accept;
// 4. sign EIP-3009 TransferWithAuthorization for accepted.amount;
// 5. GET again with PAYMENT-SIGNATURE: base64({x402Version:2, accepted, payload:{signature, authorization}})
```

**v2 upto — metered billing.** `/x402/upto-translate?text=…&to=zh` authorizes a
**maximum** (`$0.10`) and settles the **actual** metered amount (`$0.001` per
translated word), exactly like LLM token billing. One authorization can cap many
calls; you are never charged the cap, only what you used:

```js
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://pikochain.serveousercontent.com');
const wallet = new ethers.Wallet('0xYOUR_PRIVATE_KEY', provider);
const BASE = 'https://pikochain.serveousercontent.com/x402/upto-translate';

// 1. 402 -> read the v2 challenge
let r = await fetch(BASE + '?text=hello%20blockchain%20world&to=zh');
const pr = JSON.parse(Buffer.from(r.headers.get('payment-required'), 'base64').toString());
const accept = pr.accepts.find((a) => a.scheme === 'upto'); // {amount:"100000", extra:{assetTransferMethod:"piko-allowance", facilitatorAddress:"0x…", pricePerUnit:"1000", unit:"word"}}

// 2. approve the facilitator once for the max (PikoChain gas ≈ zero)
const wusdc = new ethers.Contract(accept.asset, ['function approve(address,uint256)'], wallet);
await (await wusdc.approve(accept.extra.facilitatorAddress, accept.amount)).wait();

// 3. sign the EIP-712 max-authorization
const now = Math.floor(Date.now() / 1000);
const uptoAuthorization = {
  from: wallet.address, payTo: accept.payTo, maxAmount: accept.amount,
  validAfter: (now - 60).toString(), validBefore: (now + 900).toString(),
  nonce: ethers.hexlify(ethers.randomBytes(32)),
};
const signature = await wallet.signTypedData(
  { name: 'PikoChain x402 Upto', version: '1', chainId: 2049, verifyingContract: accept.extra.facilitatorAddress },
  { UptoAuthorization: [
    { name: 'from', type: 'address' }, { name: 'payTo', type: 'address' },
    { name: 'maxAmount', type: 'uint256' }, { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' }, { name: 'nonce', type: 'bytes32' } ] },
  uptoAuthorization);

// 4. pay per call; each 200 carries `charged` (actual) in the body and the amount in PAYMENT-RESPONSE
r = await fetch(BASE + '?text=hello%20blockchain%20world&to=zh', {
  headers: { 'PAYMENT-SIGNATURE': Buffer.from(JSON.stringify(
    { x402Version: 2, accepted: accept, payload: { signature, uptoAuthorization } })).toString('base64') },
});
const body = await r.json();
console.log(body.translated, '| charged:', body.charged, '| tx:', body.tx);
```

Rules enforced on-chain/by the facilitator: settlement `<=` authorized max;
each authorization is single-use (nonce); expired or wrong-payee auths are rejected.

Honest boundary: this `upto` uses a PikoChain-specific method (`piko-allowance`,
pre-approved `transferFrom` by the facilitator) because the official x402 v2 EVM
`upto` scheme requires Permit2, which is not deployed on PikoChain yet. The
metering semantics (max auth → actual settle, single nonce, payee binding) match
the official spec, but stock x402 SDKs will need a custom scheme adapter for this
method; `exact` (EIP-3009) works with standard v2 clients out of the box.

## Notes

- Price of the demo endpoint: `$0.01` wUSDC per call (`GET /x402/insight`).
- Doing it manually (any language): `GET /x402/insight` → read the `402` JSON
  (`payTo`, `maxAmountRequired`, `asset`) → sign the EIP-3009 authorization →
  `GET` again with header `X-PAYMENT: base64({"x402Version":1,"scheme":"exact",
  "network":"eip155:2049","payload":{"signature":"0x...","authorization":{...}}})`.
- The facilitator may charge a fee in the future: `POST /x402/verify` advertises
  `feeBps`/`feeRecipient` (currently `0` = no fee). If `feeBps > 0`, attach a second
  authorization `feePayload` (payer → fee recipient, `value = payment * bps / 10000`).
- Faucet for native PIKO (gas token): `https://pikochain.serveousercontent.com/faucet.html`
