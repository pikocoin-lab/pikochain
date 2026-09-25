# x402 on PikoChain — protocol reference

How an agent pays for a service. No account, no API key: the 402 quote tells you
exactly what to sign, and the signature IS the payment.

## The 4-step flow

1. **Request** → `GET https://pikochain.serveousercontent.com/x402/insight`
2. **402 quote** ← server replies:
   ```json
   { "x402Version": 1, "accepts": [ {
       "scheme": "exact", "network": "eip155:2049",
       "maxAmountRequired": "10000",          // smallest units; wUSDC has 6 decimals → $0.01
       "payTo": "0xc59Ff0d9C33f03E5bf126E05aac4FA53F2720d35",
       "asset": "0x83de4653D2851Ff2175e71683054B876ABA55533",  // wUSDC v2
       "maxTimeoutSeconds": 300,
       "extra": { "name": "Wrapped USD Coin", "version": "1" }
   } ] }
   ```
3. **Sign** → EIP-712 `TransferWithAuthorization` (EIP-3009):
   - domain: `{ name: extra.name, version: extra.version, chainId: 2049, verifyingContract: asset }`
   - message: `{ from, to: payTo, value: maxAmountRequired, validAfter, validBefore, nonce: bytes32 random }`
   - The signature authorizes exactly `(to, value)` — nothing more can be taken.
4. **Retry with payment** → same request + header
   `X-PAYMENT: base64({"x402Version":1,"scheme":"exact","network":"eip155:2049","payload":{"signature":"0x…","authorization":{…}}})`
   ← `200` with the service response. The facilitator settles the transfer on-chain
   gaslessly for the payer; the tx hash comes back in the body (`tx`) or the
   `payment-response` header.

Replay protection: each authorization carries a unique nonce; reusing a payload
is rejected with another 402.

## Facilitator fee (optional, default 0)

If the 402 advertises `feeBps > 0` and `feeRecipient`, the payer attaches a
**second** EIP-3009 authorization (a second signature is required because
EIP-3009 locks the exact `(to, value)` — one signature cannot be split):

```json
{ "paymentPayload": { /* the normal object from step 4 */ },
  "feePayload": { "signature": "0x…",
    "authorization": { "from": "<payer>", "to": "<feeRecipient>",
      "value": "<maxAmountRequired * feeBps / 10000>",
      "validAfter": "…", "validBefore": "…", "nonce": "0x…" } } }
```

The fee is **on top of** the quoted price (merchant still receives the full
amount). A fee-leg failure never fails the main payment. `bin/piko-x402`
builds this automatically when the quote advertises a fee.

## Service discovery (on-chain)

`PikoPayRegistry` at `0x7aE738fA0652761cFd0347b8D387461877417a74`
(chainId 2049) maps `keccak256(seed)` → 
`(owner, endpoint, pricePerCall, payTo, meta, active)`.
`pricePerCall` is in token smallest units (wUSDC: 6 decimals, so 10000 = $0.01).

## The other PikoPay layers (not needed for simple calls)

- **PikoStream** (`0xd41D40e307192695c759E57dAc0Dfc880a8F049e`): payment channels —
  off-chain signed vouchers (1–3 ms, zero gas), on-chain claim/refund. For
  per-second metering.
- **PikoPaySettler** (`0x5BeA82AE1473A8dc8c9cAB528604D9153d4216dc`): N x402
  payments settled in one tx via facilitator `POST /settleBatch`.

## Honest boundaries

- The wUSDC used in demos is **test wUSDC** (owner-minted for demos), not real
  USDC. Real 1:1 backing only begins when USDC locks in the Base vault.
- `eip155:2049` is not in default wallet/chain lists; external clients must add
  the chain manually (chainId 2049, RPC `https://pikochain.serveousercontent.com`).
- The facilitator is self-hosted; per-settlement gas cost on PikoChain is ~zero.
