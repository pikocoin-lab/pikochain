# wUSDC v2 — mainnet-track issuance

v1 (`0x68ac9547…3253385`) had an immutable owner-mint: it could never become a
real mainnet coin. v2 fixes issuance at the contract level.

## Rule

**1 wUSDC is minted ⟺ 1 USDC is locked in the Base vault.** No other mint path exists.

| Contract | Address | Chain |
|---|---|---|
| wUSDC v2 (EIP-3009) | `0x83de4653D2851Ff2175e71683054B876ABA55533` | PikoChain |
| PikoUSDBridge (sole minter) | `0x83974f7C8BcEC5Dd603dF1B2848e5ECC38b8F38c` | PikoChain |
| PikoUSDVault | _not deployed yet_ | Base |

- `WUSDCv2.mint` is `onlyMinter`; minter = bridge. Verified on-chain: direct
  owner mint reverts (`not minter`).
- `PikoUSDBridge.mint(to, amount, baseTxHash)` is `onlyOperator`; the operator
  attests the Base lock (tx hash in the event for auditability).
- `burnForRelease(amount, baseRecipient)`: burns v2 on PikoChain, emits
  `ReleaseRequested`; operator releases real USDC on Base.
- v2 genesis supply: **0**. v1 test supply (13,000) was moved to the dead address;
  v1 is retired.

## Trust model (honest)

Single operator today (node key — should move to multisig/DAO). Fully trustless
minting would need ZK proofs of Base state; not built yet. This is the standard
bridge trust model, not a trustless one.

## What remains for real backing

1. Deploy `PikoUSDVault` on **Base mainnet** (constructor takes the real USDC
   address — verify it at deploy time) — needs the user's wallet + Base ETH.
2. `bridge.setVault(vaultAddress)` (owner).
3. Lock real USDC → operator mints wUSDC 1:1. First mint = the moment wUSDC
   becomes a real mainnet coin.

Until step 3 happens, v2 is **mainnet-ready infrastructure with zero backing** —
say exactly that, nothing more.
