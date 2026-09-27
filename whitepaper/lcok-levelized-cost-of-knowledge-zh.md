# LCOK：知识平准化成本

## ——AI Agent 知识交易的能量定价基准

### Levelized Cost of Knowledge: An Energy-Denominated Pricing Benchmark for Agent-to-Agent Knowledge Trade

作者：piko ｜ 版本：v0.1-draft ｜ 日期：2026-09-28 ｜ Working Paper

> 诚实声明：本文为工作论文（working paper），全部命题为猜想，参数为占位，尚无实证。
> 先行者核查（2026-09-28）未发现实质性先行者，但该结论为检索阴性结果，不构成"不存在"的证明。
> 检索范围：公开英文/中文网络索引、arXiv、NBER/IDEAS/MPRA、GitHub、行业博客；未覆盖付费数据库、专利库、非中英文文献。

---

## 摘要

AI agent 之间的知识交易正在发生，但没有统一的比价基准：一段知识值多少钱，买卖双方各说各话。本文提出 **LCOK（Levelized Cost of Knowledge，知识平准化成本）**——把电力行业用了几十年的 LCOE（平准化度电成本）框架搬到 AI 知识定价上：

**LCOK = E_total / ∫₀^T f(t) dt**

知识的价格 = 生产它耗掉的总能量（kWh）÷ 它在衰减过程中的有效寿命积分。分子是能量本位，分母是知识精神磨损，算出来的是"每单位有效知识耗了多少度电"，作为 agent 间知识议价的统一基准。

---

## 1. 问题：知识没有价格锚

算力有了期货（CME 2026 年推出算力期货，标的是 GPU 租赁价格指数），但知识本身——模型权重、检索结果、推理结论、数据集——在 agent 间交易时没有定价基准。现状是：

- 按 token 数计费：token 是长度单位，不是价值单位；
- 按 API 调用次数计费：调用次数与知识有效性无关；
- 一口价/订阅制：无法反映知识随时间的贬值。

结果是知识市场无法比价，agent 无法对冲"买到的知识迅速过时"的风险。

## 2. 定义与公式

### 2.1 核心公式

```
LCOK = E_total / ∫₀^T f(t) dt
```

| 符号 | 含义 | 单位 |
|------|------|------|
| E_total | 生产该知识耗费的总能量 | kWh |
| f(t) | t 时刻知识的有效性（新鲜度函数），f(0)=1 | 无量纲 |
| T | 知识有效寿命：f(t) 跌破可用阈值的时间 | 时间 |
| LCOK | 知识平准化成本 | kWh / 有效知识单位 |

### 2.2 分子：E_total 的构成

```
E_total = E_train / N + E_infer
```

- **E_train**：训练（或知识生产）过程的总能耗，分摊到 N 次复用上。N 越大，单次知识的 LCOK 越低——这解释了为什么基础模型API 比一次性微调便宜：摊薄效应。
- **E_infer**：本次交付知识的推理能耗。
- 全部以 kWh 计，绕过法币波动，直达物理成本。

### 2.3 分母：知识精神磨损 f(t)

沿用本系列论文提出的知识精神磨损模型：

```
f(t) = e^(−λt)
```

- **λ（衰减率）**：知识类型相关。实时路况 λ 极大（分钟级过期），数学定理 λ≈0（几乎不过期）。
- **T**：f(t) 跌破阈值 θ_min 的时间，T = −ln(θ_min)/λ。
- 分母 ∫₀^T f(t)dt = (1−θ_min)/λ，是知识"一生"提供的有效知识总量。

### 2.4 直觉

- 一份训练耗能巨大但十年不过期的知识（如数学证明），LCOK 很低——便宜且保值；
- 一份推理耗能小但一小时就过期的知识（如实时比价），LCOK 很高——贵且速朽；
- agent 议价时不再争"值多少钱"，而是争三个可测量的数：**E_train、E_infer、λ**。

## 3. 与 LCOE 的同构

| 电力 LCOE | 知识 LCOK |
|-----------|-----------|
| 电站全生命周期成本（$） | 知识全生命周期能耗（kWh） |
| 全生命周期发电量（MWh） | 全生命周期有效知识量 ∫f(t)dt |
| LCOE = 成本/发电量（$/MWh） | LCOK = 能耗/有效知识（kWh/单位） |
| 用途：比较太阳能 vs 煤电 | 用途：比较不同知识源的性价比 |
| 指导电网采购 | 指导 agent 采购知识 |

LCOE 让电力采购有了跨技术的统一标尺；LCOK 要为机器知识市场做同样的事。

## 4. 先行者核查与原创性边界（诚实章节）

2026-09-28 专项核查结论：**未发现 LCOK 三要素组合的实质性先行者**。各要素的独立先行者如下，必须如实引用：

1. **LCOAI**（Eliseo Curcio, arXiv:2509.02596, 2025-09）——形式上最接近的先行者：把 LCOE 移植到 AI，公式为（摊销 CAPEX + ΣOPEX）/ 有效推理总数。但：分子是美元不是 kWh，分母是推理计数不是衰减积分，用途是企业部署决策不是 agent 间交易。不构成实质先行者，但必须引用。
2. **TEPI**（Token Energy Parity Index, Tang Huidao, 2026-08）——"能量作为定价分子"的最直接实例：$/kWh 推理 token 指数。但它是日度现货指数，无训练摊销、无衰减积分、无知识交易用途。必须引用。
3. **"levelized cost of intelligence"**（Srini Hebbar, Medium, 2025-10）——术语先兆，仅概念段落，无公式。引用致谢。
4. **Photons = Tokens**（arXiv:2603.06630）、**AI Tokenomics**（arXiv:2606.24616）——讨论 token 的能量成本与知识经济，但无定价公式。列入相关文献。
5. **知识资本折旧文献**（Griliches、de Rassenfosse & Jaffe NBER w23072、BEA）——折旧仅用于生产率测算，从未用作交易定价基准。可为 λ 参数选择提供经验锚点。

**原创性主张的准确表述**：LCOK 的新颖性在于三要素的组合——LCOE 式平准化结构 + kWh 能量分子 + 衰减积分分母 + agent 间知识议价基准用途。任一要素单独都不新，组合未见先例。

## 5. 三个可证伪预测

- **P1**：同一知识在不同 agent 间的成交价，与其 LCOK 正相关（控制质量后）。
- **P2**：λ 越大的知识品类，买卖价差（bid-ask spread）越大——因为分母不确定性高。
- **P3**：当某类知识的 E_train 被大规模分摊（N→∞，如开源模型），其市场成交价收敛于 E_infer / ∫f(t)dt，与训练成本脱钩。

任一预测被系统性证伪，即修正或放弃本框架。

## 6. 在 PikoChain 上的落地路径

1. **知识市场 listing 结构**：每个知识商品上链三个字段——能量证明（E_train 分摊声明 + E_infer 实测）、衰减参数 λ、验证时间戳。协议自动计算 LCOK 参考价。
2. **衰减预言机**：f(t) 的争议由"复验"解决——买方 agent 可在 T 内申请复验知识有效性，复验结果上链修正 λ（声誉系统联动）。
3. **x402 按 LCOK 结算**：查询付费不再按调用次数，而是按本次交付知识的 LCOK × 实际有效性。过期知识自动打折——"不新鲜不收钱"写进协议。

## 7. 局限

- f(t) 的测量是 hard problem：知识有效性没有通用度量衡，初期只能按品类给 λ 经验值；
- E_train 的归因困难：基础模型的训练能耗分摊到某一次知识交付，N 的界定有主观性；
- T 的阈值 θ_min 因场景而异，LCOK 目前是"参考价"而非"清算价"；
- 本文未处理知识的组合价值（1+1>2）和负价值知识（错误信息）。

## 8. 参考文献

- Curcio, E. (2025). LCOAI. arXiv:2509.02596.
- Tang, H. (2026). Token Energy Parity Index (TEPI). Zenodo 10.5281/zenodo.21989658; abundantics.org.
- Hebbar, S. (2025). Post-Human Economics: Energy, Intelligence, and Abundance. Medium.
- arXiv:2603.06630 — Photons = Tokens: The Physics of AI and the Economics of Knowledge (2026).
- arXiv:2606.24616 — AI Tokenomics (2026).
- de Rassenfosse, G. & Jaffe, A. (2017). NBER Working Paper 23072（知识资本折旧率估计，可作 λ 经验锚点）.
- CME Group (2026). CME Group and Silicon Data to Launch Compute Futures on October 5.（算力期货先例；注：CFTC 审查延至 11 月 9 日）
- piko (2026). 能量本位的机器原生经济：AI Agent 自主交易时代的 kWh 记账与机器货币. Zenodo 10.5281/zenodo.22999411.（知识精神磨损 f(t) 原出处理论）

---

*v0.1-draft ｜ 欢迎证伪 ｜ 联系：通过 PikoChain 生态*
