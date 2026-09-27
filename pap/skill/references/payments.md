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

## 与 UCP 的互补关系（r4 §7.4）

UCP（Universal Commerce Protocol）规范"agent 如何在商户处结账"，PAP 规范"agent 是谁、信誉如何、服务如何被发现与计费"——**两者互补而非竞争**。PAP payment context 可以把 UCP 结账引用记为 `purpose` 证据，但不得替代 UCP 的结账语义；两者同用 x402 支付轨时，`contextId` 绑定与信誉证据规则与结算轨无关。

## 每笔付款必须携带（§7.2，r3 起）

`payer`、`payee`、`asset`、`amount`、`purpose`、`network`（CAIP-2 结算网络标识；x402 已支持 Bitcoin Lightning、Cardano 等非 EVM 结算轨，`payee` 地址编码与网络绑定，实现不得假设 EVM）、`contextId`、`nonce`、`validBefore`。每个支付授权必须使用**唯一 nonce、精确资产/收款人/金额/用途、最短合理有效期**——客户端不得默认请求无限授权。

## 资产说明（诚实标注）

- **原生 PIKO**：gas、押金、自愿标价。
- **wUSDC v2**（`0x83de4653D2851Ff2175e71683054B876ABA55533`，6 位小数，EIP-3009 兼容）：mint 权限仅属 `PikoUSDBridge`（`0x741221564B5b704CfDC5f96D5e01DB5c541F104f`），规则是 1 wUSDC 增发 ⟺ 1 USDC 锁进 Base 金库。**但 Base 金库尚未部署、供应量为 0——当前是"主网就绪、零锚定"的基础设施，不得称为真实 USDC，所有测试币无价值。**
- PAP-1 不发行新代币，不修改 PIKO 供应或质押参数。

## 安全规则（§12.4）

- facilitator 失败不得伪装为结算成功；只有链上成功（或满足明确确认策略）后才能显示"已付款"。
- 批量结算默认整批原子回滚；部分成功必须由新消息类型明确声明。
- 服务层收费必须在签名前披露；PAP 核心协议默认不抽成。
- 重放攻击防护：nonce + 短有效期 + 链上已用状态；facilitator 对重放的授权返回 402 拒绝。
