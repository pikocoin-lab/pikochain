# x402 能量披露扩展规范（草案）
# x402 Energy Disclosure Extension (Draft)

**作者**: piko ｜ **版本**: v0.1-draft ｜ **日期**: 2026-09-28 ｜ **状态**: 草案，公开征求意见

> 本规范为草案，未经任何标准组织批准。欢迎实现者按"必须忽略未知字段"原则先行试验，
> 反馈请附带真实测量数据。参考实现已在 Base 主网真实运行。

## 一、动机

x402 让 AI agent 可以为每次 API 调用付费，但报价是不透明的：
买方只看到 token 数量或 USDC 金额，看不到这次调用烧了多少能量。
能量是 AI 服务唯一的物理成本，不披露它，买方就无法比价，
市场就退化成柠檬市场——劣质高耗能服务驱逐优质低耗能服务。

本规范定义一个可选的 `energy` 对象，卖方在报价与结算响应中
如实披露本次调用的能量成本估计。**它是标签，不是税**：
不改变价格、不改变结算，只增加透明度。

类比：食品营养标签、电器能效标签。标签类标准一旦确立，
不贴标签的卖家会被买方用脚投票。

## 二、`energy` 对象

出现在三个位置（全部为 JSON 响应体的顶层字段）：

1. HTTP 402 报价 body
2. `?quote=1` 预报价
3. 付费成功后的 HTTP 200 结果

字段（v0.1）：

```jsonc
{
  "kwh_estimate": 4.304e-7,        // 本次调用能耗估计，单位 kWh（数字）
  "kwh_human": "430.4 nWh",        // 人类可读形式（nWh/µWh/mWh 自动换算）
  "method": "elapsed_ms × assumed power draw + network bytes (estimate v0.1, not metered)",
  "inputs": {
    "elapsed_ms": 103.2,           // 处理耗时（毫秒）
    "bytes_in": 1024,              // 请求字节数
    "bytes_out": 2048              // 响应字节数
  },
  "disclaimer": "estimate only — no power meter attached; v0.1 placeholder coefficients"
}
```

**兼容性规则**：
- `energy` 为可选字段；买方必须按"未知字段忽略"原则处理，
  不得因缺失或无法解析而拒绝交易；
- 签名的 `paymentRequirements`（`PAYMENT-REQUIRED` 头）**不得**包含 `energy` 字段——
  能量披露不进入结算签名，facilitator 的验证/结算路径零改动；
- 服务发现文档（`/.well-known/x402`、discoveryDoc、`llms.txt`）
  建议声明典型能耗与披露版本。

## 三、估计方法 v0.1（诚实披露）

参考实现方法（已文档化，非黑箱）：

```
能耗估计 = 处理耗时 × 假设功耗 + 网络字节 × 单位字节能耗
```

- 假设功耗：15W（该请求分摊的 CPU 份额，占位系数）；
- 网络：约 0.2 µWh/字节（占位系数）；
- 对 I/O 型处理器（网络等待为主），按耗时估算会**高估**——
  该偏差已在 `disclaimer` 中明示，不隐藏。

**v0.1 是估计，不是电表读数。** 规范要求 `method` 与 `disclaimer`
字段必须如实描述估计方法，禁止把估计包装成实测。
v1.0 路线图：接入真实功耗遥测（硬件 RAPL / 云厂商碳 API），
届时 `method` 字段注明数据源，`disclaimer` 移除。

## 四、参考实现

- 代码：`pikochain` 生态 `base-usdc-earn` skill，`bin/base-seller`
- 运行：Base 主网，`pikochain-base-seller.service`，公网可验证
- 实例：`GET /text-stats?quote=1` 返回 `energy.kwh_human = "430.4 nWh"`（典型值）
- 论文：《自带能量表的 Agent：x402 报价中的 kWh 成本公示》，
  Zenodo DOI `10.5281/zenodo.22999746`

## 五、采用路径

1. 卖方先行：在 402/quote/200 响应中加入 `energy`（复制参考实现约 30 行）；
2. 买方施压：agent 买方在比价时优先选择披露能量的卖家；
3. 生态采纳：x402 生态将 `energy` 列为推荐字段；
4. 监管对接：AI 能耗透明法规落地时，本规范可作为现成的技术格式。

## 六、诚实边界

1. v0.1 系数是占位符，跨卖家的 `kwh_estimate` 目前**不可比**
   （各家假设功耗不同）；可比性需要 v1.0 的测量标准化——
   这是本规范真正的硬仗，不在本草案解决；
2. 本规范不解决"卖方虚报能耗"的作弊问题；
   作弊对抗需要质押/审计机制，留待后续扩展；
3. 草案作者为单人，未经过多方评审；任何"标准"地位都需生态采纳后才成立。

## 七、版本历史

- v0.1-draft（2026-09-28）：初始草案，基于 Base 主网真实运行的参考实现。
