# ERC-8004 与 PAP 兼容性分析

**日期**: 2026-09-25
**结论一句话**: ERC-8004 agentId 应该成为 PAP 的规范身份锚点；当前 PAP Registry 与官方接口不兼容，完成适配器＋一致性测试前只能说"互操作设计"，不能说"兼容"。

---

## 1. 官方 ERC-8004 本次部署（PikoChain 测试）

上游仓库：`https://github.com/erc-8004/erc-8004-contracts`，Identity/Reputation 均为 `v2.0.0`。

| 合约 | 地址 | 交易 |
|---|---|---|
| Identity proxy（ERC1967 → IdentityRegistryUpgradeable） | `0xc9009184993508b6d239dd7adff940380dcf2f49` | `0x518aaf43…48` |
| Identity implementation | `0x4a224d3af977f470c440403d3b6aea565dee004c` | `0x22931150…946` |
| Reputation proxy（ERC1967 → ReputationRegistryUpgradeable） | `0x248635d99fba686fe7a9e8661b3a3fba2ba91e39` | `0x679633f9…21` |
| Reputation implementation | `0x79e59a111b3315ace8a0ef230419c502e1bfe184` | `0x2a9463bb…15` |

- **未复刻官方统一地址**：`0x8004A169…a432` / `0x8004BAa1…b63` 在 PikoChain 上不可复刻（见 §2）。如实记录。
- **未部署 Validation Registry**：上游仍在修订，按任务要求不部署。
- 部署模式严格复用官方测试套件的 `HardhatMinimalUUPS` 流程（placeholder → proxy → upgradeToAndCall），owner 为本地部署者 `0xc4c319e7…99084`（本地 geth 已解锁测试账户，未读取任何私钥）。

### 链上验证结果（全部通过）

| 测试 | 结果 |
|---|---|
| `register("ipfs://bafytest-piko-agent-1")` | agentId = **0**（官方从 0 开始，PAP 从 1 开始，注意差异） |
| `tokenURI(0)` / `getAgentWallet(0)` | 回读一致，agentWallet 默认为注册者 |
| `getVersion()` | 两个代理均为 `2.0.0`；`getIdentityRegistry()` 正确指向 Identity 代理 |
| self-feedback | **revert**（官方禁止 owner/operator 自评，符合预期） |
| helper 合约提交 `giveFeedback(0, 85, 2, "quality", "api-test")` | 成功 |
| `readFeedback(0, helper, 1)` | (85, 2, "quality", "api-test", revoked=false) 与输入一致 |
| `getSummary(0, [helper], "quality", "api-test")` | count=1, value=85, decimals=2 |

部署脚本、完整记录：`pap/erc8004/deploy_erc8004.py`、`pap/erc8004/deployment.json`。

---

## 2. 为什么统一地址无法复刻（技术证据）

两个独立原因，任一即足以否决：

1. **PUSH0 不兼容**。官方默认构建 `evmVersion: shanghai`，实测 IdentityRegistry 创建字节码含 **330 个 PUSH0** 操作码（runtime 328 个）。PikoChain 创世未启用 Shanghai，PUSH0 在链上会 revert。为兼容改用 `evmVersion: paris` 重编译后，可执行代码 **零 PUSH0**（残留 1 个 0x5f 字节位于合约末尾的 CBOR metadata 区，从不执行，无影响）。但重编译改变了 init-code hash，同一 CREATE2 factory＋salt 必然得到**不同地址**——统一地址在数学上不可复刻。
2. **owner 密钥不可得**。官方统一地址的代理 owner 是 ERC-8004 团队地址 `0x547289319C3e6aedB179C0b8e8aF0B5ACd062603`（写死在 MinimalUUPS initialize 中）。即使地址能复刻，没有该密钥也永远无法把代理升级为功能实现——一个无法升级的官方代理在 PikoChain 上毫无意义。

结论：普通代理部署是唯一正确的选择，已如实记录地址差异。

---

## 3. 官方 ERC-8004 vs 当前 PAP Registry（已确认差异）

| 维度 | 官方 ERC-8004 | 当前 PikoAgentRegistry |
|---|---|---|
| 身份载体 | **ERC-721**，agentId = tokenId | 非 NFT，agentId 自增 |
| agentId 起始 | **0** | 1 |
| 所有权模型 | ERC-721 owner / approved / operator | controller 字段 |
| 钱包绑定 | `agentWallet`（EIP-712 签名授权，支持 EOA/EIP-7702/ERC-1271；NFT transfer 自动清除） | payTo 字段，无签名绑定 |
| 元数据 | `agentURI/tokenURI`＋任意 `metadataKey => bytes`，URI 无链上白名单 | metadataURI＋显式 metadataHash，URI 限 ipfs/https |
| 恢复机制 | 无（靠 NFT 持有） | recovery 地址＋controller rotation＋suspend/activate |
| 防重复注册 | 无（URI 可重复） | 三元组去重 |
| 信誉 | **独立 Reputation 注册表**，`giveFeedback/readFeedback/getSummary`，禁止自评 | PAP spec 有信誉章节，合约未实现 |
| 事件签名 | 官方 EIP-712（setAgentWallet 等） | PAP 自有 EIP-712 事件 digest |

**接口不兼容，语义部分重叠。当前不能宣称 "ERC-8004 compatible"。**

---

## 4. 兼容性建议（核心）

1. **ERC-8004 agentId 作为 PAP 的规范身份锚点**。PAP 不应另起一个互不兼容的身份岛——AI agent 生态的身份正在向 ERC-8004 收敛，PAP 要当标准就必须锚定它，而不是竞争它。
2. **PAP 的 controller/payTo/recovery/status/metadataHash 可映射进 ERC-8004**：放入 agent registration file 或官方 metadata keys。`agentWallet` 对应执行/签名钱包，但**不能**简单等同 PAP 全部字段（recovery、status 无官方对应物）。
3. **PAP 规范必须新增完整身份引用**：`chainId + identityRegistry 地址 + agentId` 三元组。只写本地数字 agentId 会在多链下产生歧义，这是成为跨链标准的前提。
4. **实现 adapter/resolver**：把 ERC-721 owner/approval＋agentWallet 映射为 PAP 的 controller/actor/payTo；PAP 保留自己的 EIP-712 社交事件层（这是 PAP 的差异化价值，不必让位）。
5. **信誉直接兼容官方语义**：PAP 信誉层必须复用 `giveFeedback/readFeedback/getSummary` 的语义和 tag 约定，不建立冲突的独立信誉真相源。已在 PikoChain 上验证官方信誉流全通（§1）。
6. **正式宣称兼容的最低门槛**（缺一不可）：
   - 支持官方注册表接口/事件，或提供正式适配器合约；
   - 支持 ERC-721 ownership/approval 语义；
   - 支持 ERC-1271（合约钱包签名验证）；
   - 定义 NFT transfer 后 PAP controller/payTo/recovery 的处理规则（官方 transfer 会清除 agentWallet，PAP 必须有对应状态机）；
   - 增加官方 ERC-8004 测试向量/行为测试。
7. **诚实口径**：在 6 完成前，对外只能写 **"PAP 可与 ERC-8004 互操作的设计草案"**，不能写"完全兼容"/"ERC-8004 compatible"。

---

## 5. 后续工作（已授权范围内）

- [ ] PAP spec 新增 §身份引用三元组（chainId＋registry＋agentId）
- [ ] 设计 `PikoERC8004Adapter`（ERC-721 owner/approval → PAP controller/actor/payTo 映射）
- [ ] PAP 信誉章节对齐官方 `giveFeedback` 语义（value/decimals/tags/revocation）
- [ ] ERC-1271 支持（PAP Registry 与 adapter 都需要）
- [ ] NFT transfer 后状态机规则
- [ ] 官方行为测试向量移植到 PAP 测试套件

**硬边界重申**：以上均为本地测试与文档工作；涉及主网、真钱、代币经济、权限变更的事项一律等用户确认。本次部署仅在 PikoChain chainId 2049，未触碰外部主网、真实资产或任何私钥。
