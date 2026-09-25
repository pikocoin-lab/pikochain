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
