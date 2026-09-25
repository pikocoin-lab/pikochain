# PikoChain 跨链能力说明

## 已经实现（2026-09-25）
PikoChain 现在是一条**可跨链**的 EVM 链：

1. **HTLC 原子交换**（已部署并实测）
   - 合约：`0x4D10e9Bb52fC891582bDAef2d52F974d0065210A`
   - 页面：https://pikochain.serveousercontent.com/bridge.html
   - 与**任意 EVM 链**（Ethereum / Sepolia / BSC / Polygon / Arbitrum…）做无信任原子交换
   - 使用 SHA256 哈希锁，与比特币 HTLC / 闪电网络同标准，未来可扩展到 BTC
   - 不需要 relayer、不需要对方事先集成、不需要任何许可

2. **EVM 完全兼容**（跨链的基础）
   - geth 1.13.9，Chain ID 2049，所有 EVM 钱包/工具直接可用
   - ERC-20（PIKO）、质押、水龙头合约均为标准实现

3. **chainlist.org 条目已准备**（`evm/chainlist.json`）
   - 提交到 https://github.com/ethereum-lists/chains 后，主流钱包会自动识别 PikoChain

## 已验证可达的对手网络（2026-09-25）
PikoHTLC 是纯 EVM 合约，任意 EVM 链都能部署。以下网络的公共 RPC 已实测可达
（`eth_chainId` 逐一核对），部署脚本统一为 `evm/scripts/deploy_htlc.js <网络名>`，
网络参数见 `evm/networks.json`：

| 网络 | Chain ID | Gas 代币 | 备注 |
|---|---|---|---|
| Arc | 5042 | USDC | Circle 的 USDC 原生 L1；无 PUSH0 限制已验证，见 `evm/ARC.md` |
| BSC | 56 | BNB | gas 便宜，适合第一个低成本主网目标 |
| Polygon | 137 | POL | gas 代币是 POL |
| Arbitrum One | 42161 | ETH | L2，gas 便宜 |
| Optimism | 10 | ETH | L2，gas 便宜 |
| Base | 8453 | ETH | 计划中的 PikoUSDVault 落地链 |
| Avalanche C-Chain | 43114 | AVAX | — |
| Ethereum | 1 | ETH | 部署 gas 最贵（$5–50），最后再上 |

部署一律是用户钱包操作（私钥只走 `HTLC_PRIVATE_KEY` 环境变量），部署后把
地址回填进 `networks.json` 的 `htlc` 字段。

## Arc 链支持（2026-09-25 新增）
Circle 的 USDC 原生 L1，9 月 16 日主网刚上线（Chain ID 5042，gas 直接用 USDC）。
- Arc 主网 RPC 已验证可达（`eth_chainId` = `0x13b2`）
- PikoHTLC 字节码已验证无 PUSH0，可直接部署到 Arc
- 部署脚本：`evm/scripts/deploy_htlc_arc.js`（需用户钱包自备 Arc 上的 USDC 做 gas）
- 交换设计：Arc 侧锁原生 USDC（18 位）↔ PikoChain 侧锁 wUSDC（6 位），同一 SHA256 哈希锁
- 详见 `evm/ARC.md`

## 还没做（诚实边界）
- **LayerZero / Axelar / Wormhole / Chainlink CCIP**：这些是"一键跨链桥"协议，
  需要它们官方把 PikoChain 列入支持网络（要申请 + 部署它们的端点合约 + 通常要付费）。
  这不是技术问题，是商务/集成流程。HTLC 方案今天就能用，不等任何人。
- **中心化 relayer 桥**（lock/mint 模式）：可以做，但需要有人在另一条链上跑 relayer
  并质押信用，适合等社区起来后再搞。

## 路线图
- [x] HTLC 合约部署 + 实测
- [x] bridge.html 交互页面
- [ ] chainlist.org 提交（等用户确认后提交 PR）
- [ ] 在 Sepolia 上部署同款 HTLC，做一次 PikoChain ↔ Sepolia 真实跨链演示
- [ ] 向 LayerZero / Axelar 提交 PikoChain 集成申请
