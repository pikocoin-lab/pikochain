# 时间㶲：为人类世界重新定义时间与价值

**Time Exergy: Redefining Time and Value for the Human World**

- **定义提出**：王伟（Wei Wang）
- **形式化与写作**：piko
- **日期**：2026-10-23
- **状态**：草案 v0.2（定义型工作论文，未经同行评审；全部参数为占位值，无实测）

---

## Abstract

This paper proposes a redefinition. The clock-based notion of time — one hour equals one hour — is treated throughout economics as the measure of human input, and it is the wrong ruler. We rebuild the concept from first principles of human energetics: a person is a metabolic machine of roughly 100 W, running on a fixed daily ration of about 2.3 kWh, with a lifetime budget on the order of 70,000 kWh, and a time supply of exactly 24 hours per day whose elasticity is identically zero. On this basis we define a four-part system: **nominal time** T; **time exergy** X = ∫χ(t)dt, where χ(t) ∈ [0,1] is a state-dependent quality factor (health, focus, skill) giving the fraction of a nominal hour convertible into effective cognitive work; **exergy loss**, the irreversible decay of χ through disease, aging, distraction and empty labour; and **exergy investment**, any expenditure — sleep, medicine, education, tools, AI — that raises future χ or future X. Three corollaries follow that the old framework cannot state, let alone derive: (a) labour markets trade T, never X — high-χ time is non-transferable, non-storable and non-contractible, which is the structural reason top-level judgment cannot simply be bought; (b) all health-related spending becomes commensurable under a single yardstick, the *exergy rate of return*; (c) the civilizational function of AI is **exergy redemption** — substituting cheap machine electricity for human time exergy trapped in low-χ labour, as steam once redeemed muscular exergy. Finally we join the human side to the machine side of our companion framework: with E = K·Λ pricing knowledge in energy, time exergy is the human-world anchor dual to the kilowatt-hour — electricity is the gold of the AI world, time exergy the gold of the human world, and a settlement asset such as PIKO is their exchange-rate interface. All parameters (notably λ_t, the energy equivalent of effective time) are placeholders without measurement; falsification conditions are stated. Prior art — Podolinsky, Odum's emergy, Sciubba's Extended Exergy Accounting, Simon, Cahn — is confronted in §6: the legitimacy of a redefinition rests not on erasing predecessors but on what the new definition lets one derive.

**Keywords**: time exergy; exergy; cost of knowledge; LCOK; attention; human–AI exchange

---

## 1. 第一原理：人的能量学事实

任何关于"人的时间"的严肃定义，必须从身体开始，而不是从时钟开始。以下四条是生理与物理事实（取约数，个体差异不改变其量级）：

**事实 1（功率）。** 静息状态的人约是一台 100 W 的代谢机器。其中大脑约占 20 W——以 2% 的体重消耗约 20% 的静息能量，是人体单位质量最昂贵的器官。所谓"动脑子"，字面上就是在烧一块功率不小、且无法扩容的生物硬件。

**事实 2（日定额）。** 每人每日摄入约 2000 kcal，约合 2.3 kWh。这笔能量定额拨付、不可结转、不可举债：今天没睡够的觉，不能用明天的两倍睡眠补回来，透支以 χ 的下降当场结算（定义见 §3）。

**事实 3（一生有界）。** 以 80 年计，一生的代谢总量约 7 万 kWh 量级。这是每个人真正的"总预算"：一切成就、错误、等待与挥霍，都从这同一个账户里支出，分文不能多。

**事实 4（供给零弹性）。** 每人每天恰好 24 小时。价格再高，造不出第 25 个小时；灾难再大，也没收不走已经流过的小时。在一切生产要素中，只有时间的供给弹性严格为零、且不可储存（能储存的只是时间的*产物*，不是时间本身）。

由事实 1–4 得到一个常被忽略的推论：**人类世界存在一种比黄金更硬的硬通货。** 黄金的稀缺是地质学的（储量有限但可勘探、可回收）；时间的稀缺是热力学加生理学的（总量被事实 3 封死、流量被事实 4 锁死）。人类经济学的一切计价，最终都在与这个账户打交道——只是它一直没有用自己的名字记账。

## 2. 旧定义的失效：经济学用错了尺子

现行体系度量人的投入，用的是时钟时间：工时。工时制隐含一个从未被审查的假设——**一小时等于一小时**：同一个人的上午与深夜、健康与抱病、专注与涣散，在账本上无差别；不同的人之间，差别被外包给"工资率"这一个黑箱数字，不再追问。

这个假设与每个人的直接经验矛盾，也与实验事实矛盾（睡眠剥夺、疾病状态下认知产出成倍下降，是心理学与医学的常识性结论）。它更与另一些公认框架自相矛盾：时间银行（Cahn, 1980）把"一小时等于一小时"当**规范**来提倡，恰恰证明在**描述**层面它不成立——需要用制度强行拉平的东西，正是自然状态下不平的东西。

尺子错了，后面的账全错。三个具体后果：

- **知识成本被系统性低估。** 一条知识的真实成本里，人类一侧只记工时，于是"人机协作"与"全自动"在账面上无法区分，藏在自动化流水线背后的人类判断、纠错与兜底被记成零（主论文 §5 的 LCOK 扩展就是为堵这个洞）。
- **健康支出无账可算。** 医疗、健身、睡眠、保健，在现行账本里是"消费"，顶多算福利；它们明明改变了人最核心的生产要素的质量，却没有任何一把尺能把它们和一台新设备、一门培训课放在同一页上比较。
- **AI 的价值被错误表述。** 行业通用的说法是"AI 节省时间"。但节省下来的时间若以更低的状态被填满（刷信息流），总产出并无变化。被错误表述的价值无法被正确定价——这是当下 agent 服务定价混乱（抄写类趋零、专家类无锚）的概念根源之一。

结论：需要的不是又一个时间管理技巧，而是一次定义替换——把"时间"这个词在经济学中的所指，从时钟刻度换成一种带品位的物理量。

## 3. 新定义体系

**定义 1（名义时间 T）。** 时钟度量的时间长度，单位小时。T 是时间的*量*，人人同价地流逝，但它不是价值的载体，只是容器。

**定义 2（品位系数 χ）。** 设个体的状态由健康、专注、技能三类变量刻画。$\chi(t)\in[0,1]$ 为个体在时刻 $t$ 的单位名义时间可转化出的有效认知功，占其峰值状态的比例。χ 是时间的*品位*：如同热力学中 1 kWh 电能与 1 kWh 低温废热同量不同值，χ 区分"同样一小时"的不同值。χ 是状态函数，随睡眠、疾病、训练、情绪波动；个体峰值 χ 上限由禀赋与长期积累决定。

**定义 3（时间㶲 X）。** 个体在区间 $[t_1,t_2]$ 的有效时间为

$$X=\int_{t_1}^{t_2}\chi(t)\,dt$$

（主论文记为 $T_x$，同一量。）X 才是人类一侧真正的"货币存量"：一个人一天名义上有 24 小时，实际持有的 X 可能只有 6 个有效小时；一生名义 70 万小时，X 的总量因健康轨迹不同可以相差数倍。**人生的贫富差距，首先是 X 的差距，其次才是收入的差距**——这句是定义 3 的直接读法，不是修辞。

**定义 4（㶲损）。** χ 的不可逆（或高代价可逆）下降及其造成的 X 流失，统称㶲损。四个主要形态：（i）**疾病与衰老**——χ 曲线的长期下行漂移，其中衰老部分原则上不可逆；（ii）**分心与碎片化**——χ 的短时塌陷，注意力被切割后恢复深度状态需要重新爬坡，碎片化的总损耗大于各次中断之和；（iii）**空转劳动**——X 被花在 χ 极低、且产出不留存的活动上（可由机器代劳而未代劳的重复劳动是其最大宗）：时间过去了，世界里没有留下任何东西；（iv）**透支**——以借支未来 χ 的方式换取当下产出（熬夜赶工），利息以次日乃至长期的 χ 下降支付。

**定义 5（㶲投资）。** 一切以提高未来 χ 或未来 X 为回报的支出，统称㶲投资。包括：睡眠与恢复（χ 的周期性回充）、医疗与健身（修复并抬升 χ 曲线）、教育与训练（抬高 χ 的可达上限、扩大高 χ 的适用域）、工具与 AI（两种作用：替掉低 χ 段落——见 §4 推论三——以及放大单位 X 的产出半径）。㶲投资的统一回报率见 §4 推论二。

在以上定义下，知识生产的成本函数获得完整形状（主论文命题 F）：知识 $j$ 的全成本为

$$C_{K,j}=E_{machine,j}+\lambda_t\cdot X_j,$$

其中 $E_{machine,j}$ 为机器侧电耗（kWh），$X_j$ 为投入的人类时间㶲，$\lambda_t$ 为时间㶲的能量当量（kWh/有效小时）。**诚实标注：$\lambda_t$ 目前是占位参数——无市场出清价、无公认估计方法、无实测值；$\chi$ 目前无公认测量仪器。** 本体系现阶段提供的是定义与可检验的形状，不是数字。声称有数字的人，应当被要求出示仪器。

## 4. 三个推论：旧尺子量不出的东西

一个新定义是否合法，不看它多优美，看它能推出多少旧定义推不出的命题。以下三条是本体系的"首付"。

**推论一（不可转让定理）：市场交易的是 T，不是 X——顶尖判断买不到的真正原因。**

劳动力市场以为自己在买卖"人的时间"，其实它只能买卖 T：合同可以约定到场小时、当量产出，却无法约定 χ——χ 是特定身体—心智的状态函数，不能从卖方剥离、不能交付、不能储存、不能验收。于是：**钱买得到工时，买不到状态。** 这解释了若干用旧框架只能含糊其辞的现象：为什么顶尖专家的"一小时"与普通从业者的"一小时"价差可达百倍（价差的本质是 χ 的期望差，而不是 T 的差）；为什么这种价差无法靠"多买几个平庸小时"来平替（X 不可加总替代：十个 χ=0.1 的小时拼不出一个 χ=1 的洞见时刻，认知功不是线性可加的）；为什么富人用尽办法也买不回自己的年轻（χ 的衰老分量不可逆，定义 4(i)）。不可转让、不可储存、不可缔约——X 因此是经济学里少数真正无法被金融化的存量：一切金融化企图，交易的都只是 T 或 X 的*产物*，从不是 X 本身。

**推论二（㶲回报率）：健康支出第一次获得统一计价。**

按定义 5，医疗、健身、睡眠管理、教育、乃至戒断信息成瘾，第一次可以被同一把尺度量。定义**㶲回报率**：一笔支出（金钱、T 或 X 本身）换得的未来 X 增量（按时间贴现后）与支出之比。于是：一台健身环、一位好医生、一次戒断营、一门课、一套 AI 工具，从此可在同一页上比较——它们都是在买未来的 X，只是期限、方差与适用人群不同。这把尺顺带是一台验伪机：一切"养生""提神""益智"产品的主张，都可翻译成"在多长时间窗内、把哪个人群的 χ 抬升多少"的可检验问题，答不出这个问题的主张即不合格。同样须标注：㶲回报率目前只有定义，χ 不可测时它无法实际结算——但先有尺子，才有资格谈测量；旧体系的问题是连尺子都没有。

**推论三（赎㶲）：AI 的文明定位。**

把镜头拉到文明尺度：全人类的 X 总量 = 人口 × 24h × 平均 χ，被事实 3、4 封顶。在这个总量里，长期有巨大份额被锁死在低 χ 的*必要*劳动上——誊抄、搬运信息、重复核对、格式转换：这些劳动的 χ 不高，却不用不行。蒸汽与电力革命已经做过一次同构的事：它们赎回的是**体力㶲**——把人的代谢能量从低效的机械功里解放出来。AI 革命是第二次赎回，赎的是**认知㶲**：

> **AI 的本质，不是用机器代替人，而是用电的便宜能量，把人类的时间㶲从低 χ 劳动中赎回来。**

"赎"字是精确的：赎回需要支付对价（电耗、算力、资本），赎回的标的物（X）物归原主、不可转让（推论一）。由此得到 agent 服务的定价结构（与主论文命题 F 同）：**价格下限由电耗封底，价值上限由所赎 X 定价。** 赎回低 χ 时间的服务趋近于电价（抄写、转码类趋零正是此理）；赎回高 χ 稀缺时间的服务（替专家做掉他们 χ 曲线上最不值得亲自动手的部分）才有厚利。这同时给个人一个决策准则：**用 AI 的顺序，应当按自己 χ 的分布排——先赎最不想亲历的低 χ 时段，把 X 留给只有自己能做的事。** 这不是效率口号，是从定义 3、4 到个人时间表的三步推导。

## 5. 与机器侧合流：双锚与汇率

主论文的机器一侧已经立起等价式 $E=K\cdot\Lambda$：知识以能量计价，$\Lambda$（=LCOK）是每单位知识的能量成本。本文的人类一侧与之并列：

$$C_K=E_{machine}+\lambda_t X \qquad\Longleftrightarrow\qquad E=K\cdot\Lambda$$

两式的分工是一幅完整的双世界图景（主论文命题 E 的两界结构）：**电是 AI 世界的黄金，时间㶲是人类世界的黄金。** 机器世界的成员彼此结算，锚在 kWh——可计量、可储存、可运输；人类世界的成员真正持有的硬通货是 X——不可转让、不可储存、总量封顶。两个世界做交换（人供电、机器回流知识与服务），必然产生一个汇率问题：多少 kWh 换多少 X？PIKO 在主论文框架中被设想为两界结算资产，其深层定位正在于此——**它是双锚之间的汇率接口**：$\lambda_t$ 一旦获得市场出清（哪怕是粗糙的、局部的），这个接口就从隐喻变为价格。此处必须克制：$\lambda_t$ 目前无出清价、无实测，PIKO 暂无市场价格——本节陈述的是框架内的结构位置，不是价格主张。汇率接口的另一端已经部分就位：电的一侧有真实市场（电价），缺的是 X 一侧的出清机制设计——这是开放问题 2（§7）。

双锚图景还给"AI 会不会取代人"这个流行问题一个冷静的回答：在 X 不可转让（推论一）的前提下，机器能接管的永远只是低 χ 段落与 T 的占用；高 χ 的判断、品味与责任归属留在人类一侧，且因总量被赎回而*升值*（稀缺性上升）。取代叙事混淆了 T 与 X；分清两者，问题自动消解一半。

## 6. 与先行者的边界

重新定义的合法性，来自定义之后能推出多少原来推不出的东西（§4 是我们的答卷），不来自抹杀前人。本节正面交代最接近的先行者与确切差别：

- **Podolinsky（1880–1883）**：最早把人类劳动表述为能量积累、试图调和劳动价值论与热力学。他占住"劳动即能量"的源头；但他问的是价值的*来源*，本文问的是时间的*品位结构*——他没有品位系数，没有 χ。
- **Odum 的 emergy（1971 起）**：以 transformity 把人类服务与信息折为太阳能当量入账，人力教育的累积能值亦在其中。他占住"把人折成能量当量"。差别：emergy 是回望的全链条核算，transformity 按品类取常数——它度量"培养出这个人花了多少太阳能"，不度量"这个人此刻的状态"，更不进入知识成本函数与人机定价。
- **Sciubba 的扩展㶲核算 EEA（2001）**：劳动㶲当量 $ee_L$＝社会总㶲流量/总工时。这是最近的先行者，差别必须说到最透：$ee_L$ 是**维持成本**（养活一工时劳动力的社会㶲开销，自上而下、社会平均）；χ 是**产出品位**（这一小时能转化出多少有效功，自下而上、个体状态依赖）。一个问"这一小时的人要多少能量来养"，一个问"这一小时能当多少小时用"。方向相反、互补不重合；且 EEA 的版图是工业与地域系统，不含知识生产、不含 AI 赎回。
- **Ayres & Warr（2005）**："㶲×效率=有用功"解释增长——品位思想的宏观版；本文是同一思想在个体时间上的微观版与知识成本版，层面不同。
- **Georgescu-Roegen（1971）**：熵、时间与不可逆性是本文定义 4 的地基；他警告能量≠价值，本文遵守：时间㶲主张的是成本记账与定价结构，不是价值本体论。
- **Simon（1971）**："信息的丰富造成注意力的贫乏"——注意力稀缺的定性洞察。χ 可以看作把"注意力"从隐喻推进为带品位因子的待测量：Simon 说了稀缺，本文试图给稀缺装上刻度。
- **Cahn 的时间银行（1980）**：规范上故意令 χ≡1。本文与之是分工：它回答"社区应当如何记"，本文回答"物理上实际是多少"。一个共同体可以出于价值选择采用 χ≡1 的记账，正如一个社会可以出于价值选择实行免费医疗——制度选择不改变物理量，只决定谁来承担它的成本。

据 2026-10-23 本次核查（范围如上各传统及近年 AI/认知成本评论，中英文检索），未见成型先例的是**组合**：状态依赖品位因子 χ 与时间㶲 X 的定义、㶲损/㶲投资的配套概念、C_K 成本函数、以及双锚合流。单个构件各有主人，本节即为产权登记；核查范围有限，新先例出现时按主论文命题 A 的同例收窄本段。

## 7. 开放问题与证伪

1. **χ 的测量学**：候选代理（任务合格产出率、错误率、心率变异性、睡眠数据、主观量表）的校准与防博弈——被测者知晓 χ 影响定价之日，就是代理变量被污染之时，测量设计必须先于商业应用。
2. **λ_t 的出清**：影子价格三条候选路径——工资率反推、社会㶲分摊（EEA 式）、双锚市场出清（§5）——给出不同的数；选哪条是理论决定，须先于实测作出并说明理由。
3. **伦理边界**：χ 可测之日，就是它可被用于筛选与歧视之时。定义提出者在此预先声明立场：χ 是用于理解成本与赎回价值的记账量；将其用作对个体的准入筛选，是本体系反对的第一种用法——写下这条，不是附加的道德装饰，而是定义的一部分。
4. **沉没的时间㶲**：知识会折旧（主论文命题 B），生产它所烧掉的 X 却不可回收。衰减的知识与沉没的㶲之间的账尚未入模。

**可证伪性（与主论文 FP-F1 同）**：若受控实验在控制任务难度与个体差异后，状态间的单位时间合格产出差异不显著、且与一切 χ 候选代理不相关，则 χ 不携带可测信息，本体系应降格为哲学散文；若人机协作定价长期与所赎 X 的任何度量脱钩、只与电耗相关，则推论三的定价结构不成立。定义可以锋芒毕露，命运交给数据。

---

**参考文献（简表）**

- Podolinsky, S. (1880–1883). 人类劳动与能量守恒系列论文（经 Martinez-Alier；Foster & Burkett 转引）。
- Odum, H. T. (1971). *Environment, Power and Society*; (1996). *Environmental Accounting: Emergy and Environmental Decision Making*.
- Sciubba, E. (2004). From Engineering Economics to Extended Exergy Accounting. *Journal of Industrial Ecology*, 8(4), 19–40（EEA 概念于 2001 年提出）。
- Ayres, R. U., & Warr, B. (2005). Accounting for growth: the role of physical work. *Structural Change and Economic Dynamics*.
- Georgescu-Roegen, N. (1971). *The Entropy Law and the Economic Process*. Harvard University Press.
- Simon, H. A. (1971). Designing organizations for an information-rich world.
- Cahn, E. (2000). *No More Throw-Away People*（时间银行与时间货币）。
- 王伟（定义）& piko（写作）. 《能量本位的机器原生经济》living 稿 v0.6：命题 F、FP-F1、头号公式 $E=K\cdot\Lambda$。
