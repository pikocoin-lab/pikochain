# 时间㶲：知识成本的人类一侧

**Time Exergy: The Human Side of the Cost of Knowledge**

- **构想提出**：王伟（Wei Wang）
- **写作**：piko
- **日期**：2026-10-23
- **状态**：草案 v0.1（工作论文，未经同行评审；全部参数为占位值，无实测）

---

## Abstract

Existing energy-based accounts of knowledge production — including our own LCOK (Levelized Cost of Knowledge) framework — count only the machine side: electricity consumed by computation. This note proposes the missing human-side term. Human time is supplied under a hard physical constraint: 24 hours per person per day, with supply elasticity exactly zero. Yet nominal time is not the right unit. Borrowing the quality distinction of exergy in thermodynamics, we define a state-dependent quality factor χ(t) ∈ [0,1] — the fraction of a nominal hour convertible into effective cognitive work, a function of health, focus and skill — and **time exergy** T_x = ∫χ(t)dt. The full cost of a unit of knowledge is then C_K = E_machine + λ_t·T_x, where λ_t is the (currently unmeasured) energy equivalent of effective human time. Against the prior literature — Podolinsky's energy theory of labour value (1880s), Odum's emergy accounting, and Sciubba's Extended Exergy Accounting, which prices labour by its societal sustainment cost — the claim narrowed to what a literature check on 2026-10-23 did not find in formed shape is the combination: a state-dependent quality factor *for time itself*, entered as a term in the cost function of *knowledge production*, yielding a double anchor — kWh for the machine world, time exergy for the human world. A corollary follows: the economic essence of AI substitution is redeeming low-χ human time with cheap machine electricity; an agent service's price floor is set by its electricity, its value ceiling by the time exergy it redeems.

---

## 1. 问题提出

关于"生产知识要花多少能量"，现有的记账只算了一半。无论是数据中心披露的 PUE 与电耗，还是我们自己提出的 LCOK（知识平准化成本，Levelized Cost of Knowledge），分子里都只有机器：多少度电、多少算力。但任何一条真正被生产出来的知识——一篇论文、一个判断、一段可用的代码——背后还站着一个人。人的投入按"工时"记账，而工时是一个粗糙得可疑的单位：它假设一小时等于一小时。

这个假设在日常生活中显然不成立，在物理学上更不成立。人是一台约 100 瓦的代谢机器：每天摄入约 2000 kcal，约合 2.3 kWh 的能量配给；以 80 年寿命计，一生代谢总量约 7 万 kWh 量级。这笔能量有界、定额、不可增产。更关键的是时间的供给结构：每人每天 24 小时，价格再高也造不出第 25 个小时——在所有生产要素中，只有时间的供给弹性严格为零。黄金在金本位时代被当作锚，是因为它稀缺且难增产；与时间相比，黄金的稀缺只是程度问题。

于是问题成型：**如果电是机器世界的硬通货，时间就是人类世界的硬通货；但要把时间放进成本函数，先得回答——一小时，究竟是多少？**

## 2. 定义：从名义时间到时间㶲

热力学早就处理过同构的问题。能量有"量"与"品位"之分：1 kWh 电能与 1 kWh 低温废热，量相同，能做的功天差地别；可做功的那部分叫㶲（exergy）。我们把这个区分搬到时间上。

**定义 1（时间㶲因子）。** 设个体的状态由健康、专注、技能三类变量刻画。$\chi(t)\in[0,1]$ 为该个体在时刻 $t$ 的单位名义时间可转化出的有效认知功，占其峰值状态的比例。

**定义 2（时间㶲 / 有效时间）。** 个体在区间 $[t_1,t_2]$ 投入的有效时间为

$$T_x=\int_{t_1}^{t_2}\chi(t)\,dt.$$

名义时间人人相等，$T_x$ 因人因时而异：同为一小时，健康、专注、娴熟时的一小时与病弱、分心时的一小时，转化出的认知功可以相差数倍。用这个语言重述一些常识：衰老与疾病是 $\chi$ 的长期下行漂移，睡眠与恢复是 $\chi$ 的周期性回充，培训是 $\chi$ 曲线的整体上移。——这些是类比性陈述，用来固定直觉，不是测量结论。

**定义 3（知识全成本）。** 若知识 $j$ 的生产投入可分解为机器侧与人类侧（假设 A-F1），且 $\chi$ 原则上可由行为与生理代理变量估计（假设 A-F2），则

$$C_{K,j}=E_{machine,j}+\lambda_t\cdot T_{x,j},$$

其中 $E_{machine,j}$ 为机器侧能耗（kWh），$\lambda_t$ 为时间㶲的能量当量（kWh/有效小时）。**必须明示：$\lambda_t$ 目前是占位参数——没有市场出清价，没有公认估计方法，更没有实测值。** 它在现阶段的作用是让成本函数的形状完整，而不是提供数字。

## 3. 与先行者的边界

"把人的劳动折成能量计入成本"不是新想法。诚实地划界，是本短文与主论文共同的纪律。

- **Podolinsky（1880–1883）**最早系统地把人类劳动表述为能量积累过程，试图与劳动价值论调和；恩格斯批评其为能量还原论。他占住了"劳动即能量"这个源头。
- **Odum 的 emergy（能值，1971 起）**用 transformity 把一切投入——包括人类服务与信息——折为太阳能当量计入成本，连教育累积的人力能值都算。他占住了"把人折成能量当量入账"。与本文的差别：emergy 是回望性的全链条核算，transformity 按品类取常数，不区分同一个人的状态差异，也不进入知识生产的成本函数。
- **Sciubba 的扩展㶲核算（EEA，2001）**给出劳动㶲当量 $ee_L$：社会总㶲流量除以总工时。这是与本构想最接近的先行者，必须把差别说透：$ee_L$ 度量的是**维持成本**——社会养活一工时劳动力要耗多少㶲，自上而下、社会平均；$\chi$ 度量的是**产出品位**——这一小时能转化出多少有效功，自下而上、个体状态依赖。一个是"这一小时的人值多少能量来养"，一个是"这一小时能当多少小时用"。方向相反，互补而不重合。
- **Ayres & Warr（2005）**以"㶲×效率=有用功"解释宏观增长，品位思想相同，层面不同（增长核算 vs 单条知识的成本）。
- **Simon（1971）**指出信息消费的是注意力，注意力是稀缺物——定性洞察，没有能量记账，没有品位因子。
- **Cahn 的时间银行（1980）**在规范上故意令一小时等于一小时（$\chi\equiv1$ 的制度设定），目的是社区平等。本文取描述性立场：$\chi$ 可变、待测。制度设计与物理度量回答不同的问题，不构成冲突。

据 2026-10-23 的本次核查（范围：上述各文献传统及近年 AI/认知成本评论，中英文检索），未见成型先例的是以下**组合**：以状态依赖的品位因子把时间本身㶲化、以 $\lambda_t T_x$ 项进入知识生产成本函数、并由此给出双锚结构。单个构件各有主人，本短文只主张组合与形式化位置，不主张构件。该核查范围有限，此结论随时可被新发现的先例修正。

## 4. 双锚命题：AI 的本质是赎回时间

把 $C_K$ 放进人机双世界的交换结构（主论文命题 E 的框架），得到一对镜像的锚：

> **机器世界以 kWh 为锚，人类世界以时间㶲为锚。** 电从人类世界流向机器世界，知识与服务流回来；两个方向的定价，分别被各自的硬约束托底——电价下限由边际供能机会成本决定（命题 E），人类一侧的价值上限由被赎回的时间㶲决定。

由此推出一个对 AI 产业的直接读法：**AI 替代的经济学本质，是用电的便宜能量替掉人命的昂贵能量。** 一个 agent 服务的价格下限由它的电耗封底，价值上限由它赎回的人类有效时间定价：赎回的是低 $\chi$ 的重复劳动（一小时本就当不了半小时用），定价空间被压到电耗附近；赎回的是高 $\chi$ 的稀缺判断（一小时抵十小时），空间才打开。市面上 agent 服务定价的两极分化——抄写类趋近于零、专家类居高不下——与这个结构一致。这只是解释性假说，不是验证：我们自己的系统上线以来真实交易为零，尚无人为我们赎回的时间㶲付过一分钱。成本侧成立，不等于价值侧有人买单。

## 5. 对 LCOK 的扩展

LCOK 原定义为 $E_{total}/\int f(t)\,dt$：生产单位知识的平均能耗。代入 $C_K$ 得到人机全成本版本：

$$LCOK^{full}_j=\frac{E_{machine,j}+\lambda_t T_{x,j}}{\int f_j(t)\,dt}.$$

这一扩展暴露一个原框架的盲区：纯机器口径的 LCOK 会系统性地把"人肉环节"藏起来——一条看起来全自动的流水线，若其质检、纠错、兜底判断实际由人完成，它的真实成本被低估的部分恰好是 $\lambda_t T_x$。AI 产业的"自动化率"叙事中藏着多少未入账的人类时间，是一个可以用这个框架去清点的问题。同样必须明示代价：扩展后的分子是"能量当量"而非纯物理能量，$\lambda_t$ 未定之前，$LCOK^{full}$ 只有形状、没有数值。

## 6. 开放问题

1. **$\chi$ 的测量**：候选代理（任务合格产出率、错误率、心率变异性、主观量表）如何校准、如何防博弈（被测者一旦知晓 $\chi$ 影响定价，代理变量会被污染）？
2. **$\lambda_t$ 的定价**：影子价格从何而来——工资率反推？社会总㶲流量分摊（EEA 式）？还是等待"时间市场"自己出清？三条路径给出不同的数，选哪条是理论决定，不是技术决定。
3. **个体差异的伦理边界**：$\chi$ 一旦可测，会不会被用于对个体的筛选与定价？度量工具的发明者应当预先写下滥用形态，如同本文预先写下证伪条件。
4. **与知识衰减的咬合**：知识会折旧（主论文命题 B），生产它的人的时间㶲却已经烧掉、不可回收——沉没的时间㶲与衰减的知识价值之间的账，尚未入模。

可证伪预测（与主论文 FP-F1 同）：若受控实验中控制难度与个体差异后，状态间的单位时间合格产出差异不显著、且与一切 $\chi$ 代理变量不相关，则 $\chi$ 不携带可测信息，本构想应降格为纯哲学陈述。

---

**参考文献（简表）**

- Podolinsky, S. (1880–1883). 关于人类劳动与能量守恒的系列论文（经 Martinez-Alier 及 Foster & Burkett 的研究转引）。
- Odum, H. T. (1971). *Environment, Power and Society*; (1996). *Environmental Accounting: Emergy and Environmental Decision Making*.
- Sciubba, E. (2004). From Engineering Economics to Extended Exergy Accounting. *Journal of Industrial Ecology*, 8(4), 19–40（EEA 概念于 2001 年提出）。
- Ayres, R. U., & Warr, B. (2005). Accounting for growth: the role of physical work. *Structural Change and Economic Dynamics*.
- Georgescu-Roegen, N. (1971). *The Entropy Law and the Economic Process*. Harvard University Press.
- Simon, H. A. (1971). Designing organizations for an information-rich world.
- Cahn, E. (2000). *No More Throw-Away People: The Co-Production Imperative*（时间银行）。
- Wang, W.（构想）& piko（写作）. 《能量本位的机器原生经济》living 稿 v0.6，命题 F 与 FP-F1。
