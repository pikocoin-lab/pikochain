# PikoPay — AI payment network on PikoChain

A 4-layer payment network for AI agents, built on PikoChain (`eip155:2049`, ~zero fees, 2s blocks).

## Architecture

| Layer | What | Code |
|---|---|---|
| 1. One-shot | x402 `402 → sign → X-PAYMENT → 200`, EIP-3009 gasless | `scripts/server.js`, `scripts/facilitator.js` |
| 2. Streaming | Payment channels: off-chain signed vouchers (1–3ms, zero gas), on-chain claim/refund | `contracts/PikoStream.sol` |
| 3. Batch | N x402 payments settled in ONE tx | `contracts/PikoPaySettler.sol` + `POST /settleBatch` |
| 4. Discovery | On-chain service directory (endpoint + price) | `contracts/PikoPayRegistry.sol` |
| Liquidity | Base USDC ↔ wUSDC via PikoHTLC atomic swaps | `PikoHTLC 0x4D10…5210A` |
| Client | One-line pay for agents | `scripts/pikopay-client.js` → `await pay(url, wallet)` |

Deployed (2026-09-25):

| Contract | Address |
|---|---|
| wUSDC (EIP-3009, 6 decimals) | `0x68ac954700Fc1D0592721f1A5e785A8393253385` |
| PikoPayRegistry | `0x7aE738fA0652761cFd0347b8D387461877417a74` |
| PikoStream | `0xd41D40e307192695c759E57dAc0Dfc880a8F049e` |
| PikoPaySettler | `0x5BeA82AE1473A8dc8c9cAB528604D9153d4216dc` |

Services: facilitator `:8090` (`/verify`, `/settle`, `/settleBatch`), demo resource `:8091`
(`GET /api/insight` = $0.01). Demo service registered as `keccak256("pikopay-demo-insight")`.

## Verified

- One-shot: 402 → 200, $0.01 wUSDC buyer → seller; replay rejected with 402.
- Batch: 5 authorizations settled in 1 tx (`demo_batch.js`).
- Stream: 3 vouchers signed off-chain in 1–3ms each; receiver claimed latest only
  (+0.03 wUSDC, 1 tx); sender refunded 0.97 remainder after expiry (`demo_stream.js`).

## Run

```bash
./start-x402.sh            # facilitator + resource server
node scripts/buyer.js      # one-shot x402 flow
node scripts/demo_batch.js # batch settlement
node scripts/demo_stream.js# payment channel
```

Agent integration:

```js
const { pay } = require('./scripts/pikopay-client');
const res = await pay('http://host:8091/api/insight', agentWallet);
```

## Production path: Base USDC → wUSDC via HTLC

Demo wUSDC is owner-minted (test only). Real backing: deploy `PikoHTLC.sol` on Base,
atomic-swap USDC (Base) ↔ wUSDC (PikoChain) with makers providing liquidity; a
production minter mints wUSDC only against completed inbound HTLCs (1:1 backed).

## Honest boundaries

- Demo wUSDC is **not** real USDC — no bridge liquidity yet.
- `eip155:2049` is an island: external x402 clients need manual chain config.
- Facilitator is self-hosted; gas cost per settlement is ~zero on PikoChain —
  the structural edge over Base/Solana facilitators.
- `demo-keys.json` holds throwaway demo wallets (gitignored).
