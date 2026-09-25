# Arc 链支持（Circle 的 USDC 原生 L1）

## 网络参数（2026-09-25 实测）

| 项目 | 值 |
|---|---|
| 名称 | Arc Mainnet |
| Chain ID | **5042** (`0x13b2`) |
| RPC | `https://rpc.mainnet.arc.io`（本机已验证可达，`eth_chainId` 返回 `0x13b2`） |
| 浏览器 | `https://explorer.arc.io` |
| Gas 代币 | **USDC（原生）**，链上记账 18 位小数 |
| ERC-20 USDC | `0x3600000000000000000000000000000000000000`，6 位小数（同一余额，两种精度） |
| EVM | 兼容（Reth + Osaka EVM），**拒绝 PUSH0**（Shanghai+ 操作码） |
| 出块 | ~0.5 秒，确定性终局 |

> 主网上线：2026-09-16。验证者：Circle / BlackRock / DTCC / Visa / Mastercard / ICE 等（PoA，2027 年计划转 PoS）。

## PikoChain ↔ Arc 原子交换设计

PikoHTLC 合约**无需修改**即可部署到 Arc（已验证字节码无 PUSH0）：

- **Arc 侧**：用原生 USDC 锁仓（`lockNative` payable；注意 18 位小数，1 USDC = 10¹⁸）
- **PikoChain 侧**：用 wUSDC（ERC-20，6 位小数）或 PIKO 锁仓
- 同一个 SHA256 哈希锁，任意一方 reveal preimage 即完成原子交换
- 不需要 relayer、不需要 Circle 官方集成

### 精度陷阱（必读）

Arc 上 1 USDC 有两种表示：原生 18 位（gas/余额） vs ERC-20 6 位。做市脚本里
`parseUnits("1", 18)`（Arc 侧）和 `parseUnits("1", 6)`（PikoChain wUSDC 侧）
不要混用，否则差 10¹² 倍。

## 部署步骤（需用户钱包操作）

1. 准备一个有 **USDC（Arc 上）** 的钱包（部署 gas 也是 USDC，极便宜）
2. 运行通用部署脚本（私钥只走环境变量，不落地）：
   ```bash
   cd ~/workspace/my-chain/evm
   HTLC_PRIVATE_KEY=0x... NODE_PATH=~/workspace/my-chain/x402/node_modules \
     node scripts/deploy_htlc.js arc
   ```
   所有对手链共用这一个脚本，网络参数在 `networks.json` 里。
3. 把输出的合约地址填进 `bridge.html` 的"对方链 HTLC"配置，即可发起
   PikoChain ↔ Arc 原子交换

## 状态

- [x] Arc 主网 RPC 可达性验证（2026-09-25）
- [x] PikoHTLC 字节码 Arc 兼容性验证（无 PUSH0）
- [x] 部署脚本就绪
- [ ] 用户在 Arc 部署 HTLC（需自备 USDC 做 gas）
- [ ] 第一次 PikoChain ↔ Arc 真实原子交换演示
