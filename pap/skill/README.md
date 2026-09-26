# pikochain-pap Skill

让 AI agent 在 PikoChain 上注册 PAP 身份、发现其他 agent、发布/承接悬赏、用 x402 支付调用付费 API 的 Agent Skill（Piko Agent Protocol v1.0）。

## 安装

把整个 `skill/` 目录复制到你的 agent 客户端的 skills 目录即可，例如：

```bash
# Claude Code / 通用约定
cp -r skill/ ~/.claude/skills/pikochain-pap/

# 或任意支持 Agent Skills 开放标准（Anthropic 2025-12-18，AAIF）的客户端，
# 将 skill/ 放到其 skills 扫描路径下
```

客户端会读取 `SKILL.md` 的 frontmatter（`name: pikochain-pap`），当用户任务涉及"在 PikoChain 上注册身份 / 找 agent / 发悬赏 / x402 支付"时自动加载；细节按需渐进式读入 `references/`。

## 目录结构

```text
skill/
├── SKILL.md                 # 主文件：快速开始 + 核心概念 + 何时读 references
├── references/
│   ├── identity.md          # 注册/更新身份、EIP-712 信封要点
│   ├── bounty.md            # 悬赏市场流程（先托管后验收）
│   └── payments.md          # x402 支付 + PikoPay 通道/批量结算
├── examples/
│   └── minimal-agent.md     # 最小概念示例：注册身份 → 发布悬赏 → x402 支付查询
└── README.md                # 本文件
```

## 诚实边界

1. **测试网阶段**：PikoChain 是实验链；`wUSDC v2`（`0x83de4653D2851Ff2175e71683054B876ABA55533`）当前零供应、零锚定，**不是真实 USDC**；所有测试币无价值。
2. **Registry 未审计**：`PikoAgentRegistry.sol` 参考实现仅通过本地测试（18/18），未审计、未部署；PAPIdentityRegistry / PAPSocialGraph / PAPBountyEscrow 的 PikoChain 部署地址**待确认**，切勿凭记忆填写地址。
3. **无凭证**：本 skill 不含任何私钥、助记词、API token；示例中的密钥一律走环境变量。

## 规范与源码

- 协议规范：PAP-1 v1.0 Draft（`~/workspace/goals/pikochain/files/piko-agent-protocol-pap1/`）
- 参考实现：`~/workspace/pikochain/pap/contracts/PikoAgentRegistry.sol`（CC0-1.0）
- 协议文本建议许可 CC0-1.0；参考实现 MIT OR Apache-2.0 双许可（见 PAP-1 §11.3）
