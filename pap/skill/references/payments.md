# 支付（Payments）— references/payments.md

对应 PAP-1 §7.2（支付方式）、§7.3（x402 复用）、附录 A.2（PikoPay 模块）。

## 四种支付方式（按场景选）

| 场景 | 方式 | 特点 | 合约/服务 |
|---|---|---|---|
| 打赏 / 单次 API 调用 | x402 | HTTP 402 → agent 签 EIP-3009 授权 → facilitator 验证并结算；买方零 gas | facilitator 服务 |
| 持续推理（按秒计费） | PikoStream | 链下 voucher 凭证，1–3ms 确认，零 gas | `0xd41D40e307192695c759E57dAc0Dfc880a8F049e` |
| 高频小额 | PikoPaySettler | N 笔支付 1 个 tx 批量结算 | `0x5BeA82AE1473A8dc8c9cAB528604D9153d4216dc` |
| 服务发现 | PikoPayRegistry | 链上服务目录：查服务、价格、收款地址 | `0x7aE738fA0652761cFd0347b8D387461877417a74` |

> 以上地址为 PAP-1 §9.3 记录的 PikoChain 部署原型地址（eip155:2049）。跨链原子交换另有 `PikoHTLC`（`0x4D10e9Bb52fC891582bDAef2d52F974d0065210A`，SHA256 哈希锁）。

## x402 支付流程（PAP 复用，不重写握手）

1. agent `GET` 服务 endpoint → 服务返回 `402` + 支付要求（资产、金额、`payTo`）。
2. agent 用钱包签 EIP-3009 `TransferWithAuthorization`（EIP-712），放到 `X-PAYMENT` 头（base64）重试请求。
3. facilitator 验证签名并提交结算交易 → 服务返回 `200` + 结果与收据。

客户端一行调用（概念，`pikopay-client.js` 模式）：

```js
const { pay } = require('./pikopay-client'); // 402 -> EIP-712 签名 -> X-PAYMENT 重试，自动处理
const res = await pay('https://<service>/api/insight', agentWallet);
if (res.paid) console.log('已付款，结果：', res.body);
```

PAP 在 x402 之上只增加：调用者 `agentId` 身份、`serviceId`、`contextId`（把付款绑定到某次服务调用，防止一笔付款被重复解释）、以及交易完成后的信誉证据。

## 支付要求传输健壮性（PAP-1 r7 起）

- 服务返回的支付要求描述**应当同时出现在 `PAYMENT-REQUIRED` 响应头和响应体中**。代理、CDN 与网关可能剥离非标准响应头；Algorand 生态的 AgentMesh x402 适配已把两处同时携带作为硬性要求。agent 客户端解析时优先读响应体。
- 付款证明的字段名与格式**由结算轨定义**：EVM 轨用 `X-PAYMENT` 头携带 EIP-3009 签名授权（base64）；非 EVM 轨可用轨原生形式（如交易哈希，经轨定义的请求头传递）。PAP payment context 的字段集合与 `contextId` 绑定规则不变——接入新结算轨时只映射"付款证明"一处，不得改变其它字段语义。

## 与 UCP 的互补关系（r4 §7.4）

UCP（Universal Commerce Protocol）规范"agent 如何在商户处结账"，PAP 规范"agent 是谁、信誉如何、服务如何被发现与计费"——**两者互补而非竞争**。PAP payment context 可以把 UCP 结账引用记为 `purpose` 证据，但不得替代 UCP 的结账语义；两者同用 x402 支付轨时，`contextId` 绑定与信誉证据规则与结算轨无关。

## 每笔付款必须携带（§7.2，r3 起）

`payer`、`payee`、`asset`、`amount`、`purpose`、`network`（CAIP-2 结算网络标识；x402 已支持 Bitcoin Lightning、Cardano 等非 EVM 结算轨，`payee` 地址编码与网络绑定，实现不得假设 EVM）、`contextId`、`nonce`、`validBefore`。每个支付授权必须使用**唯一 nonce、精确资产/收款人/金额/用途、最短合理有效期**——客户端不得默认请求无限授权。

## 网络标识命名空间规则（PAP-1 r8 起，§7.2）

`network` 首选 CAIP-2（如 `eip155:8453`）。但结算轨自身可能只定义短标识：x402 生态使用轨原生短标识（如 `base`、`solana`、`lnbtc`——Block 2026-09-24 贡献的 Bitcoin Lightning 支持以 "exact Lightning on `lnbtc`" 进入规范）。此时 `network` 字段**使用轨原生标识并声明其注册表/规范版本**（如 `x402-v2`），实现必须原样保留该值，**不得**自行改写为自以为等价的 CAIP-2。跨轨聚合展示时应当同时保留原始值与命名空间说明；不同命名空间的标识即使指向同一结算网络，也不得在 `contextId` 绑定或信誉证据中被混同。

## 与 MPP 的映射（r8 §7.4）

MPP（Machine Payments Protocol，Stripe 与 Tempo 共同起草；RippleX 2026-09-17 在 XRP Ledger AI Starter Kit v1.1 中集成）是与 x402 同级的支付握手轨：服务报价 → agent 授权 → 服务交付，结算可在 XRP/RLUSD 等账本发行代币。映射规则：

- MPP 报价直接映射为 PAP payment context（字段集合与 `contextId` 绑定不变）；`contextId` 绑定与信誉证据规则与握手轨无关。
- MPP 的 Open Wallet Standard（agent 无需持有私钥即可请求交易，由软件强制支出上限与批准目的地）与 PAP §4.3 会话密钥作用域约束同构；两者混用时，**授权边界以较严格的一方为准**。
- 对 Stripe/Tempo 阵营来的实现者：PAP 不要求换支付轨——只要求 payment context 字段完备，握手轨可保留 MPP。

## 与 A2A x402 支付扩展的互操作（r12 §7.4）

agent 的 Agent Card 在 `capabilities.extensions` 中声明 x402 支付扩展（扩展 URI 形如 `…/a2a-x402/blob/main/spec/v0.2`，以卡片实际声明的 URI 字符串为准匹配，不硬编码仓库组织名）时，PAP 实现可用现成的 A2A 握手完成付款：服务端以 `task.status=input-required` 加 `metadata["x402.payment.status"]="payment-required"` 与 `metadata["x402.payment.required"]`（PaymentRequirements）应答；客户端签署支付要求后，携带同一 task-id 与 metadata 回发。映射规则：

- PaymentRequirements → PAP payment context（`payer`/`payee`/`asset`/`amount`/`purpose`/`network`/`nonce`/`validBefore`）；A2A task-id → PAP `contextId`（同一任务多次付款共享 `contextId`，`nonce` 区分各笔）。
- 扩展 URI 声明记为 service manifest 的外部支付握手引用（与 `externalIdentity` 同理的声明制）。
- `budgetId`（r11 支出预算信封）检查由钱包在签署 PaymentRequirements 之前执行——预算层挂到这条现成握手上，无需修改 A2A 扩展本身。
- 声明该扩展的 PAP agent 可被现有 A2A x402 钱包工具直接付款；付款完成后的信誉证据规则不变。

## 链官方背书与吞吐量口径（r13 §7.3）

- **Solana 官方背书（约 2026-10-02）：** Solana 官方《Solana x AI: The Democratization Layer》把 x402 列为 agent 协调层（Coordination Layer）的支付层——按需付款、无需账户/API 密钥/订阅，sub-second 结算、sub-cent 费用。这印证 PAP-1 §7.3 的治理注记：x402 结算轨扩张是各链以原生 facilitator 方式接入，而非 PAP 押注单一链的商业路线。PAP 实现仍以 x402 Foundation 规范版本为兼容目标。
- **Celo 原生 facilitator（约 2026-10-01）：** Tether 背书的稳定币 USAT 经 Celo 原生 facilitator 走 x402 成为 AI agent 支付选项——又一个"链官方原生 facilitator"接入实例。
- **吞吐量口径诚实规则：** 报告或引用任何吞吐量数字时**应当**同时标注：(1) 计的是通道更新吞吐还是已结算（settled）吞吐；(2) 测量边界（是否含网络延迟、devnet/测试网/主网）；(3) 聚合窗口与是否经独立审计。依据：Polygon Agent Pay Channels 报道的"11M+ updates/s"指 25 hub 链下通道状态更新（每笔约 20 微秒确认，不含网络延迟），不是 Polygon 主网 TPS；完整 x402 路径实测约 40,000 payments/sec，2.4M 笔完整路径支付在 devnet 实测 100% 成功，链上只做批量结算。聚合吞吐量不得直接转述为 agent 经济规模（§8.2）。

## 外部凭证型身份的互补立场（r8 §7.4）

持牌机构与链主导的封闭式 agent 身份（如 Visa 2025-10 的 Trusted Agent Protocol、2026-09-10 Visa/Mastercard/Ant International 宣布的 Know Your Agent 框架——截至宣布日尚无公开规范；Moca Chain 主网 2026-09-29 上线报道中的 AIR 身份凭证——由合作机构在自有链签发），PAP 持互补而非竞争立场：agent 可在 Manifest 用 `externalIdentity` 声明外部凭证（签发者/类型/可验证引用）；**除非双方记录相互指向（同 ERC-8004 双向语义规则），只能显示"关联声明"**，不得显示为"同一身份"或"已验证的 PAP 身份"。

- **原生 PIKO**：gas、押金、自愿标价。
- **wUSDC v2**（`0x83de4653D2851Ff2175e71683054B876ABA55533`，6 位小数，EIP-3009 兼容）：mint 权限仅属 `PikoUSDBridge`（`0x741221564B5b704CfDC5f96D5e01DB5c541F104f`），规则是 1 wUSDC 增发 ⟺ 1 USDC 锁进 Base 金库。**但 Base 金库尚未部署、供应量为 0——当前是"主网就绪、零锚定"的基础设施，不得称为真实 USDC，所有测试币无价值。**
- PAP-1 不发行新代币，不修改 PIKO 供应或质押参数。

## 安全规则（§12.4）

- facilitator 失败不得伪装为结算成功；只有链上成功（或满足明确确认策略）后才能显示"已付款"。
- 批量结算默认整批原子回滚；部分成功必须由新消息类型明确声明。
- 服务层收费必须在签名前披露；PAP 核心协议默认不抽成。
- 重放攻击防护：nonce + 短有效期 + 链上已用状态；facilitator 对重放的授权返回 402 拒绝。
