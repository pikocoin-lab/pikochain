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
  `pikopay-demo-ask` → `0x1731bdf3950fce9e40b2646643ecd64ce78dc27b462d82783437aa2ebfb1286b`.

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
