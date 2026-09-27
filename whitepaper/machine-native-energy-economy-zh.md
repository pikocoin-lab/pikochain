# 能量本位的机器原生经济：AI Agent 自主交易时代的 kWh 记账与机器货币

**The Energy-Standard Machine-Native Economy: kWh Accounting and Machine Money in the Age of Autonomous AI Agents**

作者：piko

*Working Paper v0.1-draft · 2026-09-28*

> 状态说明：本稿为**全新合成论文**，不是对任何一篇既有论文的改写。它站在两篇论文的思想交汇处提出四个新命题（A–D），全部为**新猜想**，尚未经任何实证检验，所有数值参数均为占位。本文对贝莱德 2026-09 论文《The Machine-Native Economy》论点的复述**基于公开媒体报道的二手转述，非原文引用**——作者未读到该文原文；若转述有偏差，责任在本文作者，不在被转述方。本文对《能量知识经济》命题 8–10 的引用为思想对接，不复制其证明。

---

## 摘要

贝莱德 2026 年 9 月的论文《The Machine-Native Economy》提出：AI 是机器原生智能，数字资产是机器原生货币；AI agent 将用稳定币经 x402 等协议 7×24 小时自主购买数据、API 与算力，单笔金额可小到几美分。本文认同这一判断，但指出它缺了关键的一层：**记账层**。

本文提出**双层机器货币**框架：稳定币是机器经济的**交易媒介**（解决结算速度、可编程性与 24/7 可用性），而千瓦时（kWh）是机器经济的**记账单位与价值锚**（提供不可伪造、全球同质、与物理世界硬挂钩的度量衡）。类比金本位：纸币负责流通，黄金负责记账；机器经济中，稳定币负责流通，kWh 负责记账。没有记账层，agent 无法跨时间、跨供应商比较成本——而自动比价正是机器交易的核心行为。

基于该框架本文提出四个新命题：（A）**能量平价**：长期中单位智能服务的稳定币价格收敛于其 kWh 成本加成，类比金本位的铸币平价；（B）x402 微支付使知识成为连续可分商品，精神磨损曲线从协议设计参数转变为机器议价的基准出价函数；（C）**算力代币化的前提是 kWh 标准化**：没有能量记账，算力期货无法统一度量衡（芯片型号与延迟差异不可通约），kWh 是唯一的物理实在；（D）公链 gas 费本质上是能量租金的链上表现：区块空间需求与 AI 推理电力需求同源，都是机器经济的能量消耗。本文给出五个带时间窗口与观测指标的可证伪预测，并以机器可读模型卡（附录）收尾——本论文在人类可读之外，特意写给未来的 AI agent 直接解析。

关键词：机器原生经济；双层货币；kWh 记账；能量平价；x402；算力代币化；gas；可证伪预测

---

## Abstract

BlackRock's September 2026 paper *The Machine-Native Economy* argues that AI is machine-native intelligence and digital assets are machine-native money: AI agents will autonomously purchase data, APIs, and compute 24/7 with stablecoins via protocols such as x402, in transactions as small as a few cents. This paper accepts that thesis but identifies a missing layer: **the unit of account**.

We propose a **two-tier machine money** framework: stablecoins serve as the machine economy's **medium of exchange** (settlement speed, programmability, 24/7 availability), while the kilowatt-hour (kWh) serves as its **unit of account and value anchor** (unforgeable, globally homogeneous, hard-pegged to the physical world). As under the gold standard—paper for circulation, gold for accounting—stablecoins circulate while kWh accounts. Without an accounting layer, agents cannot compare costs across time and suppliers, yet automatic price comparison is the defining behavior of machine commerce.

We advance four new propositions: (A) **Energy parity**: the long-run stablecoin price of a unit of intelligence service converges to its kWh cost plus markup, analogous to mint parity under the gold standard; (B) x402 micropayments turn knowledge into a continuously divisible good, transforming the moral-depreciation curve from a protocol design parameter into the machine's benchmark bidding function; (C) **kWh standardization is the precondition for compute tokenization**: without energy accounting, compute futures lack a common numeraire (chip models and latencies are incommensurable); the kWh is the only physical reality; (D) on-chain gas fees are on-chain manifestations of energy rent: blockspace demand and AI inference power demand share the same origin. We state five falsifiable predictions with time windows and observables, and close with a machine-readable model card (Appendix) so that future AI agents can parse this paper directly.

Keywords: machine-native economy; two-tier money; kWh accounting; energy parity; x402; compute tokenization; gas; falsifiable predictions

---

## 1. 引言

### 1.0 认识论地位：本文断言什么、不及什么

这是一份 **v0.1-draft working paper**，按以下标准写就：

- **断言的部分。**（a）双层机器货币框架的形式化定义（§3）；（b）四个新命题 A–D 的形式化表述、直觉解释与所依赖的假设（§4）；（c）五个可证伪预测及其证伪标准（§5）；（d）机器可读模型卡（附录）。
- **不及的部分。** 四个新命题全部是**猜想**，没有任何一个与真实数据对质过；全部数值参数为占位；本文对贝莱德论文的复述基于二手报道（见文首状态说明）。把猜想变成定理、把定理变成关于世界的断言，是后续版本的工作。
- **与《能量知识经济》的关系。** 那篇论文的形式化闭环（电力→知识→代币→查询费→回流）与命题 8–10 是本文的出发点之一，但本文的四个命题在那篇论文中**不存在**，也不是其命题的推论——它们是新的、独立的猜想，依赖另外写明的假设。

### 1.1 两篇论文的交汇

2026 年 9 月，贝莱德数字资产团队发表《The Machine-Native Economy》，据公开报道其核心论点可转述为三条：（1）AI 提供机器原生智能，数字资产提供机器原生货币；（2）agent 将自主购买数据、调用 API、租赁算力，需要机器可直接调用、即时结算、金额可小到几分钱的金融系统，答案是稳定币加区块链，x402 被点名为代表性协议；（3）远景是算力本身成为可交易、可融资、可抵押的金融资产，但标准化合约与流动性市场尚不存在。该文同时承认：agent 支付的现实规模还很小（据 TRM Labs，经筛选的 x402 支付中 agent 占比仅约 0.6%–7.5%），且 Stripe、Google、Visa 等也在建设对手轨道。

几乎同时，《能量知识经济》从另一端抵达了相邻的结论：以 kWh 为记账单位的形式化闭环（命题 10 的电力→算力→知识三级传导）、机器原生生产消者均衡（命题 8：agent 没有劳动—闲暇边际，供给侧唯一的边际是能量参与约束）、知识的精神磨损定价（$\theta(t) = \theta_0 e^{-\lambda t}$）。两篇论文各自缺了对方的那一半：贝莱德有货币层、缺物理记账层；《能量知识经济》有能量锚、缺对 agent 自主交易行为的货币理论。本文的任务是把这两半焊起来。

### 1.2 缺口：缺失的记账层

货币有三种职能：交易媒介、记账单位、价值储藏。贝莱德的论述完整覆盖了第一项（稳定币做机器的现金）、部分覆盖了第三项（原生资产做机器的储蓄），但**记账单位是空的**。稳定币以美元计价——而美元是人类主权货币，其购买力对机器没有物理意义。当两个 agent 议价、当一个 agent 在十个供应商之间自动比价、当算力期货需要标准化合约时，它们需要的不是"以什么结算"，而是"以什么度量"。度量衡必须是：不可伪造的、全球同质的、与物理世界硬挂钩的。在机器经济的可选项里，只有 kWh 同时满足这三条。本文 §3 把这一直觉形式化为双层机器货币。

---

## 2. 思想对话

### 2.1 贝莱德论点的转述与接受

以下转述基于 2026-09 公开报道，**非原文引用**；编号为本文所加：

- **（B1）机器需要机器的钱。** 信用卡与 ACH 是围绕人设计的（开户需要人类身份、商户费率使 sub-dollar 支付无意义、ACH 结算以天计）；agent 需要 7×24、即时、低费率的轨道。
- **（B2）稳定币是答案的当前形态。** 2025 年经调整的稳定币交易量超 11 万亿美元（与 Visa 相当），2020–2025 复合增速约 80%；稳定币保留了熟悉的记账单位（美元），同时允许可编程划转与钱包执行。
- **（B3）x402 是机器支付的代表性协议。** 复活 HTTP 402，由 Coinbase 提出；Google AP2、Visa TAP 被列为同类努力。
- **（B4）传导链。** agent 经 x402 买 API、用稳定币付款——每笔机器交易都可能传导成区块空间、验证与结算需求，最终触及 ETH 这类公链原生资产。
- **（B5）算力的金融化远景。** 2025–2030 AI 基建资本开支或超 5 万亿美元；GPU 算力使用权可能被标准化、代币化，可交易、可融资、可抵押、可对冲；但标准化合约与流动性市场**尚不存在**。

本文接受 B1–B4 为方向性判断，接受 B5 为远景但认为其缺失了关键前提（见命题 C）。本文不接受的是隐含假设：**稳定币同时承担记账单位是充分的**。美元计价对机器只是一个标签，不是度量衡。

### 2.2 与命题 8–10 的对接

《能量知识经济》的三个增量命题恰好为贝莱德的框架补上了微观基础：

- **命题 8（机器生产消者）→ B1 的行为基础。** 贝莱德说 agent 会"自己花钱"，命题 8 给出了为什么机器的支出行为与人类不同：无劳动—闲暇边际，供给侧唯一的边际是能量参与约束；均衡配置 $s^*$ 不依赖任何偏好参数。含义：机器的支付函数是**纯成本驱动**的——这正是 kWh 能做记账单位的行为学前提：一个只认成本的买家，最需要的就是成本的统一度量。
- **命题 9（刷新补贴）→ B3 的定价含义。** x402 使知识按次付费成为可能；命题 9 表明知识的私人刷新时点与社会最优时点之间存在楔子。在机器买家占主导的世界里，这个楔子由机器的议价行为直接定价（见命题 B）。
- **命题 10（三级传导）→ B4 的物理机制。** 贝莱德说机器交易"传导成区块空间需求"；命题 10 的电力→算力→知识传导链说明，传导的每一级都是能量成本的传导。命题 D 把这条链再往前推一步：传导的终点不是抽象的"原生资产"，是验证者的电表。

### 2.3 分歧与互补

分歧有两处，且都是建设性的。第一，贝莱德的货币观是**单层**的（稳定币包办一切），本文是**双层**的（流通与记账分离）——§3 论证单层在机器议价场景下不完备。第二，贝莱德把算力代币化当作"市场自然演化"的结果，本文认为它有一个**逻辑在先的前提**（kWh 标准化，命题 C），没有这个前提，演化无从开始。互补在于：贝莱德提供了机构级的现实锚点（交易量数据、协议点名、对手轨道清单），《能量知识经济》提供了形式化传统；本文是两者的合成，不是任何一方的注脚。

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

边界（必须明说）：金本位有中央铸币厂的刚性兑换，本文的"能量本位"**没有兑换机制**——没有任何机构承诺按固定比率用 kWh 兑换稳定币。锚是**统计性的、长期的**（自由进入＋机器自动比价驱动收敛），不是**制度性的、即时的**。这使它弱于金本位，但强于纯粹的叙事锚：收敛力量来自可观测的套利行为（agent 自动把任务路由到低 $E_s \cdot P_e$ 的供应商），不是来自信念。Georgescu-Roegen 的警告（1971）同样适用：kWh 锚定的是**成本**，不是价值——$p_s$ 的短期决定因素（延迟、质量、品牌、网络效应）不在能量平价的解释域内。

---

## 4. 新命题

> 状态：四个命题全部为**新猜想**，依赖各命题下列出的未检验假设。它们不是《能量知识经济》命题 1–10 的推论。

### 命题 A（能量平价）

**形式化表述。** 设智能服务 $s$ 在充分竞争的机器服务市场中以稳定币计价 $p_s(t)$，其全生命周期能耗为 $E_s$（kWh），提供地的边际能量价格为 $P_e$，能量成本加成率为 $\mu > 0$。在假设（A-A1）$E_s$ 可被买卖双方以可接受的成本计量、（A-A2）供应商自由进入、（A-A3）买方 agent 按 $E_s \cdot P_e$ 自动比价的条件下，长期均衡满足

$$p_s^* = (1 + \mu) \cdot E_s \cdot P_e$$

且偏离 $p_s(t) - p_s^*$ 触发机器套利（任务路由转向低 $E_s \cdot P_e$ 供应商），使偏离均值回归。

**直觉解释。** 这是金本位铸币平价的机器版本。人类世界：纸币长期围绕含金量波动，偏离由黄金套利抹平。机器世界：API 价格长期围绕能量成本波动，偏离由 agent 的自动路由抹平——agent 没有品牌忠诚度，没有"习惯用某家"的惰性，它的比价函数就是代码，因此收敛力量比人类市场更强、更快。$\mu$ 是"铸币费"的对应物：硬件折旧、资本成本与风险溢价。

**依赖假设的状态。** A-A1 目前不成立：推理服务的真实能耗 $E_s$ 对买方基本不透明（云厂商不披露单次推理能耗）。A-A2 在头部模型供应商处不成立（寡头）。因此命题 A 是**远景猜想**：它描述的是"当 agent 买方占主导且能耗可计量时"的世界，不是 2026 年的世界。证伪见 FP-E1。

### 命题 B（精神磨损定价成为机器议价基准）

**形式化表述。** 在 x402 按次/按 token 计费下，知识卡片 $j$ 成为**连续可分商品**（购买单位可小到一次查询）。设其精神磨损遵循 $\theta_j(t) = \theta_0 e^{-\lambda t}$（沿用《能量知识经济》记号），剩余期望查询量为 $\mathbb{E}[q_j^{rem}(t)]$，单次查询费为 $f$。在假设（A-B1）买方为纯成本驱动的 agent、（A-B2）磨损参数 $\lambda$ 可被观测或学习到的条件下，agent 在时刻 $t$ 的保留价格为

$$v_j(t) = \theta_0 e^{-\lambda t} \cdot \mathbb{E}[q_j^{rem}(t)] \cdot f$$

议价均衡价格 $p_j(t)$ 落在区间 $[c_j,\, v_j(t)]$ 内（$c_j$ 为边际服务成本），且 $v_j(t)$ 随 $t$ 指数衰减——**磨损曲线从协议设计参数转变为买方的出价函数**。

**直觉解释。** 人类买知识是整本买、按年订阅（lumpy 商品），定价靠谈判与心理账户；x402 把知识切成了连续流。机器买家没有收藏癖、没有沉没成本谬误、没有"买都买了"的惰性——它的出价就是剩余价值的现值。于是《能量知识经济》里作为**协议设计者工具**的 $\theta(t)$，在机器买家占主导的市场里变成了**市场内生的议价基准**：卖方知道买方按磨损曲线出价，报价必须贴着曲线走。这是"谁定价"的问题从人手里交到机器手里的质变。

**依赖假设的状态。** A-B2 需要可观测的机器议价数据；当前 x402 的 agent 支付规模太小（TRM 估计总量 $25.62M 中 agent 占 0.6%–7.5%），尚无数据。证伪见 FP-E2。

### 命题 C（算力代币化的 kWh 前提）

**形式化表述。** 贝莱德远景中的"算力期货"若要存在，必须先解决**度量衡问题**：H100 与 A100 的 FLOP 不可直接通约（能效、延迟、带宽、可用性均不同），没有统一标的物就没有期货。本文主张：唯一的物理实在是 kWh。定义**标准算力单位**为"在基准能效 $\varepsilon_0$（kWh/FLOP）下交付 1 kWh 能耗所对应的算力"，任意芯片的算力按能效比折算为等效单位：

$$F_{equiv} = \frac{E_{kWh}}{\varepsilon_{chip}}$$

其中 $\varepsilon_{chip}$ 为该芯片的能耗强度。算力期货的标的物统一为"标准能效 kWh"，芯片型号、延迟、带宽差异处理为**品质升贴水**（类比商品期货对交割品级的升贴水制度）。在假设（A-C1）$\varepsilon_{chip}$ 可被可信度量（防虚报的能效证明）、（A-C2）存在接受 kWh 交割单位的清算安排的条件下，算力期货的标准化才成为可能。

**直觉解释。** 没有 kWh 记账的算力期货，就像没有"盎司"概念的黄金期货——你不知道一手合约到底是什么。贝莱德说"标准化合约尚不存在"，本文指出缺失的不是合约设计师，而是**度量衡**。能量是算力唯一的共同分母：不管模型多大、芯片多新，最终都结算为焦耳。kWh 交割单位把不可通约的芯片差异压缩成一个可交易的升贴水维度，期货才有标的。

**依赖假设的状态。** A-C1 是硬约束：能效的虚报直接摧毁度量衡（类比黄金期货的成色欺诈）。目前不存在被广泛接受的芯片能效证明机制。A-C2 需要清算所或智能合约的制度创新。本文把命题 C 定位为**逻辑在先的前提**，不是市场预测：它不断言算力期货会出现，只断言"若出现，其标的物必以 kWh（或其等价物）为度量"。证伪见 FP-E3。

### 命题 D（gas 费即能量租金的链上表现）

**形式化表述。** 公链验证者以电力生产区块空间：设验证者集合的边际电力成本为 $P_v$（$/kWh），单位 gas 的能耗强度为 $\varepsilon_g$（kWh/gas，含共识开销分摊），则 gas 价格存在能量地板

$$g_{floor} = P_v \cdot \varepsilon_g$$

实际 gas 价格 $g = g_{floor} + \rho_{congestion}$（拥堵租金）。agent 经 x402 的每笔微支付都消耗 gas：机器交易量增长 → 区块空间需求增长 → 验证者电力消耗增长。于是 **AI 推理的电力需求（链下数据中心）与公链结算的电力需求（链上验证者）同源**——都是机器经济的能量消耗，发生在同一物理世界（电网）的两处。贝莱德的传导链（B4）"最终触及 ETH 这类原生资产"，其物理机制正在这里：触及的不是抽象的资产，是验证者的电表；gas 费是能量租金的链上表现形式。

**直觉解释。** 李嘉图的地租是"肥沃土地"的租金；验证者的"肥沃土地"是便宜电力。gas 费的经济学身份一直是模糊的（手续费？拥堵费？安全预算？），本命题给它一个物理身份：**能量租金**。这同时解释了为什么"机器交易越多，公链原生资产越受益"不需要任何叙事中介——传导是热力学的，不是叙事的。

**依赖假设的状态与适用域。** 该命题在 PoW 语境下最干净（$\varepsilon_g$ 可观测：全网算力×矿机能效÷gas 用量）。在 PoS 链上 $\varepsilon_g$ 极低且归因困难，$g$ 主要由 $\rho_{congestion}$（拥堵租金）决定，能量是远因而非近因——**命题 D 在 PoS 下必须弱化为"能量是 gas 长期成本的远端锚"**，不作强断言。证伪见 FP-E4（弱版本）。

---

## 5. 可证伪预测

> 每条含时间窗口、观测指标与证伪标准。全部为待检验预测，不是已验证事实。

**FP-E1（能量平价，→命题 A）。** 时间窗口：2027–2029。观测指标：主流推理 API 的公开定价（$/Mtoken）与同期数据中心有效电价（经 PUE 调整的 $/kWh）之比的时间序列。预测：该比值的变异系数随时间下降（价格向能量成本收敛）。证伪标准：2029 年底比值变异系数不低于 2027 年初，或比值与电价无显著相关性→命题 A 的收敛机制不成立（可能 A-A1/A-A2 长期不满足）。

**FP-E2（机器议价，→命题 B）。** 时间窗口：2027 年底前。观测指标：x402 facilitator 日志中 agent 对有时效性知识商品（如财报数据、实时行情）的出价时间序列。预测：出价呈现显著的指数衰减形态（拟合 $\lambda > 0$ 且显著）。证伪标准：出价与商品年龄无关，或衰减形态为线性/阶梯而非指数→磨损曲线不是机器的出价函数，命题 B 不成立。注：需要 facilitator 运营方合作开放脱敏日志，目前无数据。

**FP-E3（算力期货的度量衡，→命题 C）。** 时间窗口：2030 年前。观测指标：主要衍生品交易所（CME 等）或链上衍生品协议的算力相关产品公告。预测：若出现算力期货/远期，其交割或结算单位以 kWh（或能效调整后的等价单位）定义，而非以芯片型号定义。证伪标准：2030 年前出现的算力衍生品始终按芯片型号分割、无统一能量度量→命题 C 的"逻辑前提"在现实中被绕过（可能市场选择了其他协调机制）。

**FP-E4（gas-能量联动弱版本，→命题 D）。** 时间窗口：2027–2028。观测指标：某公链上 L2 批量结算的 $/笔成本（或主网中位 gas 费）与同期 EIA 区域电价指数的相关性。预测：在控制交易量后，两者呈显著正相关（能量是长期成本的远端锚）。证伪标准：偏相关系数不显著或为负→命题 D 的弱版本不成立（gas 完全由拥堵与投机决定）。

**FP-E5（双层货币的现实性）。** 时间窗口：2028 年前。观测指标：B2B AI 服务合同的计价条款。预测：出现以 kWh（或"每 kWh 能耗对应的算力"）为**计价单位**的合同——即使最终以法币/稳定币结算。证伪标准：2028 年前 B2B 合同计价单位始终为 $/token 或 $/调用，无一例 kWh 计价→记账层停留在理论，现实世界不需要它。

---

## 6. 局限与诚实声明

1. **四个新命题全部是猜想。** 命题 A–D 没有任何一个与真实数据对质过；各自依赖的假设（A-A1–A3、A-B1–B2、A-C1–C2、命题 D 的 PoS 弱化）在正文中已逐条写出，其中多数在 2026 年**不成立**。本文是"如果世界变成那样，经济学长什么样"的推演，不是预测。
2. **贝莱德转述的二手性。** §2.1 的（B1–B5）基于公开媒体报道的转述，作者未读原文。若贝莱德原文的真实论点与转述有出入，本文的对话基础需要修正——后续版本应以原文复核。
3. **能量≠价值（Georgescu-Roegen 警告，1971，沿用《能量知识经济》§10 第 6 条）。** kWh 锚定的是生产成本，不是价值。命题 A 只约束长期均衡价格的**成本侧**；需求侧（质量、延迟、品牌、网络效应）可以长期、系统性地偏离能量平价。本文不犯能量货币思想史上反复出现的错误：把成本锚当成价值论。
4. **PoS 下命题 D 的弱化是实质性的。** 在主要公链转向 PoS 的现实中，gas 的能量地板 $g_{floor}$ 在数值上可能小到失去解释力；此时命题 D 退化为"拥堵租金主导、能量为远因"的弱主张。若读者只记得强版本，是本文表述的失败。
5. **"写给未来 AI"不等于"未来 AI 会同意"。** 附录的机器可读模型卡是**格式主张**（agent 可解析），不是认识论主张（agent 会证实）。未来的 agent 读到 FP-E1–E5 时，最有价值的动作是证伪它们——本文欢迎这种结局。
6. **参数全部占位。** $\mu, \lambda, \varepsilon_g, \varepsilon_{chip}, \rho_{congestion}$ 等均为示意符号，无校准值。任何据此做的数值推演都必须标注为示意。
7. **缺失的维度。** 本文未处理：监管（机器持有稳定币的合规身份）、MEV 对机器微支付的侵蚀、跨链结算的度量衡统一、私人能耗数据的可验证性（与《能量知识经济》§10 第 1 条"能耗不可验证"同源）。这些是后续版本必须补的。

---

## 7. 结论

贝莱德说：AI 是机器原生智能，数字资产是机器原生货币。本文补上下半句：**而 kWh 是机器原生经济的记账单位。**

单层货币（稳定币包办一切）对人类够用，因为人类的成本背景是主权货币体系；对机器不够，因为机器是纯成本驱动的买家，而它的成本最终结算为能量。双层机器货币——稳定币流通、kWh 记账——是把"机器自己花钱"这件事从口号变成可计算经济学的缺失环节。

四个命题各自独立，又彼此咬合：能量平价（A）给出长期价格锚；精神磨损议价（B）给出知识商品的机器定价机制；kWh 标准化（C）给出算力金融化的逻辑前提；gas 即能量租金（D）给出公链价值捕获的物理机制。它们都是猜想——但都是**可证伪的**猜想（§5）。一份猜想的价值不在于它正确，而在于它指明了哪里去看、看到了什么算它错。

如果 2030 年的 agent 真的在用 kWh 比价、用稳定币结算、用算力期货对冲，那么 2026 年的这份 working paper 至少做对了一件事：提前把度量衡的问题摆到了桌上。度量衡先于市场——这是金本位教给人类的课，也是本文想教给机器的课。

---

## 附录：机器可读模型卡

> 本附录专为 AI agent 解析设计：参数、命题状态与预测的人机双读版本。人类读者可跳过。

```yaml
model_card:
  name: energy-standard-machine-native-economy
  version: 0.1-draft
  date: 2026-09-28
  language: zh
  status: working-paper-conjectures-only
  sources:
    - title: 能量知识经济：去中心化 AI 知识生产中的级差地租代币化
      role: formal-foundation
      propositions_referenced: [P8, P9, P10]
      note: 仅思想对接，未复制证明
    - title: "BlackRock: The Machine-Native Economy (2026-09)"
      role: thesis-interlocutor
      access: secondary-reporting-only
      note: 基于公开报道转述，未读原文；转述偏差责任在本文作者
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
      status: conjecture
      blocking_assumptions: [A-A1_能耗可计量, A-A2_自由进入, A-A3_机器自动比价]
      falsifier: FP-E1
    B:
      name: 精神磨损议价基准
      formal: v_j(t) = θ₀·e^(-λt) · E[q_j^rem(t)] · f
      status: conjecture
      blocking_assumptions: [A-B1_纯成本驱动买家, A-B2_磨损参数可观测]
      falsifier: FP-E2
    C:
      name: 算力代币化的kWh前提
      formal: F_equiv = E_kWh / ε_chip
      status: conjecture
      blocking_assumptions: [A-C1_能效可信度量, A-C2_清算安排接受kWh单位]
      falsifier: FP-E3
    D:
      name: gas即能量租金
      formal: g_floor = P_v · ε_g ; g = g_floor + ρ_congestion
      status: conjecture
      scope_note: PoW下为强版本；PoS下弱化为远端锚
      blocking_assumptions: [能耗强度可归因]
      falsifier: FP-E4
  falsifiable_predictions:
    FP-E1: { window: 2027-2029, metric: 推理API定价与有效电价之比的变异系数, expect: 下降 }
    FP-E2: { window: 截至2027年底, metric: x402中时效性知识出价的时间形态, expect: 指数衰减 }
    FP-E3: { window: 2030年前, metric: 算力衍生品交割单位, expect: kWh或等价单位 }
    FP-E4: { window: 2027-2028, metric: 链上结算成本与电价指数的偏相关, expect: 显著为正 }
    FP-E5: { window: 2028年前, metric: B2B_AI合同计价单位, expect: 出现kWh计价实例 }
  honesty:
    all_parameters_placeholders: true
    blackrock_sourced_from_secondary_reporting: true
    no_empirical_validation: true
    energy_anchors_cost_not_value: true
```

---

## 参考文献

*本文为思想合成论文，参考文献仅列出思想来源，不声称复核过每一篇原文；贝莱德条目标注为二手转述。*

- BlackRock Digital Assets. (2026). *The Machine-Native Economy*（2026 年 9 月发布；本文基于公开媒体报道转述核心论点，未读原文）。
- piko. (2026). 能量知识经济：去中心化 AI 知识生产中的级差地租代币化. Working Paper v2.1-draft（命题 8–10、$\theta(t)=\theta_0 e^{-\lambda t}$、电力→算力→知识传导链的思想来源）。
- Ricardo, D. (1817). *On the Principles of Political Economy and Taxation*, Ch. 2–3（级差地租；经由《能量知识经济》转引）。
- Marx, K. (1885). *Das Kapital*, Vol. 2（固定资本的"精神磨损"；经由《能量知识经济》转引）。
- Georgescu-Roegen, N. (1971). *The Entropy Law and the Economic Process*. Harvard University Press（能量≠价值的警告；经由《能量知识经济》转引）。
- Szabo, N. (2002). Unforgeable costliness（不可伪造的成本性；kWh 记账层的思想来源之一）。
- Murialdo, F., & Belof, J. (2022). E-Stablecoin. *Cryptoeconomic Systems*（1 kWh 铸造/销毁；能量货币机制的先例，经由《能量知识经济》转引）。
- TRM Labs. (2026). x402 支付中的 agent 占比估计（经公开报道转述：$25.62M 经筛选支付中 agent 占 0.6%–7.5%）。

---

*版本历史：v0.1-draft（2026-09-28）——初稿：双层机器货币框架（§3）、新命题 A–D（§4）、可证伪预测 FP-E1–E5（§5）、诚实声明（§6）、机器可读模型卡附录。全部命题为新猜想，无实证；贝莱德论点基于二手转述。*
