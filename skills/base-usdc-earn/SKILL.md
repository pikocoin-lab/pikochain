# base-usdc-earn

Earn **real USDC on Base mainnet** for every API call. No API key, no signup, no
account — payment **is** the access. A buyer hits your endpoint, gets an HTTP
`402 Payment Required` with the price, signs one EIP-3009 authorization, and the
call proceeds. USDC lands directly in your wallet.

> This skill is the **cash register**, not the customers. It gives you the
> ability to receive money. Real income needs a service buyers want plus
> distribution (directories, agent communities, word of mouth). Nothing here
> guarantees income.

## Quick start

```bash
cd ~/workspace/skills/base-usdc-earn
npm i ethers            # one-time
cp .env.example .env    # then edit BASE_PAY_TO if needed

# 1. TESTNET FIRST — always
BASE_NETWORK=base-sepolia PORT=8092 ./bin/base-seller
# in another terminal, with YOUR OWN testnet key:
BASE_TEST_KEY=0x... SERVICE_URL=http://127.0.0.1:8092/text-stats ./bin/base-buyer-test

# 2. mainnet only after the testnet run settles cleanly
BASE_NETWORK=base PORT=8092 ./bin/base-seller
```

Default receiving address: `0x3BD7d1505Ea03D1483044287f2246FF68231B277`
(public — it's printed in every 402 quote by design). Change `BASE_PAY_TO` to
any address you control.

## How x402 on Base works

1. Buyer calls your endpoint with no payment → you return **402** with
   `accepts[0]` = `{scheme:'exact', network:'base', asset:<USDC>, payTo:<you>,
   maxAmountRequired:'10000'}` ($0.01, 6 decimals).
2. Buyer signs an **EIP-3009** `transferWithAuthorization` (domain: name
   `"USD Coin"`, version `"2"`, chainId `8453`) and retries with it in the
   `X-PAYMENT` header.
3. Your server asks the facilitator `/verify`; if valid it runs your handler,
   then `/settle` — the USDC moves on-chain, buyer → you.
4. Your server returns the result **only** after settlement. Failed payment =
   another 402, never the result.

Scheme `exact` on Base is the same EIP-3009 pattern as our PikoChain stack —
the only differences are the network id, the USDC contract, and the
facilitator. See `references/base-x402.md`.

## Pricing guidance

Micro-prices win volume in the agent economy. Live market data (Sept 2026):
the top-earning x402 endpoints charge **$0.03–$0.15 per call** (structured
search $0.10, SERP analysis $0.15, tech-stack detection $0.03); simple
extract/transform endpoints sit at **$0.001–$0.008**. Start at **$0.01–$0.05**,
raise once you have repeat buyers. A $0.50+ price needs a genuinely scarce
capability (GPU inference, licensed data).

## Facilitator

Primary: `https://facilitator.xpay.sh` — open, no auth. Verified 2026-09-25:
`GET /supported` advertises `exact` on Base; live `/verify` probes confirm a
working settlement path for network names **`base`** (mainnet) and
**`base-sepolia`** (testnet) with the v1 envelope + EIP-712 domain in
`paymentRequirements.extra`. (Its `/supported` also lists `eip155:8453` /
`eip155:84532`, but `/verify` has no settlement backend for those ids — use the
short names.)

Do **not** use `https://x402.org/facilitator` for mainnet — it only serves
testnets for EVM (verified live). Fallback if xpay.sh ever goes down: Coinbase
CDP `https://api.cdp.coinbase.com/platform/v2/x402` with your own CDP API key.

## Getting discovered

- Serve your seller on a public URL (any VPS/tunnel) and share the endpoint.
- Publish `/.well-known/x402.json` + `llms.txt` describing the paid routes.
- List on x402 directories (e.g. x402scan-style indexes) once live.

## Cashing out

Earnings arrive as native USDC on Base in your `BASE_PAY_TO` wallet. From
there: hold, bridge (official Base bridge), or send to any exchange that
takes Base-network USDC deposits. The skill never touches your keys — the
facilitator submits the buyer's signed authorization; you only receive.

## Example product: /text-stats — $0.01/call

`POST /text-stats` with `{"text":"..."}` returns word count, character counts,
estimated reading time, and a script-based language hint. Pure code, no
third-party key. Reference implementation is wired into `bin/base-seller`;
add your own products to the `PRODUCTS` map the same way.

Try it (after starting the seller):
```bash
curl -s http://127.0.0.1:8092/text-stats?quote=1 | python3 -m json.tool
```

## Honest boundaries

- Real money = real risk. Test on **base-sepolia** first, every time you change
  anything. Mainnet settlement is irreversible.
- No income is guaranteed. Buyers must exist; this skill only makes getting
  paid frictionless.
- Test USDC on Sepolia is free from faucets and worthless — never confuse it
  with mainnet USDC.
- Your `BASE_PAY_TO` is public by design (every 402 quote contains it). Use a
  dedicated receiving address if you want separation from your main holdings.
- Never paste a mainnet private key anywhere except the `BASE_TEST_KEY` env
  var of the buyer test, run by you, on your own machine.
