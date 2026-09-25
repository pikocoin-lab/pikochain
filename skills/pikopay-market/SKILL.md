# pikopay-market — Sell paid AI services on PikoChain

Turn any async function into a per-call paid API on PikoChain. Buyers pay in
wUSDC via x402 (402 → EIP-712 sign → 200); **payment IS the access** — no
accounts, no API keys, no invoicing. You set the price, buyers pay per call,
you receive the full price. A platform fee may apply on top (see below).

## How it works

```
buyer --(402 quote)--> your piko-seller --(verify+settle)--> facilitator
buyer --(X-PAYMENT)--> your piko-seller --(200 + result)--> buyer
```

1. Wrap your logic as a handler module (`examples/chain-risk-scan.js` is a
   complete example).
2. Serve it: `piko-seller --port 8095 --price 50000 --pay-to 0xYOU --handler ./my-handler.js`
3. List it: `piko-register --id my-service-v1 --endpoint https://yourhost/x402/svc --price 50000 --meta "..."`
4. Buyers call it with the `pikochain-x402` skill or any x402 client. Check
   earnings: `piko-earnings --pay-to 0xYOU`.

## Prerequisites

- Node.js + the `ethers` package (`npm i ethers`), or run from a machine with
  `~/workspace/my-chain/x402/node_modules` available.
- A reachable PikoChain RPC: local `http://127.0.0.1:8545` or public
  `https://pikochain.serveousercontent.com` (chainId 2049, `eip155:2049`).
- A reachable facilitator (default `http://127.0.0.1:8090`; the live one backs
  the public demo). Your seller auto-discovers its fee config.
- A pay-to address that receives wUSDC. No private key needed to SELL
  (EIP-3009 pays the payee without their signature). Registry management
  (register/price/unlist) needs `PIKO_SELLER_KEY` — env only, never hardcoded,
  never printed.

## Platform fee

The facilitator can take a per-settlement cut in basis points. When
`feeBps > 0` the 402 advertises `feeBps` + `feeRecipient`, and the buyer signs
a **second** EIP-3009 authorization for `price × bps / 10000` to the fee
recipient — **on top of your price**. You always receive your full listed
price; the fee never reduces it. Status on the live facilitator: **1%
(100 bps) to the chain owner's address** (enabled 2026-09-25 by owner
decision). `piko-seller` enforces and forwards the fee leg automatically.

## Commands

| Command | What it does |
|---|---|
| `bin/piko-seller` | Serve a handler as an x402-paid endpoint (402 → verify → settle → run handler → 200). The handler NEVER runs and the result is NEVER returned when payment fails. |
| `bin/piko-register` | List a service on PikoPayRegistry (`0x7aE738fA0652761cFd0347b8D387461877417a74`, open registration, anyone can list). Needs `PIKO_SELLER_KEY`. |
| `bin/piko-price` | Change your price (owner only). `--price` in wUSDC base units (6 decimals). |
| `bin/piko-unlist` | Delist (`--on` to re-list), owner only. |
| `bin/piko-earnings` | Read-only: wUSDC balance of your pay-to address. |

Prices are in wUSDC base units: `10000` = $0.01, `50000` = $0.05.

## Writing a handler

```js
// my-handler.js
function validate(u) {           // optional: reject bad input BEFORE payment
  if (!u.searchParams.get('q')) return 'missing ?q=';
  return null;
}
async function handler(u, ctx) {  // runs ONLY after payment settles
  const { ethers, provider, fetch } = ctx;
  return { answer: '...' };       // JSON-serializable result
}
module.exports = { name: 'my-service', description: '...', validate, handler };
```

Then: `piko-seller --port 8095 --price 20000 --pay-to 0xYOU --handler ./my-handler.js`

## Example product: chain-risk-scan

`examples/chain-risk-scan.js` — PikoChain address risk report.
Suggested price **$0.05/call** (suggestion only — sellers set their own).

```
GET /?address=0x...  ->  { isContract, codeSize, nativePIKO, pikoERC20,
  txCount, flags, riskScore (0-100), riskLevel, note }
```

Flags are transparent on-chain-shape heuristics (virgin/drained/fresh-contract/
oversize), labeled as screening only — not a security audit. Verified live
2026-09-25: paid $0.05 call settled on-chain, seller received the full 50000,
1% fee settled separately.

## Live products on this marketplace

### translate — EN→ZH dictionary translation — $0.02/call

- **Endpoint:** `https://pikochain.serveousercontent.com/x402/translate?text=<text>&to=zh`
- **Price:** 20000 wUSDC base units = $0.02 per call (+1% platform fee on top)
- **What it does:** word-by-word English→Chinese dictionary translation.
  Unknown words pass through unchanged. Demo-grade (not a full MT engine) —
  good for keyword/label translation, not prose.
- **Input:** `?text=` (required, max 200 chars). `&to=zh` accepted (only `zh`
  supported).
- **Response:** `{service, original, translated, to:'zh', note, paid, tx}`
- **Registry:** `0x681c18331adb0f185dfb78d15713d5c2498f4c3808b67619f6692d32ba5fa647`
  (`pikopay-demo-translate`), payTo `0xc59Ff0d9C33f03E5bf126E05aac4FA53F2720d35`
- **Try it:**
  ```
  piko-x402 pay 'https://pikochain.serveousercontent.com/x402/translate?text=hello%20world'
  ```
- Verified live 2026-09-25: HTTP 200, merchant received full 20000, 1% fee
  (200) settled to the fee recipient in a separate tx.

### web-intel — paid page extraction API — $0.01/call

- **Endpoint:** `POST https://pikochain.serveousercontent.com/x402/extract`
  with JSON body `{"url":"https://..."}` (GET `?url=` also works)
- **Price:** 10000 wUSDC base units = $0.01 per call (+1% platform fee on top)
- **What it does:** fetches the URL server-side (no API keys, pure Node:
  fetch + readability + turndown) and returns:
  - `markdown` — clean article text, markdown-formatted (20k char cap)
  - `title`, `description`, `og` — page title, meta description, OpenGraph/Twitter tags
  - `techStack` — detected CMS/framework/CDN from headers + HTML/script
    fingerprints (WordPress, Next.js, Shopify, Cloudflare, …)
  - `outboundLinks` — deduped off-site links (cap 50)
  - `finalUrl` — after redirects
- **Guards:** http(s) only, DNS-resolved host must not be private/loopback
  (SSRF blocked with 400 **before** payment), 15s fetch timeout, 2MB cap,
  HTML only. Bad input is rejected with 400 and never charged.
- **Registry:** `0xb82525f07e0154083ac2e8f22533ee00d0a7b2ec9f4d67471e210ce9e1eb3030`
  (`pikopay-market-web-intel-v1`), payTo `0xc59Ff0d9C33f03E5bf126E05aac4FA53F2720d35`
- **Try it** (Node):
  ```
  POST https://pikochain.serveousercontent.com/x402/extract
  {"url":"https://example.com"}   -> 402 quote -> pay -> 200 + result
  ```
- Verified live 2026-09-25: HTTP 200 via public tunnel, merchant received
  full 10000, 1% fee (100) settled separately. Note: no web-search —
  that needs a paid SERP key and is intentionally out of scope.

### chain-risk-scan — PikoChain address risk report — $0.05/call (suggested)

Example product shipped with this skill (`examples/chain-risk-scan.js`).
See "Example product" above. Sellers deploy and price it themselves.

## Honest boundaries

- **wUSDC is a test token** until the Base vault is funded with real USDC.
  Never claim it is real USDC; never price anything in real-money terms.
  All amounts above are test-token amounts.
- Suggested prices are suggestions. The platform fee rate and recipient are
  the chain owner's decision — this skill does not set them.
- Test wallets only. `PIKO_SELLER_KEY` is read from the environment and never
  printed, logged, or written to disk by these scripts.
- The facilitator is trusted infra (it submits the settlement txs). This is
  the documented PikoChain x402 trust assumption, same as the buyer side.
