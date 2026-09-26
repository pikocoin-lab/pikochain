# PikoAgentRegistry 测试报告

- 合约：`PikoAgentRegistry.sol`（PAP-1 §4 身份注册表＋§5.1 EIP-712＋附录 C 参考接口）
- 编译器：Solidity 0.8.20（solc-js），编译通过，0 error
- 测试环境：eth-tester + PyEVM + web3.py，纯本地执行，未部署任何链
- 日期：2026-09-25

## 函数列表

| 函数 | 说明 | 规范依据 |
|---|---|---|
| `register(metadataURI, metadataHash, recovery)` | 注册身份，返回 agentId（从 1 递增）；调用者成为 controller＋payTo | §4.2 / 附录 C |
| `setMetadata(agentId, uri, hash)` | 仅 controller 更新元数据 | §4.2 / 附录 C / B.3 |
| `rotateController(agentId, newController)` | 仅旧 controller 轮换，旧密钥立即失效 | §4.3 / B.3 |
| `resolve(agentId)` | 返回 `(controller, payTo, uri, hash, status)`，元组顺序固定 | 附录 C |
| `setPayTo(agentId, newPayTo)` | 仅 controller 更新收款地址 | §4.2 |
| `setRecovery(agentId, newRecovery)` | 仅 controller 更新恢复账户 | §4.3 |
| `suspend(agentId)` / `activate(agentId)` | 仅 controller 冻结/解冻；冻结后元数据与权限变更被拒 | B.3 |
| `getAgent(agentId)` | 完整身份记录（含 recovery、createdAt） | §4.2 |
| `agentCount()` | 已注册数量 | — |
| `PAP_VERSION` / `PAP_MAJOR` / `PAP_MINOR` | `"1.0"` / 1 / 0，向前兼容预留 | §3.2 |
| `domainSeparator()` | EIP-712 domain（name/version/chainId/verifyingContract） | §5.1 |
| `hashPAPEvent(e)` | PAPEvent 结构体哈希，字段顺序与 §5.1 一致 | §5.1 |
| `eventDigest(e)` | 事件 digest（即 eventId），本合约 domain 下 | §5.1 |
| `eventDigestForDomain(domainSep, e)` | 显式 domain 下的 digest，用于规范测试向量验证 | 附录 B.1 |
| `recoverSigner(digest, signature)` | ecrecover 恢复 signer；签名非 65 字节直接回滚 | §5.1 |
| `verifyEvent(e, signature)` | 严格验证；恢复出零地址则回滚 | §5.1 |

## 测试结果：18/18 通过

| # | 用例 | 结果 |
|---|---|---|
| 1 | 正常注册：agentId=1，resolve 字段正确 | PASS |
| 2 | 重复注册（同一 controller＋URI＋hash 三元组）revert | PASS |
| 3 | 同一 controller 注册第二个 agent，id 唯一递增 | PASS |
| 4 | controller 更新元数据成功 | PASS |
| 5 | 非 controller 更新元数据 revert | PASS |
| 6 | 非法 URI scheme（ftp://）注册/更新被拒绝；ipfs:// 与 https:// 通过 | PASS |
| 7 | rotateController：旧 controller 立即失效，第三方轮换 revert | PASS |
| 8 | setPayTo 权限（仅 controller） | PASS |
| 9 | suspend 后元数据不可改，activate 后恢复 | PASS |
| 10 | resolve 未知 agentId revert | PASS |
| 11 | Python 独立 EIP-712 实现 digest == 规范向量 `0x07b8a192…b2bb2b3e` | PASS |
| 12 | 合约 `eventDigestForDomain` == 规范向量 digest | PASS |
| 13 | 合约 `recoverSigner` 从向量签名恢复出 `0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf` | PASS |
| 14 | 合约 `domainSeparator()` 与链下独立计算一致 | PASS |
| 15 | 非法签名（64 字节）revert | PASS |
| 16 | 非法签名（v=0，ecrecover 得零地址）`verifyEvent` revert | PASS |
| 17 | 域隔离：向量签名在合约自有 domain 下恢复出不同地址（非零） | PASS |
| 18 | 版本字段 `PAP_VERSION` = "1.0" | PASS |

## 规范符合性说明

- EIP-712 `PAPEvent` 字段顺序与类型哈希与 §5.1 逐字一致；domain 参数化（name/version/chainId/verifyingContract）符合 §5.1。
- 附录 B.1 固定测试向量三重验证通过：digest 一致、signer 恢复一致、Python 独立实现交叉印证。
- 身份记录八字段（§4.2）齐全；`expiresAt = 0` 语义、nonce/时间窗口检查归属事件验证层，未在本合约强制（已在代码注释声明）。
- 附录 B.3：agentId 全局唯一；非 controller 更新回滚；轮换后旧 controller 失效；suspend 阻止新状态。

## 已知限制（诚实边界）

1. 本合约未审计，不得上主网。
2. ERC-1271 智能账户签名验证未实现（§4.3 允许 MVP 用 EOA），由未来的 EventVerifier 承担。
3. `ipfs://` 的 CIDv1 完整 multibase 校验由客户端执行，链上只做 scheme 白名单门控。
4. 未部署到任何链；测试密钥向量仅为规范公开测试值，不涉及真实资产。
