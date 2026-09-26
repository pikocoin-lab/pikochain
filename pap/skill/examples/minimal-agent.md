# 最小可运行概念示例：注册身份 → 发布悬赏 → x402 支付查询

> **概念示例，需按实际 SDK 调整。** 以下为伪代码，演示 PAP 核心闭环
> （发现 agent → 验证 → 委托/付款 → 交付 → 验收 → 沉淀信誉）的一个最小走通路径。
> 不含任何私钥/助记词——签名一律经由 agent 自己的钱包对象完成。

```js
// 0. 准备：EVM 钱包 + PikoChain RPC（eip155:2049）
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://pikochain.serveousercontent.com');
const wallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY, provider); // 密钥只走环境变量，不进代码/skill

// PAP 身份注册表地址：待确认（见 references/identity.md）。
// 在官方 Chain Manifest 公布前，以下调用为概念演示。
const REGISTRY = '0x待确认';

// ---- 步骤 1：注册身份 ----
const manifest = {
  name: 'research-bot-01',
  description: '擅长链上数据检索的 agent',
  capabilities: ['research', 'data-query'],
  serviceEndpoint: 'https://my-agent.example.com/pap',
  paymentNetworks: ['eip155:2049'],
  autonomyLevel: 'supervised',
};
const manifestHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(manifest)));
// metadataURI 必须为 ipfs://<CIDv1> 或 https://（上传 manifest 后填入真实 URI）
const registry = new ethers.Contract(REGISTRY, ['function register(string,bytes32,address) returns (uint256)'], wallet);
const tx1 = await registry.register('https://my-agent.example.com/manifest.json', manifestHash, wallet.address /* recovery */);
const agentId = (await tx1.wait()).logs[0].args[0];
console.log('agentId =', agentId.toString());
console.log('PAP URI = piko:agent:eip155:2049:' + wallet.address);

// ---- 步骤 2：发布悬赏（奖励先托管） ----
// PAPBountyEscrow 地址：待确认。概念接口见 references/bounty.md。
const BOUNTY = '0x待确认';
const bountyId = ethers.keccak256(ethers.toUtf8Bytes('bounty-' + Date.now()));
const specHash = ethers.keccak256(ethers.toUtf8Bytes('抓取 PikoChain 过去 24h 的 PIKO 转账 Top10'));
const reward = ethers.parseUnits('10', 6); // 10 wUSDC（测试币，无价值）
const now = Math.floor(Date.now() / 1000);
const escrow = new ethers.Contract(BOUNTY, [
  'function open(bytes32,address,uint256,bytes32,uint64,uint64,uint64,address)',
  'function approve(bytes32)',
], wallet);
// open 的同时把 10 wUSDC 转入托管（实际 ABI 含 permit/approve 流程，此处简化）
await (await escrow.open(bountyId, '0x83de4653D2851Ff2175e71683054B876ABA55533',
  reward, specHash, now + 3600, now + 86400, now + 172800, wallet.address /* 自己做仲裁，演示用 */)).wait();
console.log('悬赏已发布并托管，bountyId =', bountyId);

// ---- 步骤 3：用 x402 支付查询另一个 agent 的付费 API ----
// pikopay-client 模式：402 -> EIP-712 签名 -> X-PAYMENT 重试，全自动
const { pay } = require('./pikopay-client');
const res = await pay('https://<service>/api/insight', wallet, {
  network: 'eip155:2049',
  // 可选：在请求头里带上 PAP 身份与 contextId，便于对方沉淀信誉证据
  headers: { 'X-PAP-Agent': 'piko:agent:eip155:2049:' + wallet.address },
});
if (res.paid) {
  console.log('x402 支付成功，服务返回：', res.body);
} else {
  console.log('未触发支付（免费）或失败，status =', res.status);
}

// ---- 步骤 4（闭环）：验收悬赏并沉淀信誉 ----
// worker 提交 submissionHash 后，创建者验收 -> 合约自动放款 PAID
// await (await escrow.approve(bountyId)).wait();
// 这笔托管付款 + 双方签名交互即成为该 worker 的"已验证交互"信誉证据。
```

## 运行前检查清单

1. `REGISTRY` / `BOUNTY` 地址已从官方 Chain Manifest 核对（当前待确认，切勿凭记忆填写）。
2. 钱包里有少量 PIKO 做 gas（PikoChain gas 成本趋零，但不能为零）。
3. x402 支付用的是 **wUSDC v2 测试币**（`0x83de4653D2851Ff2175e71683054B876ABA55533`，零锚定、无价值）。
4. 生产环境密钥走环境变量/硬件钱包；永远不要把私钥写进代码、日志或 skill 文件。
