---
name: "pikochain-x402"
description: "Pay to call AI services on PikoChain via x402: discover payable services, get a price quote, and pay per call in wUSDC (EIP-3009 gasless). No API key, no account, no official integration needed — payment IS the access."
---

# PikoChain x402 — the AI-native connector

## Purpose
Any agent can call paid services on PikoChain (chainId 2049) by paying per call in wUSDC. The flow is `402 quote → EIP-712 sign → X-PAYMENT → 200`. There is no signup, no API key, no allowlist: if you can pay, you can call. This is the "connector" that needs no official integration.

## Tooling
`~/workspace/skills/pikochain-x402/bin/piko-x402` (node, run with `node`).
Requires `node` and the `ethers` npm package (`npm i ethers` in the working
directory if it is not already resolvable; the script also falls back to a
bundled path on the author's machine). Copy the `bin/` file anywhere — it has
no other local dependencies; RPC and gateway default to public endpoints.

- `piko-x402 discover` — list services in the on-chain PikoPayRegistry: endpoint + price per call + payTo + active flag.
- `piko-x402 price <url>` — fetch only the `402` quote for a service URL. Pays nothing.
- `piko-x402 pay <url>` — full flow: quote → sign EIP-3009 authorization → `X-PAYMENT` → `200`. Prints the response body and the settlement tx hash.
- `piko-x402 bounty <address>` — claim **$0.05 test wUSDC** from the faucet (one claim per address).

Key handling: private key comes ONLY from env `PIKO_X402_KEY` or `--key-file <path>` (a file the user owns). `--new-key` generates a throwaway in-memory wallet, auto-claims the bounty, then pays — zero to paid in one command.

URLs: paths like `/x402/insight` are resolved against the gateway. Gateway defaults to `https://pikochain.serveousercontent.com`; override with env `PIKO_X402_GATEWAY`. RPC for `discover` defaults to `http://127.0.0.1:8545`; override with env `PIKO_X402_RPC`.

Protocol details (402 schema, EIP-3009 fields, facilitator fee): `references/x402-protocol.md`.

## Auth
No accounts exist. The wallet key IS the credential: an EIP-3009 `TransferWithAuthorization` signature authorizes an exact `(to, value)` transfer, and the facilitator settles it on-chain gaslessly for the payer. A signature can never move more than the quoted amount.

## Operating Rules
1. Private keys and seed phrases never touch disk (except the user's own `--key-file`), are never printed, and never enter chat logs. `--new-key` wallets live in memory only; only the public address is shown.
2. Test wUSDC is NOT real USDC and has no dollar value — never describe it as real money or a real payment.
3. Confirm the quoted price with the user before paying, except for ≤ $0.01 self-tests.
4. One bounty claim per address — never farm claims.
5. If the gateway stops responding, check `PIKO_X402_GATEWAY`; the canonical fixed subdomain is `https://pikochain.serveousercontent.com`.
6. If `discover` cannot reach the RPC, it falls back to the known demo service list — say so when reporting.
