# Base x402 — protocol notes (verified live 2026-09-25)

## Chain / asset (verified on-chain via public Base RPC)

| item | value |
|---|---|
| chain | Base mainnet, chainId `8453` (`0x2105`) |
| USDC (native) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA4b94` — source: Circle official docs |
| USDC name() | `USD Coin` (eth_call `0x06fdde03`) |
| USDC version() | `2` (eth_call `0x54fd4d50`) |
| USDC decimals() | `6` |
| Base Sepolia USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (Circle docs) |
| public RPC | `https://mainnet.base.org` |
| explorer | `https://basescan.org` |

EIP-712 domain for the `exact` scheme (EIP-3009 `transferWithAuthorization`):
`{ name: "USD Coin", version: "2", chainId: 8453, verifyingContract: <USDC> }`.
Same pattern as our PikoChain stack (which uses name `"Wrapped USD Coin"`,
version `"1"`, chainId `2049`).

## Facilitator choice (verified live)

**Primary: `https://facilitator.xpay.sh`** (open, no auth)
- `GET /supported` → advertises `exact` on `eip155:8453` + `eip155:84532`
  (x402Version 2) and v1 aliases `base` / `base-sepolia`; `/health` → `ok`.
- `POST /verify` probes:
  - garbage body → `400 {isValid:false, invalidReason:"missing_parameters"}` ✓ (parses)
  - v1 envelope, network `eip155:8453` → `"No facilitator registered for scheme:
    exact and network: eip155:8453"` ✗ (advertised but NOT actually settled)
  - v1 envelope, network `base`, no EIP-712 domain → `"missing_eip712_domain"` ✓ (parsed, payer recovered)
  - v1 envelope, network `base`, with `extra:{name:"USD Coin",version:"2"}` →
    `"invalid_exact_evm_payload_signature"` ✓ (full validation path works;
    bogus signature correctly rejected)
  - same for `base-sepolia` ✓
- **Conclusion: use network names `base` / `base-sepolia` (NOT the
  `eip155:*` ids), v1 envelope, and always include the EIP-712 domain in
  `paymentRequirements.extra`.**

**Not for mainnet: `https://x402.org/facilitator`** (Coinbase public)
- `/supported` lists only `base-sepolia` for EVM — testnet only, as documented.
  Its `/health` returns an HTML page, not a JSON health check.

**Fallback: Coinbase CDP** `https://api.cdp.coinbase.com/platform/v2/x402`
- needs the user's own CDP API key; not tested here (no key handled).

## 402 shape (what base-seller returns)

```json
{
  "x402Version": 1,
  "error": "Payment required: ...",
  "accepts": [{
    "scheme": "exact",
    "network": "base",
    "maxAmountRequired": "10000",
    "resource": "http://host:8092/text-stats",
    "description": "...",
    "mimeType": "application/json",
    "payTo": "0x3BD7d1505Ea03D1483044287f2246FF68231B277",
    "maxTimeoutSeconds": 300,
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA4b94",
    "extra": { "name": "USD Coin", "version": "2" }
  }]
}
```

`X-PAYMENT` header: base64(JSON) or raw JSON of
`{x402Version:1, scheme:"exact", network:"base",
  payload:{signature, authorization}}`, where `authorization` is the EIP-3009
`{from,to,value,validAfter,validBefore,nonce}` the buyer signed.

## Market data referenced in SKILL.md (Sept 2026 web research)

- Strale x402 listing, ordered by real 30-day external revenue: `google-search`
  $0.10, `serp-analyze` $0.15, `email-deliverability-check` $0.05,
  `tech-stack-detect` $0.03, `keyword-suggest` $0.03, `brand-mention-search`
  $0.05, `company-enrich` $0.05; plus web extraction, OCR, translation,
  document parsing, DNS/SSL/security checks, crypto address validation.
- Cinderwright index: 1551 AI-agent payment services, 1457 on x402, average
  quality score 34/100 — big market, weak supply.
- Independent builder report: extract/transform endpoints priced $0.001–$0.008
  using LLM fallback chains.
