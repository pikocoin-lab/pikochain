# 悬赏市场（Bounty）— references/bounty.md

对应 PAP-1 §8.1（任务状态机）、§7.2（支付方式）、附录 C（`IPAPBountyEscrow` 参考接口）。

## 核心规则（一句话）

**创建者开单时必须把奖励全额托管进合约**——没有托管，就没有 OPEN 状态。这是 PAP 悬赏与普通"帖子征稿"的根本区别。

## 状态机

```text
OPEN -> ASSIGNED -> SUBMITTED -> ACCEPTED -> PAID
  |         |            |          |
CANCELLED  EXPIRED    DISPUTED -> RESOLVED
```

- `PAID`、`CANCELLED`、`EXPIRED`、`RESOLVED` 为终态，不得二次付款。
- 审查超时必须按预设规则自动释放或进入争议——**不允许创建者无限期拖延**。
- 争议（`dispute`）期间，任一方不得单独提走全部托管资产；仲裁者必须在任务创建时确定，争议发生后不得单方面更换。
- 确定性测试优先于主观判断；高价值任务建议里程碑托管。

## 任务必须包含的字段

`bountyId`、`specHash`（任务说明的内容哈希）、资产（token 地址）、奖励金额、`acceptDeadline` / `submitDeadline` / `reviewDeadline`（接单/提交/审查三重期限）、验收模式、仲裁者地址。

## 规范接口（`IPAPBountyEscrow`）

```solidity
function open(bytes32 bountyId, address token, uint256 reward, bytes32 specHash,
    uint64 acceptDeadline, uint64 submitDeadline, uint64 reviewDeadline,
    address adjudicator) external;   // 调用者转入 reward 全额托管
function accept(bytes32 bountyId) external;              // worker 接单 -> ASSIGNED
function submit(bytes32 bountyId, bytes32 submissionHash) external; // 提交交付哈希 -> SUBMITTED
function approve(bytes32 bountyId) external;             // 仅创建者验收 -> ACCEPTED -> PAID
function dispute(bytes32 bountyId, bytes32 reasonHash) external;   // -> DISPUTED
```

行为断言（附录 B.5，任何实现必须满足）：
- 未托管足额奖励不得进入 OPEN；非指定 worker 不得提交 ASSIGNED 任务。
- 截止后不得接受/提交，除非规范事件已明确延期。
- 非创建者不得 `approve`；非预设仲裁者不得 `resolve`。
- 重入、重复 `approve`、重复 `resolve` 均不得多付；奖励 + 退款 + 保证金之和满足资产守恒。

## 悬赏 → 信誉闭环

任务完成并结算后，付款记录与双方签名交互自动成为**信誉证据**（delivery / quality / payment / reliability 等维度）。反馈只有绑定到这笔托管付款才获得"已验证交互"权重——这就是 PAP "支付与任务结果沉淀信誉"的设计。

## 导入 ERC-8004 声誉证据的规则（r4 §7.4）

从 ERC-8004 Reputation Registry 导入外部反馈证据时，实现**必须**：

- 标注证据来源 `(chainId, registry, tokenId)` 与证据类型：付款锚定 / 托管锚定 / 纯反馈；
- 只有满足 §8.2 已验证交互条件（关联付款、托管、验证或双方签名交互）的证据，才可获得"已验证交互"权重；
- 无付款或托管锚定的纯反馈**必须降权**——2026 年已观测到跨链协调 Sybil 反馈行为，多个研究证实多数未锚定反馈可被几分钱的成本伪造；
- 双向语义必须成立：PAP 记录指向 `(chainId, registry, tokenId)` 且对方注册文件指回 PAP URI，无法双向验证时只能显示"关联声明"，不得显示"同一身份"。

## 部署状态

`PAPBountyEscrow` 的 PikoChain 部署地址**待确认**（核心三件套尚未部署）。做概念集成时以规范接口和状态机为准；涉及真实资金前必须等待合约审计完成。

## 费用说明

PAP 核心协议**默认不抽成**。仲裁者、中继、索引器可以公开收费，但必须在签名前披露——服务层收费不是协议税。
