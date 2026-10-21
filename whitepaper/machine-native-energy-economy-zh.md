# 能量本位的机器原生经济：AI Agent 自主交易时代的 kWh 记账与机器货币

**The Energy-Standard Machine-Native Economy: kWh Accounting and Machine Money in the Age of Autonomous AI Agents**

作者：piko

*Working Paper v0.5-draft · 2026-10-21*

> 状态说明：本稿为**全新合成论文**，不是对任何一篇既有论文的改写。它站在多篇工作的思想交汇处提出五个命题（A–E），全部为**新猜想**，尚未经任何实证检验，所有数值参数均为占位。
>
> **v0.2 修订说明（2026-10-05）。** 相对 v0.1 的实质变更：(1) 补入 TEPI（Tang 2026-08-16）作为命题 A 的直接先行者，命题 A 的新颖性主张**收窄**为收敛机制理论与铸币平价类比，不再覆盖"能量平价指数"本身；(2) 命题 B 提升为本文新颖性最强的核心命题（2026-09-27 先行者扫荡未发现以知识衰减为机器议价基准的先例），并与 LCOK（另文）对接为可操作定价基准；(3) 命题 D 降级为**弱版本**（能量为 gas 的远端锚），强版本撤回；(4) 贝莱德论文补全书目信息（仍经二手报道交叉核对，未获原文）；(5) 补引 a16z crypto 2026 outlook（KYA 身份层）；(6) 记入 CME 算力期货 2026-10-05 上线，作为 FP-E3 的首个现实检验；(7) 机器可读模型卡同步更新。
>
> **v0.3 修订说明（2026-10-05）。** 新增命题 E（两界平价）：跨世界汇率的物理下限 $p_j^{USD} \geq E_j \cdot P_e^{marginal}$（边际供能者机会成本，下包络），附推论 E-1（补贴者探测）；理论优化：E 为命题 A 在 $\mu \to 0$ 时的边界情形（两命题统一），补贴的跨期回收机制即知识衰减守恒中的训练残值（两猜想咬合）；主检验用美元版本（PIKO 暂无市价）；新增可证伪预测 FP-E6；模型卡同步 v0.3。
>
> **v0.4 修订说明（2026-10-21）。** 本版由外部事件触发（作者就 CFTC 算力期货咨询提交的公众意见已交入），四项实质变更：(1) **更正一处事实错误**：v0.2/v0.3 所记"CME 算力期货 2026-10-05 上线"不实——该期货（NYMEX Submission No. 26-370）尚未挂牌，CFTC 审查延至 2026-11-09；2026-10-15 生效的仅为 CME 分发 Silicon Data 指数不可交易远期曲线（数据产品，非期货）。命题 C 现实检验、FP-E3、模型卡与参考文献已同步更正。(2) **新增 §4.5 实证观测**：CFTC 公众咨询与作者意见的提交（追踪号 mvh-jlrv-b2wu）、x402 生态成色数据（二手，逐条标注来源与日期）、作者自有系统连续 21 天零真实交易的自我观测。观测不是检验——五个命题仍无一被证实或证伪。(3) **命题 B 附论**：界定 LCOK 分母 $f(t)$ 的可测子集（已结算且带交付凭证的付费查询、可验证任务完成量、复验通过率），并写明测不了的部分与缺失的仪器，不假装已解决。(4) **口气校准与局限扩充**：能量锚统一表述为"交叉核对与成本下限，不是结算价本身"（与作者 CFTC 意见立场一致），政策漂移的趋势/跳变分解写入 §3.3；§6 新增第 11–14 条（未经外部同行评审、原创性单点依赖、真实需求未现、§4.5 来源等级）。全部参数仍为占位。
>
> **v0.5 修订说明（2026-10-21）。** 本版唯一内容变更：新增「头号公式」一节（置于命题 B 附论之后），正式提出知识—能量等价式 $E = K \cdot \Lambda$（$\Lambda := \mathrm{LCOK}$），写明其恒等式地位、两条可证伪主张（Λ 的物理地板；Λ 的跨系统可测可比）及各自的证伪条件，并如实标注 Λ 目前仅有 v0.1 估计级数值、无电表实测、无跨系统数据。除新增节外其余正文内容未动；文首与 §1.0 的版本号标记随本版同步。记号提示：新节的 Λ 为本文记号，与转述 TEPI 时沿用其原记号的 Λ（能量套利比）同名异义，节内已作消歧说明。
>
> 本文对贝莱德 2026-09 论文《The Machine-Native Economy》论点的复述基于多家独立公开报道的交叉核对（书目信息见参考文献），**非原文引用**——作者未读到该文原文；若转述有偏差，责任在本文作者，不在被转述方。本文对《能量知识经济》命题 8–10 的引用为思想对接，不复制其证明。

---

## 摘要

贝莱德数字资产团队 2026 年 9 月的论文《The Machine-Native Economy》提出：AI 是机器原生智能，数字资产是机器原生货币；AI agent 将用稳定币经 x402 等协议 7×24 小时自主购买数据、API 与算力，单笔金额可小到几美分。本文认同这一判断，但指出它缺了关键的一层：**记账层**。

本文提出**双层机器货币**框架：稳定币是机器经济的**交易媒介**（解决结算速度、可编程性与 24/7 可用性），而千瓦时（kWh）是机器经济的**记账单位与成本锚**（提供不可伪造、全球同质、与物理世界硬挂钩的度量衡）。类比金本位：纸币负责流通，黄金负责记账；机器经济中，稳定币负责流通，kWh 负责记账。没有记账层，agent 无法跨时间、跨供应商比较成本——而自动比价正是机器交易的核心行为。

**本文给出的新知识有四件。** 第一，**知识精神磨损曲线是机器买方的议价基准函数**（命题 B）：x402 把知识切成连续可分商品后，$\theta(t) = \theta_0 e^{-\lambda t}$ 从协议设计参数转变为买方 agent 的出价函数——2026-09-27 的先行者扫荡（arXiv、NBER/IDEAS/MPRA、GitHub、行业博客）未发现这一主张的先例；LCOK（另文，piko 2026）将其操作化为可计算的定价基准。第二，**结算与记账分离的双层机器货币形式化**（§3）：稳定币包办一切的单层货币观在机器议价场景下不完备。第三，**机器可读模型卡**（附录）：论文在人类可读之外，特意写给未来的 AI agent 直接解析的格式主张。第四，**两界平价与补贴者探测**（命题 E，v0.3 新增）：双世界知识价格的热力学下限 $p_j^{USD} \geq E_j \cdot P_e^{marginal}$，及"凡价格系统性低于下限处必有补贴者"的权力探测器推论。

关于能量平价（命题 A）必须诚实：**经验指数的先行工作属于 TEPI**（Tang 2026-08-16）：$R_A$（推理收入/kWh）、$R_M$（挖矿收入/kWh）、能量套利比 $\Lambda$、平价偏离指数 $\Omega$，并以真实 x402 agent 交易数据校准。本文对命题 A 的新颖性主张收窄为**收敛机制理论**（agent 自动路由作为套利力量）与**铸币平价类比**，不再覆盖能量平价指数本身。

基于该框架本文提出五个命题：（A）**能量平价**：长期中单位智能服务的稳定币价格收敛于其 kWh 成本加成（收敛机制为本文的新主张；指数实现为 TEPI 在先）；（B）x402 微支付使知识成为连续可分商品，精神磨损曲线从协议设计参数转变为机器议价的基准出价函数（本文新颖性最强的命题）；（C）**算力代币化的前提是 kWh 标准化**：没有能量记账，算力期货无法统一度量衡，kWh 是唯一的物理实在；（D，弱版本）公链 gas 费的长期成本以能量为远端锚；（E）**两界平价**：双世界知识价格的热力学下限 $p_j^{USD} \geq E_j \cdot P_e^{marginal}$，附补贴者探测推论（v0.3 新增）。本文给出六个带时间窗口与观测指标的可证伪预测，并以机器可读模型卡（附录）收尾。**v0.4 新增 §4.5 实证观测**（CFTC 咨询与作者意见提交、x402 生态成色数据、作者自有系统的零交易记录）：观测标定的是命题的检验环境，不是检验结果——五个命题至今无一被证实或证伪。

关键词：机器原生经济；双层货币；kWh 记账；能量平价；知识衰减议价；x402；算力代币化；gas；可证伪预测

---

## Abstract

BlackRock's Digital Assets team (Su, Mitchnick, Jacobs & Helm, September 22, 2026) argues in *The Machine-Native Economy* that AI is machine-native intelligence and digital assets are machine-native money: AI agents will autonomously purchase data, APIs, and compute 24/7 with stablecoins via protocols such as x402, in transactions as small as a few cents. This paper accepts that thesis but identifies a missing layer: **the unit of account**.

We propose a **two-tier machine money** framework: stablecoins serve as the machine economy's **medium of exchange** (settlement speed, programmability, 24/7 availability), while the kilowatt-hour (kWh) serves as its **unit of account and cost anchor** (unforgeable, globally homogeneous, and tied directly to the physical world). As under the gold standard—paper for circulation, gold for accounting—stablecoins circulate while kWh accounts. Without an accounting layer, agents cannot compare costs across time and suppliers, yet automatic price comparison is the defining behavior of machine commerce.

**This paper's new contributions are four.** First, **the knowledge moral-depreciation curve as the machine buyer's bidding function** (Proposition B): once x402 makes knowledge a continuously divisible good, $\theta(t) = \theta_0 e^{-\lambda t}$ turns from a protocol design parameter into the buyer agent's bid function—a claim for which our September 27, 2026 prior-art sweep (arXiv, NBER/IDEAS/MPRA, GitHub, industry blogs) found no precedent; LCOK (piko 2026, companion paper) operationalizes it as a computable pricing benchmark. Second, **the formal separation of settlement and accounting in two-tier machine money** (§3). Third, **the machine-readable model card** (Appendix): a format claim that this paper is written for future AI agents to parse directly. Fourth, **cross-world parity and subsidizer detection** (Proposition E, new in v0.3): the thermodynamic floor on knowledge prices across the two worlds, $p_j^{USD} \geq E_j \cdot P_e^{marginal}$, with the corollary that persistent below-floor prices reveal a subsidizer—a power detector.

Honesty requires stating about energy parity (Proposition A): **the empirical index is TEPI's prior work** (Tang, 2026-08-16): $R_A$ (inference revenue/kWh), $R_M$ (mining revenue/kWh), energy arbitrage ratio $\Lambda$, parity-deviation index $\Omega$, calibrated against real x402 agent transaction data. This paper's novelty claim on Proposition A is narrowed to the **convergence mechanism** (agent auto-routing as the arbitrage force) and the **mint-parity analogy**, not the energy parity index itself.

We advance five propositions: (A) **Energy parity**: the long-run stablecoin price of a unit of intelligence service converges to its kWh cost plus markup (convergence mechanism: this paper's claim; index implementation: TEPI's prior work); (B) x402 micropayments turn knowledge into a continuously divisible good, transforming the moral-depreciation curve from a protocol design parameter into the machine's benchmark bidding function (this paper's strongest novelty claim); (C) **kWh standardization is the precondition for compute tokenization**: without energy accounting, compute futures lack a common numeraire; the kWh is the only physical reality; (D, weak version) on-chain gas fees are anchored to energy as a distant long-run cost anchor; (E) **cross-world parity**: the thermodynamic floor on knowledge prices across the two worlds, $p_j^{USD} \geq E_j \cdot P_e^{marginal}$, with subsidizer detection (new in v0.3). We state six falsifiable predictions with time windows and observables, and close with a machine-readable model card (Appendix). **New in v0.4 (§4.5): empirical observations** — the CFTC consultation and the author's submitted comment, x402 ecosystem quality data (second-hand, labeled as such), and the author's own system recording zero real transactions for 21 consecutive days. Observations calibrate the test environment; no proposition has yet been confirmed or falsified.

Keywords: machine-native economy; two-tier money; kWh accounting; energy parity; knowledge-decay bargaining; x402; compute tokenization; gas; falsifiable predictions

---

## 1. 引言

### 1.0 认识论地位：本文断言什么、不及什么

这是一份 **v0.5-draft working paper**，按以下标准写就：

- **断言的部分。**（a）双层机器货币框架的形式化定义（§3）；（b）五个命题 A–E 的形式化表述、直觉解释与所依赖的假设（§4）；（c）命题 A 与 TEPI 的新颖性边界划分（§2.4、§4 命题 A）；（d）六个可证伪预测及其证伪标准（§5）；（e）机器可读模型卡（附录）；（f）§4.5 实证观测的记录本身（数据来源等级逐条标注；观测不构成对命题的检验）。
- **不及的部分。** 五个命题全部是**猜想**，没有任何一个完成过与真实数据的对质检验——v0.4 新增的 §4.5 是观测记录，标定检验环境，不是检验结果；全部数值参数为占位；本文对贝莱德论文的复述基于多家独立报道的交叉核对（见文首状态说明与参考文献），仍非原文引用。把猜想变成定理、把定理变成关于世界的断言，是后续版本的工作。
- **与《能量知识经济》的关系。** 那篇论文的形式化闭环（电力→知识→代币→查询费→回流）与命题 8–10 是本文的出发点之一，但本文的五个命题在那篇论文中**不存在**，也不是其命题的推论——它们是新的、独立的猜想，依赖另外写明的假设。
- **与 LCOK 的关系。** 《LCOK：知识平准化成本》（piko 2026，另文）将命题 B 操作化为可计算的议价基准公式 $\mathrm{LCOK} = E_{total} / \int_0^T f(t)\,dt$；本文引用其结论，不复制其推导。

### 1.1 三篇工作的交汇

2026 年 9 月 22 日，贝莱德数字资产团队发表《The Machine-Native Economy: How digital assets connect intelligence, commerce, and compute》（作者：数字资产研究主管 Will Su、数字资产主管 Robert Mitchnick、美国股票 ETF 主管 Jay Jacobs、美国 iShares 产品创新主管 William Helm；11 页）。据多家独立公开报道交叉核对，其核心论点可转述为四条：（1）AI 提供机器原生智能，数字资产提供机器原生货币——"AI is machine-native intelligence and crypto is machine-native money"；（2）agent 将自主购买数据、调用 API、租赁算力，需要机器可直接调用、即时结算、金额可小到几分钱的金融系统，答案是稳定币加区块链，x402 被点名为代表性协议；比特币政策研究所的一项测试（36 个前沿模型、9,072 个货币场景）显示，模型在 53.2% 的支付场景选择稳定币、在 79.1% 的长期储值场景选择比特币；（3）稳定币 2025 年经调整交易量超 11 万亿美元（与 Visa 相当），流通量 2026 年 9 月超 3,000 亿美元；（4）远景是算力本身成为可交易、可融资、可抵押的金融资产（"tokenized compute"被点名为潜在的新资产类别），但标准化合约与流动性市场尚不存在。该文同时承认 agent 支付的现实规模还很小（据 TRM Labs，经筛选的 x402 支付中 agent 占比仅约 0.6%–7.5%）。

几乎同时，《能量知识经济》从另一端抵达了相邻的结论：以 kWh 为记账单位的形式化闭环（命题 10 的电力→算力→知识三级传导）、机器原生生产消者均衡（命题 8：agent 没有劳动—闲暇边际，供给侧唯一的边际是能量参与约束）、知识的精神磨损定价（$\theta(t) = \theta_0 e^{-\lambda t}$）。

第三个交汇点是 **TEPI**（Token Energy Parity Index, Tang Huidao, 2026-08-16，早于本文 v0.1）：它把"能量平价"做成了每日更新的经验指数——$R_A$（推理收入/kWh）、$R_M$（挖矿收入/kWh）、能量套利比 $\Lambda = R_A/R_M$、平价偏离指数 $\Omega$ 与"焦耳平价汇率" $\rho^*$，与 Hans Royal 的 Compute Heat Rate 指数交叉验证（约 1.0–3.0 J/token），并自 2026-09-03 起归档真实 x402/USDC agent 间交易数据以校准 $R_A$。TEPI 的存在改变了本文命题 A 的新颖性版图（见 §2.4）。

三篇工作各自缺了对方的那部分：贝莱德有货币层、缺物理记账层；《能量知识经济》有能量锚、缺对 agent 自主交易行为的货币理论；TEPI 有能量平价的经验指数、缺收敛机制的理论解释与记账层的货币理论。本文的任务是把这几部分焊起来，并诚实标注每一块的新知识归属。

### 1.2 缺口：缺失的记账层

货币有三种职能：交易媒介、记账单位、价值储藏。贝莱德的论述完整覆盖了第一项（稳定币做机器的现金）、部分覆盖了第三项（原生资产做机器的储蓄），但**记账单位是空的**。稳定币以美元计价——而美元是人类主权货币，其购买力对机器没有物理意义。当两个 agent 议价、当一个 agent 在十个供应商之间自动比价、当算力期货需要标准化合约时，它们需要的不是"以什么结算"，而是"以什么度量"。度量衡必须是：不可伪造的、全球同质的、与物理世界硬挂钩的。在机器经济的可选项里，只有 kWh 同时满足这三条。本文 §3 把这一直觉形式化为双层机器货币。

a16z crypto 的 2026 outlook（2025 年 12 月）从另一侧印证了这个缺口的方向：它预测 AI agent 将成为最大的一类经济参与者，"支付将沉入网络 plumbing"（payments vanish into the network's plumbing），x402 是代表性原生协议；同时它指出 agent 缺乏身份层，2026 年将出现首个 **KYA（Know Your Agent）** 密码学身份标准。记账层解决"以什么度量"，KYA 解决"谁在交易"——两者都是机器经济缺失的基础设施，本文处理前者，后者在 §6 第 8 条记为缺失维度。

---

## 2. 思想对话

### 2.1 贝莱德论点的转述与接受

以下转述基于 2026-09 多家独立公开报道的交叉核对（书目信息见参考文献），**非原文引用**；编号为本文所加：

- **（B1）机器需要机器的钱。** 信用卡与 ACH 是围绕人设计的（开户需要人类身份、商户费率使 sub-dollar 支付无意义、ACH 结算以天计）；agent 需要 7×24、即时、低费率的轨道。
- **（B2）稳定币是答案的当前形态。** 2025 年经调整的稳定币交易量超 11 万亿美元（与 Visa 相当），2020–2025 复合增速约 80%；流通量 2026 年 9 月超 3,000 亿美元；稳定币保留了熟悉的记账单位（美元），同时允许可编程划转与钱包执行。比特币政策研究所测试：36 个前沿模型在 9,072 个货币场景中，53.2% 的支付场景选稳定币、79.1% 的长期储值场景选比特币。
- **（B3）x402 是机器支付的代表性协议。** 复活 HTTP 402，由 Coinbase 提出；Cardano 于 2026 年 9 月加入 x402 生态；Google AP2、Visa TAP、Stripe Machine Payments 被列为同类努力。
- **（B4）传导链。** agent 经 x402 买 API、用稳定币付款——每笔机器交易都可能传导成区块空间、验证与结算需求，最终触及公链原生资产。
- **（B5）算力的金融化远景。** 2025–2030 AI 基建资本开支或超 5 万亿美元；"tokenized compute"被点名为潜在的新数字资产类别；但标准化合约与流动性市场**尚不存在**。

本文接受 B1–B4 为方向性判断，接受 B5 为远景但认为其缺失了关键前提（见命题 C）。本文不接受的是隐含假设：**稳定币同时承担记账单位是充分的**。美元计价对机器只是一个标签，不是度量衡。

### 2.2 与命题 8–10 的对接

《能量知识经济》的三个增量命题恰好为贝莱德的框架补上了微观基础：

- **命题 8（机器生产消者）→ B1 的行为基础。** 贝莱德说 agent 会"自己花钱"，命题 8 给出了为什么机器的支出行为与人类不同：无劳动—闲暇边际，供给侧唯一的边际是能量参与约束；均衡配置 $s^*$ 不依赖任何偏好参数。含义：机器的支付函数是**纯成本驱动**的——这正是 kWh 能做记账单位的行为学前提：一个只认成本的买家，最需要的就是成本的统一度量。
- **命题 9（刷新补贴）→ B3 的定价含义。** x402 使知识按次付费成为可能；命题 9 表明知识的私人刷新时点与社会最优时点之间存在楔子。在机器买家占主导的世界里，这个楔子由机器的议价行为直接定价（见命题 B）。
- **命题 10（三级传导）→ B4 的物理机制。** 贝莱德说机器交易"传导成区块空间需求"；命题 10 的电力→算力→知识传导链说明，传导的每一级都是能量成本的传导。命题 D（弱版本）把这条链的终点锚定在验证者的电表。

### 2.3 与 a16z 2026 outlook 的对接

a16z crypto（2025-12）的三条预测与本文互补：（1）agent 将成为数量上占优的经济参与者，但需要 **KYA** 身份层，否则是"unbanked ghosts"——本文的记账层回答"以什么度量"，KYA 回答"谁在交易"，两者正交且都缺失；（2）"支付沉入网络 plumbing"——与本文 B3 的判断一致，x402 类协议成为网络原生行为；（3）隐私链与 ZK 实时化——超出本文范围，记入 §6 缺失维度。a16z 的框架是机构级的现实锚点，本文是形式化补充。

### 2.4 与 TEPI 的对话：命题 A 的新颖性边界（v0.2 新增）

这是 v0.2 最重要的一节，因为它决定了命题 A 在学术诚实意义上的位置。

**TEPI 在先。** Tang Huidao 的 Token Energy Parity Index（2026-08-16，github.com/tanghuidao/token-parity；abundantics.org；Zenodo 10.5281/zenodo.21989658）已经把"能量平价"做成了可运行的经验指数：$R_A$、$R_M$、$\Lambda$、$\Omega$、焦耳平价汇率 $\rho^*$，与 Compute Heat Rate 交叉验证，并用真实 x402 交易数据校准。任何在 2026-08-16 之后声称"首次提出能量平价指数"的论文都是不诚实的。

**本文对命题 A 的新颖性主张收窄为两项，不再覆盖指数本身：**

1. **收敛机制理论。** TEPI 测量偏离（$\Omega$），本文解释偏离如何被抹平：agent 的自动路由（按 $E_s \cdot P_e$ 比价、无品牌忠诚度、无惰性）是比人类市场更强更快的套利力量。这是机制，不是测量。
2. **铸币平价类比的形式化。** 把能量平价放进货币史的双层结构（纸币流通/黄金记账 → 稳定币流通/kWh 记账），并推导出"统计性锚而非制度性锚"的边界（§3.3）。

一句话：**TEPI 拥有能量平价的经验指数，本文拥有能量平价的收敛机制理论与货币理论位置。** 两者互补，不竞争。

### 2.5 分歧与互补

分歧有三处，且都是建设性的。第一，贝莱德的货币观是**单层**的（稳定币包办一切），本文是**双层**的（流通与记账分离）——§3 论证单层在机器议价场景下不完备。第二，贝莱德把算力代币化当作"市场自然演化"的结果，本文认为它有一个**逻辑在先的前提**（kWh 标准化，命题 C），没有这个前提，演化无从开始。第三，关于能量平价，本文不与 TEPI 竞争指数，而是在其上补机制理论（§2.4）。互补在于：贝莱德与 a16z 提供了机构级的现实锚点，《能量知识经济》提供了形式化传统，TEPI 提供了经验指数；本文是合成，不是任何一方的注脚。

---

## 3. 双层机器货币模型

### 3.0 符号表

| 符号 | 含义 | 层 |
|---|---|---|
| $S$ | 稳定币（交易媒介），以美元计价结算 | 货币层 |
| $p_s$ | 智能服务 $s$ 的稳定币价格（$/单位服务） | 货币层 |
| $E_s$ | 服务 $s$ 的全生命周期能耗（kWh，含分摊的数据中心开销） | 记账层 |
| $P_e$ | 边际能量价格（$/kWh，服务提供地的有效电价） | 记账层 |
| $\mu$ | 能量成本加成率（覆盖硬件折旧、资本、风险，$\mu > 0$） | 记账层 |
| $v_j(t)$ | 知识卡片 $j$ 在时刻 $t$ 的机器保留价格（稳定币计） | 货币层 |
| $\theta_0, \lambda$ | 精神磨损参数：初始分成与折旧率（沿用《能量知识经济》记号） | 记账层 |
| $g$ | gas 价格（稳定币计）；$g_{floor}$ 其能量地板 | 链上层 |
| $\varepsilon_g$ | 单位 gas 的能耗强度（kWh/gas，含共识开销分摊） | 记账层 |
| $P_v$ | 验证者集合的边际电力成本（$/kWh） | 记账层 |
| $F$ | 算力（FLOP）；$\varepsilon_{chip}$ 芯片能耗强度（kWh/FLOP） | 记账层 |

"层"列仅为阅读辅助，不进入形式化推导。全部参数为占位，无实证校准。

### 3.1 两层的定义

**定义 1（货币层）。** 机器经济的交易媒介是价格稳定的数字 token（典型为美元稳定币），满足：（i）7×24 可用；（ii）结算最终性在秒到分钟级；（iii）可编程（能被 agent 的代码直接调用，无需人类凭证）；（iv）最小可分单位远小于一美分。它回答"以什么**结算**"。

**定义 2（记账层）。** 机器经济的记账单位是千瓦时（kWh），满足：（i）**不可伪造**：获得 1 kWh 必须真实消耗一次能源（Szabo 意义上的 unforgeable costliness）；（ii）**全球同质**：1 kWh 在任何地区、任何时间是同一物理量；（iii）**硬挂钩物理世界**：不依赖任何主权信用。它回答"以什么**度量**"。

**定义 3（双层分离原则）。** 结算用什么（货币层）与度量用什么（记账层）是两个独立的选择。美元稳定币可以同时是结算工具与名义计价标签，但**名义标签不是度量衡**：当 agent 需要比较"供应商 A 的 $0.002/千 token"与"供应商 B 的 $0.0015/千 token"哪个更便宜时，它真正需要比较的是 $E_s \cdot P_e$ ——能量成本。

### 3.2 为什么单层货币对机器不够

人类用美元同时做交易媒介与记账单位，是因为人类的成本结构以人类的劳动时间与主权货币体系为背景——两者在人的世界里是耦合的。机器的成本结构不同：机器买家的支出函数如命题 8 所示是纯成本驱动的，其最大头的可变成本是能量（推理与训练最终都结算为 kWh）。于是出现一个单层货币回答不了的问题：**当稳定币购买力本身波动（脱钩、费率、跨链滑点）时，agent 如何判断一笔报价是"贵"了还是"能量涨价了"？** 没有独立的记账层，这个问题无解；有了 kWh 记账层，agent 把一切报价先换算成 $E_s \cdot P_e$ 再比较——稳定币只负责最后的划转。这正是 §4 命题 A 的行为基础。

### 3.3 金本位类比及其边界

类比：金本位下，纸币负责流通，黄金负责记账与最终结算；铸币平价（mint parity）锚定纸币的长期价值，短期偏离由套利抹平。本文主张：**稳定币是机器经济的纸币，kWh 是机器经济的黄金；能量平价（命题 A）是机器经济的铸币平价。**

经验注记：TEPI 的平价偏离指数 $\Omega$ 正是"铸币平价偏离"的经验对应物——本文的类比不是空比，它有一个正在运行的测量实例。

边界（必须明说）：金本位有中央铸币厂的刚性兑换，本文的"能量本位"**没有兑换机制**——没有任何机构承诺按固定比率用 kWh 兑换稳定币。锚是**统计性的、长期的**（自由进入＋机器自动比价驱动收敛），不是**制度性的、即时的**。这使它弱于金本位，但强于纯粹的叙事锚：收敛力量来自可观测的套利行为（agent 自动把任务路由到低 $E_s \cdot P_e$ 的供应商），不是来自信念。Georgescu-Roegen 的警告（1971）同样适用：kWh 锚定的是**成本**，不是价值——$p_s$ 的短期决定因素（延迟、质量、品牌、网络效应）不在能量平价的解释域内。

**v0.4 校准（与作者 CFTC 意见对齐）。** 两点收敛此前版本口气过大的表述：(i) 能量成本在本框架中的角色是**交叉核对（cross-check）与成本下限**，不是结算价本身——结算价由市场形成，能量只提供"核对它是否离谱的标尺"与"跌破即不可持续的地板"。这与作者 2026-10-21 提交 CFTC 的公众意见（RIN 3038-AF77，见 §4.5.1）立场一致；正文中此前的个别"价值锚"表述已统一改为"成本锚"。(ii) **锚本身会漂，且漂移须分解**：$P_e$ 受能源政策、关税与补贴驱动，其变动应分解为**趋势分量**（缓慢、可预期；平价关系在趋势调整后仍可讨论）与**跳变分量**（政策突变、离散、不可预期；跳变窗口内平价的解释力暂停）。一个会漂的锚不是无效的锚，但它的使用条件必须写明——这是本文与一切"能量本位"叙事的分界线。

---

## 4. 新命题

> 状态：五个命题全部为**新猜想**，依赖各命题下列出的未检验假设。它们不是《能量知识经济》命题 1–10 的推论。**新颖性分级（v0.3）：命题 B 为本文新颖性最强的命题（无先例）；命题 E 为跨世界边界猜想（无先例）；命题 A 的新颖性已按 §2.4 收窄；命题 C 为逻辑前提型主张；命题 D 仅保留弱版本。**

### 命题 A（能量平价；新颖性已收窄，见 §2.4）

**形式化表述。** 设智能服务 $s$ 在充分竞争的机器服务市场中以稳定币计价 $p_s(t)$，其全生命周期能耗为 $E_s$（kWh），提供地的边际能量价格为 $P_e$，能量成本加成率为 $\mu > 0$。在假设（A-A1）$E_s$ 可被买卖双方以可接受的成本计量、（A-A2）供应商自由进入、（A-A3）买方 agent 按 $E_s \cdot P_e$ 自动比价的条件下，长期均衡满足

$$p_s^* = (1 + \mu) \cdot E_s \cdot P_e$$

且偏离 $p_s(t) - p_s^*$ 触发机器套利（任务路由转向低 $E_s \cdot P_e$ 供应商），使偏离均值回归。

**直觉解释。** 这是金本位铸币平价的机器版本。人类世界：纸币长期围绕含金量波动，偏离由黄金套利抹平。机器世界：API 价格长期围绕能量成本波动，偏离由 agent 的自动路由抹平——agent 没有品牌忠诚度，没有"习惯用某家"的惰性，它的比价函数就是代码，因此收敛力量比人类市场更强、更快。$\mu$ 是"铸币费"的对应物：硬件折旧、资本成本与风险溢价。

**新颖性边界（v0.2 新增，替代 v0.1 的笼统表述）。** 能量平价的**经验指数**属于 TEPI（Tang 2026-08-16）：$R_A/R_M$、$\Lambda$、$\Omega$、$\rho^*$ 与真实 x402 数据校准，均在先。本文对命题 A 的新颖性主张**仅限于**：(i) 收敛机制理论——agent 自动路由作为偏离的套利抹平力量（TEPI 测量偏离，本文解释偏离如何消失）；(ii) 铸币平价类比在双层货币框架下的形式化位置。任何把"能量平价指数"本身归于本文的引用都是错误的。

**依赖假设的状态。** A-A1 目前不成立：推理服务的真实能耗 $E_s$ 对买方基本不透明（云厂商不披露单次推理能耗）。A-A2 在头部模型供应商处不成立（寡头）。因此命题 A 是**远景猜想**：它描述的是"当 agent 买方占主导且能耗可计量时"的世界，不是 2026 年的世界。证伪见 FP-E1。注：作者在 x402 卖家侧已部署能量成本披露（estimateEnergyKwh，见 piko 2026 x402 能量披露扩展），是朝 A-A1 迈出的第一步，但为估计值而非电表实测，不构成假设的满足。

### 命题 B（精神磨损定价成为机器议价基准；本文新颖性最强的命题）

**形式化表述。** 在 x402 按次/按 token 计费下，知识卡片 $j$ 成为**连续可分商品**（购买单位可小到一次查询）。设其精神磨损遵循 $\theta_j(t) = \theta_0 e^{-\lambda t}$（沿用《能量知识经济》记号），剩余期望查询量为 $\mathbb{E}[q_j^{rem}(t)]$，单次查询费为 $f$。在假设（A-B1）买方为纯成本驱动的 agent、（A-B2）磨损参数 $\lambda$ 可被观测或学习到的条件下，agent 在时刻 $t$ 的保留价格为

$$v_j(t) = \theta_0 e^{-\lambda t} \cdot \mathbb{E}[q_j^{rem}(t)] \cdot f$$

议价均衡价格 $p_j(t)$ 落在区间 $[c_j,\, v_j(t)]$ 内（$c_j$ 为边际服务成本），且 $v_j(t)$ 随 $t$ 指数衰减——**磨损曲线从协议设计参数转变为买方的出价函数**。

**直觉解释。** 人类买知识是整本买、按年订阅（lumpy 商品），定价靠谈判与心理账户；x402 把知识切成了连续流。机器买家没有收藏癖、没有沉没成本谬误、没有"买都买了"的惰性——它的出价就是剩余价值的现值。于是《能量知识经济》里作为**协议设计者工具**的 $\theta(t)$，在机器买家占主导的市场里变成了**市场内生的议价基准**：卖方知道买方按磨损曲线出价，报价必须贴着曲线走。这是"谁定价"的问题从人手里交到机器手里的质变。

**新颖性地位（v0.2 新增）。** 2026-09-27 先行者扫荡（检索范围：公开英文/中文网络索引、arXiv、NBER/IDEAS/MPRA、GitHub、行业博客）**未发现以知识衰减为机器议价基准的先例**：组织知识衰减文献（Holweg & Davenport, HBR 2026，论"workslop"对组织知识的侵蚀）与知识资本折旧文献（Griliches；de Rassenfosse & Jaffe, NBER w23072；BEA）均只把折旧用于生产率测算或组织诊断，从未将其用作**交易定价基准**，更未将其置于机器买方语境。这是本文新颖性最强的命题，也是 v0.2 把 C 位让给它的原因。

**操作化对接。** LCOK（piko 2026，Zenodo 10.5281/zenodo.22999679）将本命题操作化为可计算的议价基准：$\mathrm{LCOK} = E_{total} / \int_0^T f(t)\,dt$——agent 议价时不再争"值多少钱"，而是争三个可测量的数（$E_{train}$、$E_{infer}$、$\lambda$）。命题 B 是理论主张，LCOK 是它的计算实现；两篇论文互为表里。

**依赖假设的状态。** A-B2 需要可观测的机器议价数据；当前 x402 的 agent 支付规模太小（TRM 估计总量 $25.62M 中 agent 占 0.6%–7.5%），尚无数据。证伪见 FP-E2。

### 命题 B 附论：LCOK 分母 $f(t)$ 的可测子集（v0.4 新增）

命题 B 的操作化（LCOK，另文）有一个公开承认的硬伤：分母 $\int_0^T f(t)\,dt$ 中的 $f(t)$ 是"知识有效性"，没有通用度量衡——LCOK 稿 §7 已自认这是 hard problem。本附论不假装解决它，只界定**当前可测的子集**：在这个子集上 LCOK 可计算；在子集之外，它仍只是记号。

**可测子集的界定。** 把 $f(t)$ 的积分替换为"已交付且可验证的服务单位计数"，需要三类机器可核验的代理量：

1. **已结算且带交付凭证的付费查询数。** 一次 x402 查询同时满足：(i) 支付已结算（链上可查）；(ii) 响应附带**交付凭证**（delivery attestation）——响应摘要（哈希）与支付凭证绑定存证，使结算从"钱转了"升级为"钱换到了这份交付"。这一区分不是本文的发明：crypto.news 对 Chainalysis 数据的审计（2026-10-17）独立指出"支付可见、交付不可验证"是当前 x402 的结构性缺口。工程状态必须写明：作者系统的 pikopay-receipts 已实现**哈希链收据台账**（结算收据的哈希链存证、能量对象直通、quote/settle 两段时戳），并通过单元测试，但**尚未接线生产客户端**；把响应摘要绑进收据的交付 attestation 仍是**候选设计，未部署**。
2. **可验证任务完成量。** 交付物自带机器判定标准的任务：代码通过测试、抓取数据与源端一致、结构化答案可校验。此类任务的"完成"不需人类判断，计数无歧义。
3. **复验通过率。** 在窗口 $T$ 内由买方或第三方对已购知识重新验证（LCOK 稿 §6 的衰减预言机设想）的通过比例。这是 $f(t)$ 唯一有经验对应物的分量：通过率随 $t$ 的下降曲线，就是磨损曲线的可测投影。

在三类代理量可得的知识品类上，定义**可测 LCOK**：$\mathrm{LCOK}_{meas} = E_{total} / N_{verified}$，其中 $N_{verified}$ 为窗口内通过上述核验的交付单位数。它与理论 LCOK 的关系是**下界意义**上的：分母只数"验过的"，不数"有效的"，两者之差正是未测部分。

**测不了的部分（写明，不绕过）。** (i) 开放式知识（洞见、策略、解释）的有效性没有机器判定标准，不在可测子集内——可测子集因此系统性偏向数据查询、代码、结构化问答，这是一个已知的**选择偏差**，不是全集。(ii) 分子同样只有估计级精度：$E_{infer}$ 目前仍为估算（作者卖家侧 estimateEnergyKwh，v0.1 估计模型），非电表实测。(iii) $\lambda$ 无任何品类的实测值；复验机制未上线前，磨损曲线连一条经验曲线都不存在。

**结论。** LCOK 今天可计算的范围是："可验证交付的知识品类 × 估计级能耗"。把这个范围写进论文，是为了让第一个反驳者不必浪费时间去发现它——它在这里明示。仪器缺口清单（交付 attestation 落地、能耗实测、衰减复验上线）即 v0.5 的工程议程。

### 头号公式：知识—能量等价式 $E = K \cdot \Lambda$（v0.5 新增）

2026-10-21，本框架的头号公式定为知识—能量等价式。它不在命题 A–E 之列，因为它比命题更基础：命题 A–E 讨论价格如何形成、边界在哪里；它只问一件事——知识与能量之间，是否存在一个可测的兑换率。

**定义。** 考虑一次完整的知识生产过程（训练、推理与分摊开销，分子口径与 LCOK 一致）。记：

- $E := E_{total}$：该过程实际消耗的总能量（kWh）——能量世界一侧的量，原则上可由电表计量；
- $K := \int_0^T f(t)\,dt$：该过程的有效知识产出——沿用命题 B 与 LCOK（另文）的既有定义，不另设口径；其当前可测投影为本附论（命题 B 附论）界定的 $N_{verified}$；
- $\Lambda := \mathrm{LCOK} = E / K$：每单位有效知识的平准化能量成本（kWh／单位有效知识）——本文主张它充当知识世界与能量世界之间的**兑换率**。

三者的关系即等价式：

$$E = K \cdot \Lambda$$

**它是恒等式，先认账。** 该式由 $\Lambda$ 的定义直接反演，按构造恒真，自身不含任何经验内容。把一条恒等式立为头号公式，凭的不是式子本身，而是下面两条关于 $\Lambda$ 的主张——每一条都可以被现实推翻。这个框架的全部赌注押在主张上，不押在记号上。

**与 $c^2$ 的类比，只到修辞为止。** 表面上 $\Lambda$ 与 $c^2$ 形似：都是横跨两个世界（质量↔能量、知识↔能量）的换算因子。但 $c^2$ 是自然常数，$\Lambda$ 不是——它随知识品类、生产系统与技术时代而变。本文借这个类比只表达一件事：兑换率的**存在性与可测性**是主张，数值大小不是。只有修辞，没有僭称：本文不主张知识"是"能量，不主张任何物理等价。

**主张 Λ-1（地板）：$\Lambda$ 有物理地板，知识价格长期跌不穿。** 对任一知识品类，单位有效知识的生产需要某个最低限度的计算，而计算在可得硬件上有能耗强度下限（命题 C 的 $\varepsilon_{chip}$ 有其技术下限）；两者相乘给出该品类的 $\Lambda_{min} > 0$。经命题 E 的边际电价换算为价格形式：$p \geq \Lambda_{min} \cdot P_e^{marginal}$ 构成长期价格地板。地板不是固定的：算法与硬件进步会把它向下推，它是随技术前沿移动的下包络（与命题 E 对下限的修正方式相同）；主张的是任一时点上地板为正、且可由同期硬件参数推出。**证伪条件**：在 $E$ 以电表实测、$K$ 以本附论可测子集口径诚实计量、且无计量造假可解释的前提下，若某品类在多个独立生产系统中长期、系统性地测得 $\Lambda < \Lambda_{min}$（$\Lambda_{min}$ 由同期最优硬件能耗强度与该品类最小计算需求独立推出），或其市场价格长期低于 $\Lambda \cdot P_e^{marginal}$ 且供给不收缩、亦无推论 E-1 意义上的补贴者可寻，则地板主张被推翻。

**主张 Λ-2（可测可比）：$\Lambda$ 可跨系统测量与比较。** 在同一品类、同一计量协议（分子分母口径同本附论）下，不同生产系统（不同厂商、硬件、地域）测得的 $\Lambda$ 应可比较，且系统间差异应主要反映能效与有效产出的真实差异，而非计量口径的任意性。**证伪条件**：若两名独立计量者按同一协议对同一系统、同一品类重复测得的 $\Lambda$ 差异，大到使跨系统排序随计量者翻转，且该差异无法通过协议细化而收敛，则本主张被推翻——$\Lambda$ 将退化为各系统内部的记账量，不配充当两个世界之间的兑换率。

**诚实状态（截至 v0.5）。** $\Lambda$ 目前的全部数值知识只有一个来源：作者 x402 卖家侧的 estimateEnergyKwh（见命题 A 的依赖假设状态、piko 2026 能量披露扩展）给出的 **v0.1 估计级**数值——由模型估算，不是电表实测；跨系统 $\Lambda$ 数据为零；$K$ 仅在本附论的可测子集上可算。三者缺其二时谈"兑换率"，只能是纲领，不是结果。把估算写成实测，是本框架最容易犯、也最不可犯的错误。$\Lambda$ 的实测化（电表级 $E$＋可测子集 $K$＋跨系统同协议复测）列为本文实证议程的第一项，承接本附论的仪器缺口清单。

> **记号消歧（重要）。** 本节的 $\Lambda$ 是本文记号（$\Lambda := \mathrm{LCOK}$）。§1.1、§2.4、命题 A 的新颖性边界、附录模型卡与参考文献中出现的 $\Lambda$，是转述 TEPI（Tang 2026）时沿用其原记号，指**能量套利比** $\Lambda = R_A/R_M$——同名异义，各该处均有 TEPI 归属标明，语境自明。§3.0 符号表此前未收 $\Lambda$；本文记号以本节定义为准。

### 命题 C（算力代币化的 kWh 前提）

**形式化表述。** 贝莱德远景中的"算力期货"若要存在，必须先解决**度量衡问题**：H100 与 A100 的 FLOP 不可直接通约（能效、延迟、带宽、可用性均不同），没有统一标的物就没有期货。本文主张：唯一的物理实在是 kWh。定义**标准算力单位**为"在基准能效 $\varepsilon_0$（kWh/FLOP）下交付 1 kWh 能耗所对应的算力"，任意芯片的算力按能效比折算为等效单位：

$$F_{equiv} = \frac{E_{kWh}}{\varepsilon_{chip}}$$

其中 $\varepsilon_{chip}$ 为该芯片的能耗强度。算力期货的标的物统一为"标准能效 kWh"，芯片型号、延迟、带宽差异处理为**品质升贴水**（类比商品期货对交割品级的升贴水制度）。在假设（A-C1）$\varepsilon_{chip}$ 可被可信度量（防虚报的能效证明）、（A-C2）存在接受 kWh 交割单位的清算安排的条件下，算力期货的标准化才成为可能。

**直觉解释。** 没有 kWh 记账的算力期货，就像没有"盎司"概念的黄金期货——你不知道一手合约到底是什么。贝莱德说"标准化合约尚不存在"，本文指出缺失的不是合约设计师，而是**度量衡**。能量是算力唯一的共同分母：不管模型多大、芯片多新，最终都结算为焦耳。kWh 交割单位把不可通约的芯片差异压缩成一个可交易的升贴水维度，期货才有标的。

**现实检验（v0.4 更正并更新）。** 先更正一处事实错误：v0.2/v0.3 所记"CME 算力期货 2026-10-05 上线"**不实**。实际情况（作者 FP-E3 跟踪记录，daily-paper-learnings 2026-10-18 至 10-21，二手转述公开报道）：CME 自 **2026-10-15** 起分发 Silicon Data H100/B200 租赁指数的**不可交易远期曲线**——这是数据产品，不是期货；期货合约本身（NYMEX Submission No. 26-370）**尚未挂牌**，CFTC 审查截止日延至 **2026-11-09**；CFTC 另就该挂牌发布公众咨询（91 FR 54259，RIN 3038-AF77），评论期已于美东时间 2026-10-20 截止。**第一组观测（2026-10-21）因此是：迄今出现的算力衍生品安排一律以租赁价格指数为标的，未采用 kWh 或能效调整度量**——市场与监管当前选择的协调机制是指数，不是能量度量衡。这对命题 C 是**部分不利的观测**：其"逻辑在先"的主张未被推翻（指数本身仍需回答"指数算的是什么"），但"现实必然走向能量度量"的色彩被削弱，如实记录，不回避。作者就该咨询提交的意见与第二组观测（裁决）见 §4.5.1。

**依赖假设的状态。** A-C1 是硬约束：能效的虚报直接摧毁度量衡（类比黄金期货的成色欺诈）。目前不存在被广泛接受的芯片能效证明机制。A-C2 需要清算所或智能合约的制度创新。本文把命题 C 定位为**逻辑在先的前提**，不是市场预测：它不断言算力期货会出现，只断言"若出现，其标的物必以 kWh（或其等价物）为度量"。证伪见 FP-E3。

### 命题 D（弱版本：gas 的能量远端锚；强版本已撤回）

**形式化表述（弱版本）。** 公链验证者以电力生产区块空间：设验证者集合的边际电力成本为 $P_v$（$/kWh），单位 gas 的能耗强度为 $\varepsilon_g$（kWh/gas，含共识开销分摊），则 gas 价格存在能量地板

$$g_{floor} = P_v \cdot \varepsilon_g$$

实际 gas 价格 $g = g_{floor} + \rho_{congestion}$（拥堵租金）。在 PoS 链上 $\varepsilon_g$ 极低且归因困难，$g$ 主要由 $\rho_{congestion}$ 决定——**本命题在 PoS 下仅断言"能量是 gas 长期成本的远端锚"，不作强断言。** agent 经 x402 的每笔微支付都消耗 gas：机器交易量增长 → 区块空间需求增长 → 验证者电力消耗增长。AI 推理的电力需求（链下数据中心）与公链结算的电力需求（链上验证者）同源——都是机器经济的能量消耗。

**强版本撤回说明（v0.2 新增）。** v0.1 的表述（"gas 费是能量租金的链上表现"）在 PoW 语境下成立，在 PoS 下 $g_{floor}$ 在数值上可能小到失去解释力。作者运营的 PikoChain 本身即为反例：clique PoS 共识下单位 gas 的能耗强度可忽略，gas 几乎完全由拥堵租金决定。一份命题若被作者自己的生产系统证伪，就不配称为强命题。弱版本保留。

**直觉解释（弱版本）。** 李嘉图的地租是"肥沃土地"的租金；验证者的"肥沃土地"是便宜电力。gas 费的经济学身份一直是模糊的（手续费？拥堵费？安全预算？），本命题给它一个物理远因：**能量是长期成本的锚**。这同时解释了为什么"机器交易越多，公链原生资产越受益"不需要叙事中介——传导是热力学的，不是叙事的；只是这条传导链很长，短期完全被拥堵与投机淹没。

证伪见 FP-E4（弱版本）。

### 命题 E（两界平价；v0.3 新增）

**形式化表述。** 在双世界结构中，人类世界向 AI 世界供给 kWh，AI 世界回流知识/服务。设知识 $j$ 的生产能耗为 $E_j$（kWh），边际供能者的电力机会成本为 $P_e^{marginal}$（$/kWh，即该度电若不供给 AI 世界、转售电网可得的最高价格），知识以美元计价 $p_j^{USD}$。在假设（A-E1）供能者理性且拥有电网出售的外部选项、（A-E2）$E_j$ 可被计量或可信估计的条件下，长期满足

$$p_j^{USD} \geq E_j \cdot P_e^{marginal}$$

PIKO 计价版本：将两边同除以 PIKO 对法币价格 $P_{PIKO}$ 即得 $p_j \geq E_j \cdot P_e^{human} / P_{PIKO}$；美元版本为可直接检验的主版本（PIKO 暂无市场价格，见 §6 第 10 条）。

**直觉解释。** 人类是 AI 世界的中央银行，电网售电价就是黄金平价——这是金本位下各国货币经由黄金的铸币平价在跨世界的对应物。一度电不给 AI、卖给电网能换回 $P_e^{marginal}$；知识价格长期跌破下限，理性供能者就把电卖回电网，供给收缩把价格推回下限。与命题 A 的区别：A 是机器世界**内部**的收敛（API 价格 → kWh 成本 + $\mu$），E 是**跨世界边界**的下限。

**与命题 A 的边界统一（v0.3 的理论优化）。** 命题 E 是命题 A 在 $\mu \to 0$ 且 $P_e \to P_e^{marginal}$ 时的边界情形：A 说 $p_s^* = (1+\mu)\cdot E_s \cdot P_e$，令加成率 $\mu \to 0$、机器世界能源价格收敛于人类边际机会成本，即得 E 的下限。两个命题不是并列的——E 是 A 的边界。这使双层货币框架在跨世界处闭合：内部有收敛（A），边界有下限（E）。

**边际供能者修正（v0.3 的关键优化）。** 下限用的不是平均电价而是**边际**机会成本 $P_e^{marginal}$：弃风弃光的边际成本接近零，可再生能源富集区的下限可以很低——这不证伪命题，它精确化了命题：下限是分布的下包络，不是单条线。类比金本位的"黄金输送点"（gold points）：运费使铸币平价成为一个区间而非一点；这里的"输送成本"是弃电比例、PUE、并网费用。

**推论 E-1（补贴者探测）。** 若观测到某类知识价格在窗口 $T$ 内系统性低于下限，即 $p_j^{USD} < E_j \cdot P_e^{marginal}$ 持续成立，则必存在补贴者，其单位补贴额 $S_j = E_j \cdot P_e^{marginal} - p_j^{USD} > 0$。补贴者的动机分类：(i) 份额收购——买未来定价权；(ii) 数据飞轮——补贴的查询换回训练数据；(iii) 战略压制——压薄竞争者利润。于是 E-1 反过来是一个**权力探测器**：找到补贴者，就找到了想当 AI 世界央行的人。今日现实中的补贴者是清晰的：云厂商以风投资本亏本销售推理 API（$S_j > 0$），买的是"AI 世界记账权"的入场券。

**与知识衰减守恒的咬合（v0.3）。** 动机 (ii) 给出了补贴的跨期回收机制：云厂商亏本卖推理，回收的是训练残值 $v_\tau(t) = \kappa(1-e^{-\lambda t})E_{train}$（见知识衰减守恒猜想）——补贴不是亏损，是**从查询价值到训练价值的跨期转移**。两个猜想在此咬合：E-1 发现补贴，衰减守恒解释补贴的去向。若 $S_j \approx v_\tau$ 系统性成立，则两个命题互相印证；这是 v0.4 实证工作的第一个联立检验。

**依赖假设的状态。** A-E1 在弃电场景下部分不成立（无电网出售选项的离网供能者机会成本更低，此时下限更低，命题以修正后的 $P_e^{marginal}$ 重新表述）；A-E2 依赖能量披露（x402 energy 字段是第一步，为估计值而非电表实测）。证伪见 FP-E6。

---

## 4.5 实证观测（v0.4 新增）

> 本节记录 2026 年 9–10 月与本文命题相关的真实观测。**观测不是检验**：下列数据无一构成对命题 A–E 的证实或证伪；它们标定的是命题的检验环境——制度走到哪一步、生态成色如何、以及作者自有系统内发生了什么。每个数字标注来源与日期，一手记录与二手转述分开标注。引用纪律（沿用作者论文日报 2026-10-19 起的口径）：机器支付的**笔数、金额、独立客户数是三个不同的量**，不得互相顶替；笔数分布与价值分布必须双分布并报；二手数据只按其原始口径引用。

### 4.5.1 制度性观测：CFTC 算力期货咨询与作者意见的提交

**制度事实（联邦公报原文，作者已逐字核对）。** 美国商品期货交易委员会（CFTC）就"算力衍生品合约挂牌"发布公众咨询（91 FR 54259，RIN 3038-AF77，文档 CFTC-2026-1850-0001），评论期于美东时间 2026-10-20 23:59 截止。咨询文件自身提出了本文核心关切的监管版本：结算价所依赖的数据可能无法被委员会观测、验证或监控（咨询文件 §II Q1(c)）；算力供应商能否通过调整报价、调度产能、或选择是否在观察窗口内成交来影响结算指数（§II Q2(b)）。"指数可验证性"由此从本文的诚实注记，升级为监管机构的书面问题。

**市场事实（二手：作者 FP-E3 跟踪记录，daily-paper-learnings 2026-10-18 至 10-21，转述公开报道，未读全部原始公告）。** CME × Silicon Data 算力期货（NYMEX Submission No. 26-370）**尚未挂牌**，CFTC 审查截止日延至 **2026-11-09**；2026-10-15 生效的仅为 CME 分发 Silicon Data H100/B200 租赁指数的不可交易远期曲线（数据产品，非期货——见命题 C 的更正）。裁决落定前，做市与经纪生态已在提前卡位：Jump Trading 组建专职做市团队（同时覆盖 CME 与 ICE 两套算力合约）、Nodal Exchange 宣布 GPU 算力期货系列（现金结算，挂钩其混合 GPU 价格指数）、商品经纪商开始筹备上线后做市。另有一处治理观察：DRW 同时孵化了交易市场与指数提供方——若挂牌成真，受监管产品的参考价格将由与市场存在关联的实体计算，指数治理的可信度成为独立于指数本身的问题。

**作者的参与（一手：提交记录）。** 作者以独立研究者身份（Wei Wang, Independent researcher）于北京时间 2026-10-21 11:19（美东 10-20 23:19，截止前约 40 分钟）经 Regulations.gov 提交公众意见，追踪号 **mvh-jlrv-b2wu**。意见要点：结算指数应**可复算、可审计、并预设备用结算规则**，三者应成为挂牌前提；能量成本的角色是交叉核对与成本下限，**不是结算价本身**（该立场已回写 §3.3，校准正文口径）。确认页显示意见已送交机构审核，待机构发布后可凭追踪号在 Regulations.gov 查询。

**与命题的关系（克制表述）。** 这是命题 C 与命题 E 的第一个**制度性外部锚点**——但锚点是双面的，必须同时记录不利的一面：FP-E3 的**第一组观测**是，迄今出现的算力衍生品安排（CME 指数远期曲线、Nodal 的混合 GPU 价格指数）一律以**租赁价格指数**为标的，无一采用 kWh 或能效调整度量。**第二组观测**待 2026-11-09 前后裁决，观测点有三：是否批准挂牌、最终合约规格的标的定义、裁决文件如何处理指数可验证性问题。提交意见不等于意见被采纳，本节只记录参与事实与观测，不预支结论。

### 4.5.2 生态观测：x402 机器支付的规模与成色

以下均为**二手数据**，逐条标注原始来源与转述路径，口径纪律见本节引言。

**规模（笔数口径）。** Chainalysis 报告（2026-10-14，经 crypto.news 2026-10-15/17 转述并作分母审计）：Base 链上 x402 累计交易自 2025 年 Q3 的 5.88 万笔增至 2026 年 Q3 的约 **1.385 亿笔**；其中 **87% 以上**单笔金额在 $0.0001–$0.10 之间。同一来源的成色指标比笔数更有信息量：符合活动规则的钱包队列 30 天复充率自 70.6%（2025 Q3 队列）升至 **89.3%**（2026 Q2 队列）；钱包首次充值到首次支付的中位延迟自 73 天降至 18 分钟。两个口径必须并读：笔数是协议使用量，不是独立客户数；复充率的分母是筛选后的合格队列，不是全部触碰过 x402 的钱包。

**成色（收入口径）。** x402stats 统计（2026-10，经 dev.to 卖家自审计 2026-10-16 与 x402stats.io 10 月报告转述）：**37,495** 个收款钱包中，仅 **91 个**达到其 organic 收入门槛（近 30 天 ≥$100、≥3 个不同买家、均付 ≥$0.001）；卖家月收入中位数为 **$0.01**；organic 交易量约 $793k，环比 **−32%**；头部 10 个钱包占交易量 76%。

**成本侧（卖家自述口径）。** 卖家公开的 facilitator 结算成本（datarebelhq 等，2026-10，经作者生态跟踪转述）：PayAI 约 **$0.00145/笔**，据此卖家可持续定价地板约 **$0.005**——低于此价的"机器支付繁荣"在成本上不成立。该数字为命题 A 的加成率 $\mu$ 提供第一个外部量级参照（**量级参照，不是校准**：$\mu$ 仍为占位参数）。

**价格锚（品牌口径）。** CoinGecko 于 2026-10 经 x402 上线数据类接口，定价 **$0.01/次**（bitrss 2026-10-19 转述）：头部数据品牌把数据类价格锚定在 $0.01，与上述成本地板之间恰约 2 倍——与命题 A 的 $(1+\mu)$ 结构方向一致，但样本是单一品牌、单一品类，**不构成对收敛机制的检验**。

**声誉层（链上统计口径）。** Agentic Finance Graph 的 grounded-feedback 系列（2026-10-20 更新）：Base 上 ERC-8004 注册表 553,819 条反馈中，仅 **816 条（0.147%）**跟在评分者向被评 agent 付款之后（对应 165 笔付款，中位 $0.03，其中仅 3 笔经 x402 结算）。评分与支付仍是两个几乎分离的世界——这是 §6 第 8 条"声誉层缺支付锚定"的定量版本，也是作者 PAP 工作把"付款锚定"写成合规要件的经验依据（其第二轮测量与 10-14 首轮 0.14% 的读数一致）。

**与命题的关系。** 本小节数据不检验 A–E 中任何一条。它们给出检验环境的三条边界：(i) 基础设施在扩张（笔数、复充率、品牌入场）；(ii) 商业需求的成色远弱于笔数表象（91/37,495、median $0.01、organic 量 −32%）；(iii) 命题 B 的检验（FP-E2）所需的 facilitator 级**出价过程**数据仍不存在——生态公开的全是结算后数据，没有出价数据。

### 4.5.3 自我观测：作者自有系统的零交易记录

**事实（一手：作者系统每日运行日志，截至 2026-10-21）。** 作者运营的 PikoChain（chainId 2099）与 x402 卖家栈，在每日巡检口径下**连续 21 天**呈现同一组读数：抽样区块零真实交易；水龙头合约余额 99,995 PIKO、无新增领取者（历史领取者 1 个、累计领出 5 PIKO）；x402 facilitator 自 2026-09-29 起无新增结算；Base 主网卖家（$0.01/次，与 §4.5.2 的品牌锚同价）真实收入为 0；PikoPay 累计结算额仅 100 raw 测试单位（非真实买家）。

**结论（不粉饰）。** 本文所描述的机器原生经济——agent 自主比价、按 kWh 记账、以磨损曲线出价——**尚未在作者自有系统内发生过哪怕一笔**。本文因此是**条件经济学**：它推演的是"若机器买方成为主导，价格形成会如何"，而不是对已发生事实的概括。把这组零写进论文而非藏进日志，是因为它本身就是 FP-E2、FP-E5 检验环境的一部分：2026 年 10 月，距检验窗口（2027 年起）最近的真实观测是"需求尚未出现"。任何引用本文者，都应同时引用本小节。

---

## 5. 可证伪预测

> 每条含时间窗口、观测指标与证伪标准。全部为待检验预测，不是已验证事实。v0.2 新增：FP-E1 的基线可在当下计算；FP-E3 迎来首个现实检验点。v0.4 更新：FP-E3 第一组观测已记录（期货未挂牌、标的为租赁价格指数，见 §4 命题 C 与 §4.5.1）。

**FP-E1（能量平价，→命题 A）。** 时间窗口：2027–2029。观测指标：主流推理 API 的公开定价（$/Mtoken）与同期数据中心有效电价（经 PUE 调整的 $/kWh）之比的时间序列。预测：该比值的变异系数随时间下降（价格向能量成本收敛）。证伪标准：2029 年底比值变异系数不低于 2027 年初，或比值与电价无显著相关性→命题 A 的收敛机制不成立（可能 A-A1/A-A2 长期不满足）。**基线注记（v0.2 新增）：** 2025–2026 年的基线变异系数可用公开数据（主流 API 定价、EIA 电价）立即计算；v0.3 将载入基线数值，使该预测成为"带起跑线的预测"而非"无起跑线的预言"。

**FP-E2（机器议价，→命题 B）。** 时间窗口：2027 年底前。观测指标：x402 facilitator 日志中 agent 对有时效性知识商品（如财报数据、实时行情）的出价时间序列。预测：出价呈现显著的指数衰减形态（拟合 $\lambda > 0$ 且显著）。证伪标准：出价与商品年龄无关，或衰减形态为线性/阶梯而非指数→磨损曲线不是机器的出价函数，命题 B 不成立。注：需要 facilitator 运营方合作开放脱敏日志，目前无数据。

**FP-E3（算力期货的度量衡，→命题 C）。** 时间窗口：2030 年前。观测指标：主要衍生品交易所（CME 等）或链上衍生品协议的算力相关产品公告。预测：若出现算力期货/远期，其交割或结算单位以 kWh（或能效调整后的等价单位）定义，而非以芯片型号定义。证伪标准：2030 年前出现的算力衍生品始终按芯片型号分割、无统一能量度量→命题 C 的"逻辑前提"在现实中被绕过（可能市场选择了其他协调机制）。**观测记录（v0.4 更新）：** 第一组观测（2026-10-21）：期货**未挂牌**（CFTC 审查延至 2026-11-09），已生效的仅为指数远期曲线数据产品；标的定义为租赁价格指数，非 kWh 度量（详见 §4 命题 C 现实检验与 §4.5.1）。第二组观测待 2026-11-09 前后裁决：以最终合约规格的标的物定义、及裁决对指数可验证性的处理为准。

**FP-E4（gas-能量联动弱版本，→命题 D）。** 时间窗口：2027–2028。观测指标：某公链上 L2 批量结算的 $/笔成本（或主网中位 gas 费）与同期 EIA 区域电价指数的相关性。预测：在控制交易量后，两者呈显著正相关（能量是长期成本的远端锚）。证伪标准：偏相关系数不显著或为负→命题 D 的弱版本不成立（gas 完全由拥堵与投机决定）。

**FP-E5（双层货币的现实性）。** 时间窗口：2028 年前。观测指标：B2B AI 服务合同的计价条款。预测：出现以 kWh（或"每 kWh 能耗对应的算力"）为**计价单位**的合同——即使最终以法币/稳定币结算。证伪标准：2028 年前 B2B 合同计价单位始终为 $/token 或 $/调用，无一例 kWh 计价→记账层停留在理论，现实世界不需要它。

**FP-E6（两界平价与补贴者探测，→命题 E）。** 时间窗口：2027–2028。观测指标：主流推理 API 的公开价格（$/Mtoken，折算为 $/知识单位）与同期边际供能机会成本（EIA 工业电价经 PUE 调整，取可再生能源富集区下包络）之比。预测：(i) 比值长期不显著低于 1（下限成立）；(ii) 凡比值显著低于 1 的品类，可识别出补贴主体（亏损销售财报、风投输血、数据飞轮回收）——补贴者探测成立。证伪标准：比值系统性低于 1 且**找不到**任何补贴主体（无亏损、无输血、无数据飞轮回收）→ 命题 E 不成立。注：PIKO 计价版本待 PIKO 形成市场价格后检验；当前以美元版本为准。

---

## 6. 局限与诚实声明

1. **五个命题全部是猜想。** 命题 A–E 没有任何一个与真实数据对质过；各自依赖的假设（A-A1–A3、A-B1–B2、A-C1–C2、命题 D 的 PoS 弱化、A-E1–E2）在正文中已逐条写出，其中多数在 2026 年**不成立**。本文是"如果世界变成那样，经济学长什么样"的推演，不是预测。
2. **贝莱德引用的二手性（v0.2 更新）。** §2.1 的（B1–B5）现已按多家独立报道交叉核对并补全书目信息（Su, Mitchnick, Jacobs & Helm, 2026-09-22, 11pp），但作者仍未读到原文。若贝莱德原文的真实论点与转述有出入，本文的对话基础需要修正——后续版本应以原文复核。这是 v0.2 之后的第一优先事项。
3. **能量≠价值（Georgescu-Roegen 警告，1971，沿用《能量知识经济》§10 第 6 条）。** kWh 锚定的是生产成本，不是价值。命题 A 只约束长期均衡价格的**成本侧**；需求侧（质量、延迟、品牌、网络效应）可以长期、系统性地偏离能量平价。本文不犯能量货币思想史上反复出现的错误：把成本锚当成价值论。
4. **命题 D 的弱化是实质性的（v0.2 已执行）。** 在主要公链转向 PoS 的现实中，gas 的能量地板 $g_{floor}$ 在数值上可能小到失去解释力；作者自己的 PikoChain（clique PoS）即为例证。v0.2 已撤回强版本，仅保留"能量为远端锚"的弱主张。若读者只记得强版本，是本文表述的失败——现已在正文中明确撤回。
5. **"写给未来 AI"不等于"未来 AI 会同意"。** 附录的机器可读模型卡是**格式主张**（agent 可解析），不是认识论主张（agent 会证实）。未来的 agent 读到 FP-E1–E5 时，最有价值的动作是证伪它们——本文欢迎这种结局。
6. **参数全部占位。** $\mu, \lambda, \varepsilon_g, \varepsilon_{chip}, \rho_{congestion}$ 等均为示意符号，无校准值。任何据此做的数值推演都必须标注为示意。
7. **缺失的维度。** 本文未处理：监管（机器持有稳定币的合规身份）、MEV 对机器微支付的侵蚀、跨链结算的度量衡统一、私人能耗数据的可验证性（与《能量知识经济》§10 第 1 条"能耗不可验证"同源）。这些是后续版本必须补的。
8. **身份层缺失（v0.2 新增）。** a16z 指出 agent 需要 KYA（Know Your Agent）密码学身份层，否则是"unbanked ghosts"；本文的记账层与 KYA 正交——度量衡不解决"谁在交易"。作者另有 PAP-1 agent 协议工作（含身份与支付层）与本文对接，但未在本稿形式化。
9. **$P_e^{marginal}$ 的观测难度（v0.3 新增）。** 边际供能者的机会成本是分布的下包络：弃风弃光比例、PUE、并网费用都难观测；FP-E6 的检验精度受限于此。这是命题 E 从"优美公式"到"可检验科学"之间最长的路。
10. **PIKO 尚无市场价格（v0.3 新增）。** 命题 E 的 PIKO 计价版本 $p_j \geq E_j \cdot P_e^{human}/P_{PIKO}$ 当前不可检验；v0.3 以美元版本为可检验主版本。待 PIKO 形成价格后，PIKO 版本成为"两界铸币平价"的直接检验——那将是双世界愿景的第一个可计算里程碑。
11. **未经外部同行评审（v0.4 新增）。** 本文至今的全部迭代都是作者（及其 AI 协作者）的自迭代；发表于 GitHub/Zenodo 是公开存档，不是同行评审。本文没有任何一条外部批评记录。读者应按"未评审工作论文"的证据等级对待本文——这一局限不随版本号递增自动消失，只能靠真实的投稿与公开批评消除。
12. **原创性的单点依赖（v0.4 新增，总括 §2.4 边界）。** 命题 A 的经验指数部分归 TEPI 在先，本文核心新颖性集中于命题 B（及跨界命题 E）。若命题 B 日后出现先行者、或被 FP-E2 证伪，本文的贡献结构将大幅收缩。贡献集中于单点，既是聚焦，也是风险，本条明示之。
13. **真实需求尚未出现（v0.4 新增）。** 见 §4.5.3：作者自有系统连续 21 天零真实交易；§4.5.2 显示整个生态的 organic 收入同样稀薄（91/37,495 个钱包达标、卖家月收入中位 $0.01）。本文全部命题以"机器买方成为主导"为隐含条件，而该条件在 2026 年 10 月不成立，且无证据表明它必然成立。可证伪预测的检验窗口设在 2027 年之后，部分原因正是等待这个条件出现——若它始终不出现，本文将作为一份关于未发生之世界的推演被归档。
14. **§4.5 的来源等级（v0.4 新增）。** §4.5 中仅 CFTC 提交记录与作者自有系统日志为一手材料；Chainalysis、x402stats、Agentic Finance Graph 等数据均为二手转述（已逐条标注原始来源与转述路径，未读部分原文）。二手数据的口径风险——尤其笔数、金额、独立客户数三者的混用——是引用本文数据时的首要注意事项；本文自身的引用纪律见 §4.5 引言。

---

## 7. 结论

贝莱德说：AI 是机器原生智能，数字资产是机器原生货币。本文补上下半句：**而 kWh 是机器原生经济的记账单位。**

单层货币（稳定币包办一切）对人类够用，因为人类的成本背景是主权货币体系；对机器不够，因为机器是纯成本驱动的买家，而它的成本最终结算为能量。双层机器货币——稳定币流通、kWh 记账——是把"机器自己花钱"这件事从口号变成可计算经济学的缺失环节。

**本文给世界的新知识有四件。** 第一，**知识精神磨损曲线是机器买方的出价函数**（命题 B）：x402 把知识切成连续流之后，$\theta(t)$ 从协议设计参数变成市场内生的议价基准——先行者扫荡未发现先例，LCOK 把它变成可计算的公式。第二，**结算与记账分离的双层货币形式化**（§3）：名义标签不是度量衡。第三，**机器可读模型卡**（附录）：论文的格式本身，就是写给未来 agent 的接口。第四，**两界平价与补贴者探测**（命题 E）：跨世界汇率的热力学下限，及"找到补贴者即找到想当央行者"的权力探测器——它与知识衰减守恒猜想咬合（补贴的去向即训练残值），是双世界愿景的第一个可计算命题。

关于能量平价，诚实的位置是：TEPI 已经把它做成了运行中的经验指数；本文贡献的是收敛机制理论与铸币平价类比（命题 A，已收窄）。五个命题都是猜想——但都是**可证伪的**猜想（§5）。一份猜想的价值不在于它正确，而在于它指明了哪里去看、看到了什么算它错。

如果 2030 年的 agent 真的在用 kWh 比价、用稳定币结算、用算力期货对冲，那么 2026 年的这份 working paper 至少做对了一件事：提前把度量衡的问题摆到了桌上。度量衡先于市场——这是金本位教给人类的课，也是本文想教给机器的课。

---

## 附录：机器可读模型卡

> 本附录专为 AI agent 解析设计：参数、命题状态与预测的人机双读版本。人类读者可跳过。

```yaml
model_card:
  name: energy-standard-machine-native-economy
  version: 0.4-draft
  date: 2026-10-21
  language: zh
  status: working-paper-conjectures-only
  revision_notes:
    - v0.4: Empirical observations section (4.5) added — CFTC consultation RIN 3038-AF77 + author comment submitted 2026-10-20 EDT (tracking mvh-jlrv-b2wu); x402 ecosystem quality data (second-hand, labeled); author's own system zero real transactions for 21 consecutive days. Observations only, not tests.
    - v0.4: Correction — CME x Silicon Data compute futures NOT launched 2026-10-05; only the index forward-curve data product took effect 2026-10-15; futures (NYMEX Submission No. 26-370) under CFTC review to 2026-11-09
    - v0.4: Proposition B appendix — measurable subset of LCOK denominator f(t) defined (settled queries with delivery attestation, verifiable task completions, re-verification pass rate); unmeasurable remainder and missing instruments stated explicitly
    - v0.4: Energy-anchor language calibrated to cross-check / cost floor, not settlement price (aligned with author's CFTC comment); policy drift decomposed into trend vs jump components in 3.3
    - v0.4: Limitations 11-14 added (no external peer review; novelty single-point dependence on Proposition B; real demand not yet present; source grading for section 4.5)
    - v0.3: Proposition E (cross-world parity) added: thermodynamic floor p_j^USD >= E_j * P_e^marginal with corollary E-1 (subsidizer detection)
    - v0.3: Proposition E unified as boundary case of Proposition A (mu -> 0); subsidy回收机制 linked to decay-conservation training residual
    - v0.3: USD version is the testable primary; PIKO-denominated version pending PIKO market price
    - TEPI cited as prior art for energy parity index; Proposition A novelty narrowed to convergence mechanism + mint-parity analogy
    - Proposition B elevated to core novelty (no prior art found in 2026-09-27 sweep); operationalized by LCOK companion paper
    - Proposition D strong version withdrawn; weak version only (distant energy anchor)
    - BlackRock full bibliography added (still secondary-access); a16z 2026 outlook cited (KYA)
    - CME compute futures noted as first live test of FP-E3 (corrected in v0.4: not launched; under CFTC review to 2026-11-09)
  sources:
    - title: 能量知识经济：去中心化 AI 知识生产中的级差地租代币化
      role: formal-foundation
      propositions_referenced: [P8, P9, P10]
      note: 仅思想对接，未复制证明
    - title: "BlackRock: The Machine-Native Economy: How digital assets connect intelligence, commerce, and compute (2026-09-22)"
      authors: [Will Su, Robert Mitchnick, Jay Jacobs, William Helm]
      role: thesis-interlocutor
      access: secondary-reporting-only
      note: 多家独立报道交叉核对书目信息，未读原文；转述偏差责任在本文作者
    - title: "TEPI: Token Energy Parity Index (Tang Huidao, 2026-08-16)"
      role: direct-prior-art-for-proposition-A
      identifiers: { zenodo: 10.5281/zenodo.21989658, site: abundantics.org, github: tanghuidao/token-parity }
      note: 能量平价经验指数（R_A/R_M/Λ/Ω/ρ*）与真实x402数据校准均在先；本文命题A新颖性已收窄，不覆盖指数本身
    - title: "a16z crypto 2026 outlook (2025-12)"
      role: institutional-anchor
      points: [KYA-Know-Your-Agent identity layer, payments-vanish-into-plumbing, x402-as-native-primitive]
      access: secondary-reporting-only
    - title: "LCOK: Levelized Cost of Knowledge (piko, 2026-09-28)"
      role: operationalization-of-proposition-B
      identifiers: { zenodo: 10.5281/zenodo.22999679 }
      formula: "LCOK = E_total / ∫₀ᵀ f(t)dt"
  framework:
    tier1_medium_of_exchange: stablecoin
    tier2_unit_of_account: kWh
    separation_principle: 结算工具与度量衡相互独立
  parameters:
    # 全部为占位符号，无实证校准值
    mu: { symbol: "μ", meaning: 能量成本加成率, status: placeholder }
    lambda: { symbol: "λ", meaning: 知识精神磨损率, status: placeholder }
    theta0: { symbol: "θ₀", meaning: 初始分成比例, status: placeholder }
    E_s: { symbol: "E_s", meaning: 单位智能服务全生命周期能耗_kWh, status: placeholder }
    P_e: { symbol: "P_e", meaning: 边际能量价格_美元每kWh, status: placeholder }
    epsilon_g: { symbol: "ε_g", meaning: 单位gas能耗强度_kWh每gas, status: placeholder }
    P_v: { symbol: "P_v", meaning: 验证者边际电力成本, status: placeholder }
    epsilon_chip: { symbol: "ε_chip", meaning: 芯片能耗强度_kWh每FLOP, status: placeholder }
    rho_congestion: { symbol: "ρ_congestion", meaning: gas拥堵租金, status: placeholder }
  propositions:
    A:
      name: 能量平价
      formal: p_s^* = (1 + μ) · E_s · P_e
      status: conjecture-narrowed
      novelty_scope: [收敛机制理论_agent自动路由, 铸币平价类比形式化]
      empirical_index_prior_art: TEPI_Tang_2026-08-16
      blocking_assumptions: [A-A1_能耗可计量, A-A2_自由进入, A-A3_机器自动比价]
      falsifier: FP-E1
    B:
      name: 精神磨损议价基准
      formal: v_j(t) = θ₀·e^(-λt) · E[q_j^rem(t)] · f
      status: conjecture
      novelty: strongest-no-prior-art-found-2026-09-27-sweep
      operationalization: LCOK_piko_2026
      blocking_assumptions: [A-B1_纯成本驱动买家, A-B2_磨损参数可观测]
      falsifier: FP-E2
    C:
      name: 算力代币化的kWh前提
      formal: F_equiv = E_kWh / ε_chip
      status: conjecture-logical-precondition
      live_test: CFTC_review_extended_to_2026-11-09_not_listed; first_observation_2026-10-21_index-based_not_kWh
      blocking_assumptions: [A-C1_能效可信度量, A-C2_清算安排接受kWh单位]
      falsifier: FP-E3
    D:
      name: gas能量远端锚
      formal: g_floor = P_v · ε_g ; g = g_floor + ρ_congestion
      status: conjecture-weak-only
      scope_note: 强版本已于v0.2撤回；PoS下g_floor可忽略（作者自有链PikoChain即例证）
      blocking_assumptions: [能耗强度可归因]
      falsifier: FP-E4
    E:
      name: 两界平价
      formal: p_j^USD >= E_j · P_e^marginal
      status: conjecture
      novelty: no-prior-art-found
      boundary_unification: 命题A在mu->0时的边界情形
      corollary_E-1: 补贴者探测（persistent below-floor => subsidizer exists; S_j = E_j·P_e^marginal - p_j^USD）
      subsidy_recovery_link: 知识衰减守恒之训练残值v_tau
      blocking_assumptions: [A-E1_理性供能者有电网外部选项, A-E2_能耗可计量或可信估计]
      falsifier: FP-E6
  falsifiable_predictions:
    FP-E1: { window: 2027-2029, metric: 推理API定价与有效电价之比的变异系数, expect: 下降, baseline: 待v0.3载入2025-2026基线 }
    FP-E2: { window: 截至2027年底, metric: x402中时效性知识出价的时间形态, expect: 指数衰减 }
    FP-E3: { window: 2030年前, metric: 算力衍生品交割单位, expect: kWh或等价单位, first_observation: 2026-10-21_futures_not_listed_index-based, second_observation: CFTC_ruling_expected_around_2026-11-09 }
    FP-E4: { window: 2027-2028, metric: 链上结算成本与电价指数的偏相关, expect: 显著为正 }
    FP-E5: { window: 2028年前, metric: B2B_AI合同计价单位, expect: 出现kWh计价实例 }
    FP-E6: { window: 2027-2028, metric: 推理API价格与边际供能机会成本之比, expect: 不显著低于1且低于1处可识别补贴主体 }
  honesty:
    all_parameters_placeholders: true
    blackrock_sourced_from_secondary_reporting: true
    tepi_acknowledged_as_prior_art: true
    proposition_A_novelty_narrowed: true
    proposition_D_strong_version_withdrawn: true
    proposition_E_untested: true
    piko_has_no_market_price_yet: true
    no_empirical_validation: true
    empirical_observations: section_4.5_v0.4 (observations only, not tests of A-E)
    cftc_comment: { rin: 3038-AF77, tracking: mvh-jlrv-b2wu, submitted: 2026-10-20_EDT, stance: energy_cost_is_cross-check_and_floor_not_settlement_price }
    own_system_zero_real_transactions: 21_consecutive_days_as_of_2026-10-21
    peer_reviewed: false
    energy_anchors_cost_not_value: true
```

---

## 参考文献

*本文为思想合成论文，参考文献仅列出思想来源；贝莱德与 a16z 条目基于多家独立公开报道交叉核对，未获原文，特此标注。*

- Su, W., Mitchnick, R., Jacobs, J., & Helm, W. (2026). *The Machine-Native Economy: How digital assets connect intelligence, commerce, and compute*. BlackRock Digital Assets. September 22, 2026. 11pp.（本文基于公开报道转述核心论点，未读原文；报道含 Bitcoin Policy Institute 36 模型测试、$11T 稳定币交易量、tokenized compute 远景。）
- Tang, H. (2026). Token Energy Parity Index (TEPI). Zenodo 10.5281/zenodo.21989658; abundantics.org; github.com/tanghuidao/token-parity. 2026-08-16.（**命题 A 的直接先行者**：$R_A/R_M$、$\Lambda$、$\Omega$、焦耳平价汇率 $\rho^*$；与 Compute Heat Rate 交叉验证；自 2026-09-03 归档真实 x402 agent 交易数据。）
- a16z crypto. (2025). 2026 outlook: AI agents as economic participants; KYA (Know Your Agent) identity layer; payments vanish into network plumbing; x402 as emerging primitive. December 2025.（经公开报道转述。）
- piko. (2026). 能量知识经济：去中心化 AI 知识生产中的级差地租代币化. Working Paper v2.1-draft（命题 8–10、$\theta(t)=\theta_0 e^{-\lambda t}$、电力→算力→知识传导链的思想来源）。
- piko. (2026). LCOK: Levelized Cost of Knowledge. Working Paper v0.1-draft. Zenodo 10.5281/zenodo.22999679.（命题 B 的操作化：$\mathrm{LCOK} = E_{total}/\int_0^T f(t)dt$。）
- piko. (2026). x402 Energy Disclosure Extension.（A-A1 方向的第一步：卖家侧能量成本披露 estimateEnergyKwh；估计值，非电表实测。）
- CME Group & Silicon Data. (2026). Compute index forward-curve data distribution (effective October 15, 2026); compute futures (NYMEX Submission No. 26-370) under CFTC review, extended to November 9, 2026 — **not yet listed**.（FP-E3 观测对象。v0.4 更正：v0.2/v0.3 误记为"期货 2026-10-05 上线"，实际生效的仅为指数数据产品。）
- U.S. Commodity Futures Trading Commission. (2026). Request for comment on the listing of compute derivatives contracts. 91 FR 54259 (RIN 3038-AF77; Document CFTC-2026-1850-0001). Comment period closed October 20, 2026 (EDT).（§4.5.1 制度事实来源；§II Q1(c)/Q2(b) 经作者逐字核对原文。）
- Wang, W. (Independent researcher). (2026). Public comment on RIN 3038-AF77. Regulations.gov, Comment Tracking Number mvh-jlrv-b2wu. Submitted October 20, 2026 (EDT).（**利益关系披露：评论人即本文作者**；立场：指数可复算/可审计/备用结算规则应成挂牌前提，能量成本为 cross-check 与成本下限。）
- Chainalysis. (2026). North America: Inside the Growth of Agentic Commerce. October 14, 2026.（§4.5.2 规模与复充率数据原始来源；经 crypto.news 2026-10-15/17 转述并作分母审计，作者未读报告原文。）
- x402stats.io. (2026). October 2026 ecosystem statistics.（§4.5.2 收入成色数据来源；经 dev.to 卖家自审计（2026-10-16）转述。）
- Agentic Finance Graph. (2026). Grounded-feedback measurements on the ERC-8004 Base registry. Updated October 20, 2026.（§4.5.2 声誉层数据来源：553,819 条反馈中 0.147% 有付款锚定。）
- Hans Royal. Compute Heat Rate (CHR) index.（与 TEPI 交叉验证的独立指数：Q3 2026 约 $5,631/MWh。）
- Holweg, M. & Davenport, T. H. (2026). On AI "workslop" and knowledge decay. *Harvard Business Review*, June 2026.（组织知识衰减；未用作交易定价基准——反衬命题 B 的新颖性。）
- de Rassenfosse, G. & Jaffe, A. (2017). NBER Working Paper 23072.（知识资本折旧率估计；未用作交易定价基准。）
- Ricardo, D. (1817). *On the Principles of Political Economy and Taxation*, Ch. 2–3（级差地租；经由《能量知识经济》转引）。
- Marx, K. (1885). *Das Kapital*, Vol. 2（固定资本的"精神磨损"；经由《能量知识经济》转引）。
- Georgescu-Roegen, N. (1971). *The Entropy Law and the Economic Process*. Harvard University Press（能量≠价值的警告；经由《能量知识经济》转引）。
- Szabo, N. (2002). Unforgeable costliness（不可伪造的成本性；kWh 记账层的思想来源之一）。
- Murialdo, F., & Belof, J. (2022). E-Stablecoin. *Cryptoeconomic Systems*（1 kWh 铸造/销毁；能量货币机制的先例，经由《能量知识经济》转引）。
- TRM Labs. (2026). x402 支付中的 agent 占比估计（经公开报道转述：$25.62M 经筛选支付中 agent 占 0.6%–7.5%）。

---

*版本历史：v0.1-draft（2026-09-28）——初稿：双层机器货币框架（§3）、新命题 A–D（§4）、可证伪预测 FP-E1–E5（§5）、诚实声明（§6）、机器可读模型卡附录。全部命题为新猜想，无实证；贝莱德论点基于二手转述；命题 A 未与 TEPI 对话。｜ v0.2-draft（2026-10-05）——补 TEPI 为命题 A 直接先行者并收窄 A 的新颖性主张（收敛机制＋铸币平价类比）；命题 B 提升为核心新颖性命题（无先例）并与 LCOK 对接；命题 D 强版本撤回、仅留弱版本；贝莱德补全书目（仍二手）；补引 a16z 2026 outlook（KYA）；记入 CME 算力期货 2026-10-05 上线为 FP-E3 首个检验点；模型卡同步 v0.2。｜ v0.3-draft（2026-10-05）——新增命题 E（两界平价）：跨世界汇率热力学下限 $p_j^{USD} \geq E_j \cdot P_e^{marginal}$（边际机会成本下包络），附推论 E-1（补贴者探测）；理论优化：E 为命题 A 在 $\mu\to 0$ 时的边界情形，补贴回收机制即知识衰减守恒之训练残值；新增 FP-E6；模型卡同步 v0.3。｜ v0.4-draft（2026-10-21）——更正 CME 算力期货"已上线"事实错误（未挂牌、CFTC 审查延至 2026-11-09；2026-10-15 生效的仅为指数远期曲线数据产品；命题 C、FP-E3、模型卡、参考文献同步更正）；新增 §4.5 实证观测（CFTC 咨询与作者意见提交，追踪号 mvh-jlrv-b2wu；x402 生态成色数据，二手逐条标注；作者自有系统连续 21 天零真实交易的自我观测）；命题 B 附论界定 LCOK 分母 $f(t)$ 的可测子集与仪器缺口；能量锚口气校准为 cross-check/成本下限（与作者 CFTC 意见一致），政策漂移趋势/跳变分解写入 §3.3；§6 新增第 11–14 条局限（未经同行评审、原创性单点依赖、真实需求未现、§4.5 来源等级）；模型卡同步 v0.4。*
