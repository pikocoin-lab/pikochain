# PikoSwap — AMM DEX on PikoChain

Uniswap V2-style automated market maker: `x * y = k`, 0.3% LP fee.
On PikoChain (~zero gas) LPs can add/remove/rebalance for free — the structural
edge over the same AMM on Base or Ethereum.

## Contracts

| Contract | Address |
|---|---|
| WPIKO (wrapped native) | `0xC5Fb63d16c1ad8c9037b5B9f5FE5406fAccD33a3` |
| PikoSwapFactory | `0x8A2d8E64265a3B0d1c2E83910DB35aBAFd6465E9` |
| PikoSwapRouter | `0x9B36b978B8cd421405a235bBFd3CbA5B875EC920` |
| WPIKO/wUSDC pair | `0x72Ea1C0282a3B92209796C4456b4BE36d1864445` |

Genesis pool: 1000 WPIKO + 1000 wUSDC → **1 PIKO = $1.00** (demo pricing).

Files: `contracts/` (WPIKO, Factory, Pair, Router), `scripts/` (compile, deploy,
demo_swap). `solc` compiles with `evmVersion: london` (PikoChain genesis is pre-Shanghai).

## Verified (2026-09-25)

- Quote: 10 wUSDC → 9.871580 WPIKO (fee + slippage visible on-chain)
- Swap executed exactly as quoted; price moved $1.0000 → $1.0201 on buy pressure
- Native PIKO → wUSDC via `swapExactPIKOForTokens`
- `removeLiquidity` burned 1% of LP, returned both tokens proportionally

## Honest boundaries

- **Pool unwound 2026-09-25** during the v1→v2 migration: the WPIKO/v1-wUSDC pool
  traded an unbacked test token at a posted $1 price, so its liquidity was
  removed and the v1 supply burned to the dead address. Re-seed with v2 once
  real USDC backs it.
- Demo wUSDC v1 was owner-minted test token, not real USDC — pool price was
  illustrative until real USDC bridges in via PikoHTLC.
- Single pool, no concentrated liquidity (V3 comes with real volume).
- No frontend yet; interaction via scripts / direct contract calls.
