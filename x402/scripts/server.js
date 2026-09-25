// Demo x402 resource server: multiple payable demo services on PikoChain.
// No X-PAYMENT -> 402 with payment requirements. Valid X-PAYMENT -> verify+settle -> 200.
//
//   GET /api/insight                          $0.01  AI insight of the day
//   GET /api/translate?text=hello&to=zh       $0.02  demo EN->ZH dictionary translation
//   GET /api/chaindata?action=blockNumber     $0.01  live PikoChain data
//       actions: blockNumber | balance&address=0x.. | pikoBalance&address=0x..
//   GET /api/ask?q=what+is+the+chain+id       $0.01  demo rule-based PikoChain Q&A
const http = require('http');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const PORT = 8091;
const FACILITATOR = 'http://127.0.0.1:8090';
const RPC = 'http://127.0.0.1:8545';
const PUBLIC = 'https://pikochain.serveousercontent.com';
const PIKO_TOKEN = '0x14c2bc5130c102d0fa78460eebb1a88a975c785e'; // PIKO ERC-20, 18 decimals

const deployment = JSON.parse(fs.readFileSync(path.join(__dirname, '../deployment.json'), 'utf8'));
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '../demo-keys.json'), 'utf8'));
const SELLER = keys.seller.address;
const FACILITATOR_ADDR = keys.facilitator.address;
const provider = new ethers.JsonRpcProvider(RPC);

// ---------- service handlers (pure business logic, no payment code) ----------

async function insightHandler() {
  const bn = await (await fetch(RPC, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
  })).json();
  return {
    service: 'insight',
    insight: 'PikoChain says: the best time to build was yesterday; the second best time is block ' + bn.result,
  };
}

// Demo dictionary translation EN->ZH. Word-by-word, unknown words pass through.
// Honest label: demo only, not a full machine-translation engine.
const DICT = {
  hello: '你好', world: '世界', blockchain: '区块链', token: '代币', wallet: '钱包',
  payment: '支付', payments: '支付', agent: '智能体', agents: '智能体', artificial: '人工',
  intelligence: '智能', network: '网络', chain: '链', block: '区块', blocks: '区块',
  transaction: '交易', transactions: '交易', address: '地址', balance: '余额', price: '价格',
  market: '市场', trade: '交易', buy: '买入', sell: '卖出', future: '未来', today: '今天',
  tomorrow: '明天', good: '好', morning: '早上', night: '晚上', thanks: '谢谢', thank: '谢谢',
  you: '你', we: '我们', i: '我', is: '是', are: '是', the: '这', a: '一个', an: '一个',
  and: '和', or: '或', of: '的', in: '在', on: '在', to: '到', for: '为了', with: '与',
  ai: '人工智能', crypto: '加密货币', defi: '去中心化金融', staking: '质押', mining: '挖矿',
  miner: '矿工', faucet: '水龙头', gas: '燃料费', bridge: '桥', cross: '跨',
  decentralized: '去中心化', finance: '金融', smart: '智能', contract: '合约',
  contracts: '合约', piko: 'PIKO', pikochain: 'PikoChain', usdc: 'USDC',
  free: '免费', claim: '领取', daily: '每日', earn: '赚取', build: '建设', best: '最好',
};
function translateHandler(u) {
  return {
    service: 'translate',
    original: u.searchParams.get('text').slice(0, 200),
    translated: u.searchParams.get('text').slice(0, 200).split(/\s+/).map((w) => {
      const k = w.toLowerCase().replace(/[^a-z]/g, '');
      return DICT[k] || w;
    }).join(' '),
    to: 'zh',
    note: 'demo dictionary translation (EN->ZH), not a full MT engine',
  };
}
function translateValidate(u) {
  if (!u.searchParams.get('text')) return 'missing ?text= (e.g. ?text=hello%20world&to=zh)';
  return null;
}

async function chaindataHandler(u) {
  const action = u.searchParams.get('action') || 'blockNumber';
  if (action === 'blockNumber') {
    const blockNumber = await provider.getBlockNumber();
    return { service: 'chaindata', action, blockNumber, chainId: 2049 };
  }
  const address = u.searchParams.get('address') || '';
  if (action === 'balance') {
    const bal = await provider.getBalance(address);
    return { service: 'chaindata', action, address, nativePIKO: ethers.formatEther(bal) };
  }
  const token = new ethers.Contract(PIKO_TOKEN,
    ['function balanceOf(address) view returns (uint256)'], provider);
  const bal = await token.balanceOf(address);
  return { service: 'chaindata', action, address, pikoERC20: ethers.formatEther(bal) };
}
function chaindataValidate(u) {
  const action = u.searchParams.get('action') || 'blockNumber';
  if (!['blockNumber', 'balance', 'pikoBalance'].includes(action))
    return 'unknown action (use blockNumber | balance | pikoBalance)';
  if (action !== 'blockNumber' && !ethers.isAddress(u.searchParams.get('address') || ''))
    return 'bad or missing ?address= (e.g. ?action=balance&address=0x...)';
  return null;
}

// Demo rule-based Q&A about PikoChain. Keyword matching, honest demo label.
const QA = [
  { k: ['chain id', 'chainid', '链id', '链 id'], a: 'PikoChain chain ID is 2049 (0x801), ~2s blocks, EVM-compatible.' },
  { k: ['rpc'], a: 'Public RPC: https://pikochain.serveousercontent.com — chain ID 2049 (0x801).' },
  { k: ['faucet', '水龙头', '免费领'], a: 'Claim 100 PIKO every 24h at https://pikochain.serveousercontent.com/faucet.html (test distribution, no real value).' },
  { k: ['stak', '质押'], a: 'Stake PIKO at https://pikochain.serveousercontent.com/staking.html — rewards come from a pre-funded pool.' },
  { k: ['mining', '挖矿', '矿场'], a: 'PikoChain is PoA (no hash mining). "Mining" = daily participation rewards: https://pikochain.serveousercontent.com/mining.html' },
  { k: ['explorer', '浏览器', '查询交易'], a: 'Block explorer: https://pikochain.serveousercontent.com/explorer.html' },
  { k: ['x402', '支付', 'payment', 'pay'], a: 'PikoPay: pay $0.01-$0.02 in test wUSDC per API call via x402 (402 -> EIP-712 sign -> 200). You pay zero gas; the facilitator settles on-chain.' },
  { k: ['piko price', 'piko价格', '币价'], a: 'PIKO has no real market price yet. Demo services are priced in test wUSDC (no real value).' },
  { k: ['bridge', '桥', '跨链'], a: 'PikoChain HTLC contract supports trustless atomic swaps with any EVM chain sharing the same hash lock. See https://pikochain.serveousercontent.com/bridge.html' },
  { k: ['node', '节点', '跑节点'], a: 'Run a node in ~60s: https://github.com/pikocoin-lab/pikochain — scripts/install.sh or docker.' },
];
function askHandler(u) {
  const q = u.searchParams.get('q').slice(0, 200);
  const lq = q.toLowerCase();
  const hit = QA.find((item) => item.k.some((k) => lq.includes(k)));
  return {
    service: 'ask', question: q,
    answer: hit ? hit.a : 'Demo Q&A: I can answer about chain id, rpc, faucet, staking, mining, explorer, x402 payments, bridge, nodes. Try one of those.',
    note: 'demo rule-based Q&A, not an LLM',
  };
}
function askValidate(u) {
  if (!u.searchParams.get('q')) return 'missing ?q= (e.g. ?q=what%20is%20the%20chain%20id)';
  return null;
}

// ---------- x402 plumbing (shared by all services) ----------

const SERVICES = {
  '/api/insight': {
    price: '10000', description: 'PikoChain AI insight API - $0.01 per call',
    resource: `http://127.0.0.1:${PORT}/api/insight`, handler: insightHandler,
  },
  '/api/translate': {
    price: '20000', description: 'Demo EN->ZH dictionary translation - $0.02 per call',
    resource: `${PUBLIC}/x402/translate`, handler: translateHandler, validate: translateValidate,
  },
  '/api/chaindata': {
    price: '10000', description: 'Live PikoChain data (block, balances) - $0.01 per call',
    resource: `${PUBLIC}/x402/chaindata`, handler: chaindataHandler, validate: chaindataValidate,
  },
  '/api/ask': {
    price: '10000', description: 'Demo rule-based PikoChain Q&A - $0.01 per call',
    resource: `${PUBLIC}/x402/ask`, handler: askHandler, validate: askValidate,
  },
  // x402 v2 showcase: metered translation, scheme "upto".
  // Client authorizes a MAX ($0.10); server settles the ACTUAL metered amount
  // ($0.001 per translated word). Mirrors official upto semantics for LLM tokens.
  '/api/upto-translate': {
    scheme: 'upto',
    maxPrice: '100000',       // $0.10 ceiling per call
    pricePerUnit: '1000',     // $0.001 per word
    unit: 'word',
    description: 'Metered EN->ZH dictionary translation - $0.001/word, up to $0.10 (x402 v2 upto)',
    resource: `${PUBLIC}/x402/upto-translate`, handler: translateHandler, validate: translateValidate,
  },
};

// ---- platform fee discovery (from facilitator /supported) ----
// When feeBps > 0, the 402 advertises it and payers must attach a second
// EIP-3009 authorization (feePayload) of `price * bps / 10000` to feeRecipient,
// on top of the merchant price. The merchant still receives the full price.
let FEE = { bps: 0, recipient: '' };
async function refreshFee() {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 3000);
    const r = await fetch(`${FACILITATOR}/supported`, { signal: ctl.signal });
    clearTimeout(t);
    const s = await r.json();
    FEE = { bps: Number(s?.fee?.bps || 0), recipient: String(s?.fee?.recipient || '') };
  } catch { FEE = { bps: 0, recipient: '' }; }
  return FEE;
}

function requirements(svc) {
  const fee = FEE.bps > 0 ? { feeBps: FEE.bps, feeRecipient: FEE.recipient } : {};
  return {
    x402Version: 1,
    error: 'Payment required: ' + svc.description,
    accepts: [{
      scheme: 'exact',
      network: 'eip155:2049',
      maxAmountRequired: svc.price,
      resource: svc.resource,
      description: svc.description,
      mimeType: 'application/json',
      payTo: SELLER,
      maxTimeoutSeconds: 300,
      asset: deployment.wusdc,
      extra: { name: 'Wrapped USD Coin', version: '1' },
      ...fee,
    }],
  };
}

// x402 v2 PaymentRequired object (goes in the PAYMENT-REQUIRED response header).
function requirementsV2(svc, u) {
  const fee = FEE.bps > 0 ? { feeBps: FEE.bps, feeRecipient: FEE.recipient } : {};
  const out = {
    x402Version: 2,
    error: 'PAYMENT-SIGNATURE header is required',
    resource: {
      url: svc.resource + (u.search || ''),
      description: svc.description,
      mimeType: 'application/json',
    },
    accepts: [],
  };
  if (svc.scheme === 'upto') {
    out.accepts.push({
      scheme: 'upto',
      network: 'eip155:2049',
      amount: svc.maxPrice, // v2 upto: amount = authorized MAXIMUM at requirements time
      asset: deployment.wusdc,
      payTo: SELLER,
      maxTimeoutSeconds: 300,
      extra: {
        name: 'Wrapped USD Coin', version: '1',
        assetTransferMethod: 'piko-allowance', // PikoChain upto method (Permit2 not on 2049)
        facilitatorAddress: FACILITATOR_ADDR,
        unit: svc.unit, pricePerUnit: svc.pricePerUnit,
      },
      ...fee, // platform fee (if any) is taken from the facilitator allowance on settle
    });
  } else {
    out.accepts.push({
      scheme: 'exact',
      network: 'eip155:2049',
      amount: svc.price,
      asset: deployment.wusdc,
      payTo: SELLER,
      maxTimeoutSeconds: 300,
      extra: { name: 'Wrapped USD Coin', version: '1', assetTransferMethod: 'eip3009' },
      ...fee,
    });
  }
  return out;
}
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64');

async function postJson(url, obj) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  });
  return r.json();
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const svc = SERVICES[u.pathname];
  if (!svc) {
    res.writeHead(404); res.end('not found'); return;
  }
  // validate request params BEFORE asking for payment (don't charge for bad input)
  if (svc.validate) {
    const err = svc.validate(u);
    if (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err }));
      return;
    }
  }
  const paymentB64 = req.headers['x-payment'] || req.headers['payment-signature'];
  const isV2Header = !!req.headers['payment-signature'];
  if (!paymentB64) {
    // 402: v1 body (unchanged, old clients keep working) + v2 PAYMENT-REQUIRED header
    await refreshFee(); // advertise the current platform fee (if any)
    res.writeHead(402, {
      'Content-Type': 'application/json',
      'PAYMENT-REQUIRED': b64(requirementsV2(svc, u)),
    });
    res.end(JSON.stringify(requirements(svc)));
    return;
  }
  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(paymentB64, 'base64').toString('utf8'));
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'malformed payment header' }));
    return;
  }
  // Two client shapes are accepted:
  //  A) { x402Version, scheme, network, payload, feePayload? }   (pikopay-client.js)
  //  B) { paymentPayload: {...}, feePayload? }                   (piko-x402 buyer skill)
  let paymentPayload = decoded;
  if (decoded && decoded.paymentPayload && !decoded.payload) paymentPayload = decoded.paymentPayload;
  await refreshFee(); // fee config may have changed since the client saw the 402
  const feePayload = paymentPayload.feePayload || decoded.feePayload || null;
  const isV2 = isV2Header || paymentPayload.x402Version === 2;

  // ---- scheme: upto (v2 only). Meter AFTER running the handler, settle actual. ----
  if (svc.scheme === 'upto') {
    if (!isV2) {
      res.writeHead(402, { 'Content-Type': 'application/json', 'PAYMENT-REQUIRED': b64(requirementsV2(svc, u)) });
      res.end(JSON.stringify({ ...requirements(svc), error: 'upto requires x402 v2 (PAYMENT-SIGNATURE)' }));
      return;
    }
    const accepted = paymentPayload.accepted || {};
    const up = paymentPayload.payload?.uptoAuthorization || {};
    if (accepted.scheme !== 'upto'
        || (up.payTo || '').toLowerCase() !== SELLER.toLowerCase()
        || BigInt(up.maxAmount || '0') < BigInt(svc.maxPrice)) {
      res.writeHead(402, { 'Content-Type': 'application/json', 'PAYMENT-REQUIRED': b64(requirementsV2(svc, u)) });
      res.end(JSON.stringify({ ...requirements(svc), error: 'upto auth payee/max mismatch' }));
      return;
    }
    const vr = await postJson(`${FACILITATOR}/verify`, { paymentPayload, paymentRequirements: accepted });
    if (!vr.isValid) {
      res.writeHead(402, { 'Content-Type': 'application/json', 'PAYMENT-REQUIRED': b64(requirementsV2(svc, u)) });
      res.end(JSON.stringify({ ...requirements(svc), error: `payment invalid: ${vr.invalidReason}` }));
      return;
    }
    let result;
    try {
      result = await svc.handler(u);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message || 'handler error' }));
      return;
    }
    // meter: words in the translated output x pricePerUnit, capped at maxPrice
    const words = String(result.translated || '').split(/\s+/).filter(Boolean).length;
    let actual = BigInt(words) * BigInt(svc.pricePerUnit);
    if (actual > BigInt(svc.maxPrice)) actual = BigInt(svc.maxPrice);
    const sr = await postJson(`${FACILITATOR}/settle`, {
      paymentPayload,
      paymentRequirements: { ...accepted, amount: actual.toString() }, // v2 upto: amount = ACTUAL
    });
    if (!sr.success) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `settlement failed: ${sr.errorReason}` }));
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'PAYMENT-RESPONSE': b64(sr),
    });
    res.end(JSON.stringify({
      ...result,
      metered: `${words} ${svc.unit}s x $${(Number(svc.pricePerUnit) / 1e6).toFixed(4)}`,
      charged: '$' + (Number(actual) / 1e6).toFixed(4) + ' wUSDC',
      tx: sr.transaction,
    }));
    return;
  }

  // ---- scheme: exact (v1 and v2). Amount/payee check, then verify+settle. ----
  // amount must cover price, payee must be us
  const auth = paymentPayload?.payload?.authorization || {};
  if (BigInt(auth.value || '0') < BigInt(svc.price) || (auth.to || '').toLowerCase() !== SELLER.toLowerCase()) {
    res.writeHead(402, { 'Content-Type': 'application/json', 'PAYMENT-REQUIRED': b64(requirementsV2(svc, u)) });
    res.end(JSON.stringify({ ...requirements(svc), error: 'payment amount/payee mismatch' }));
    return;
  }

  const verifyBody = isV2
    ? { paymentPayload, paymentRequirements: paymentPayload.accepted }
    : { paymentPayload };
  // feePayload was extracted during header decode (both client shapes).
  if (FEE.bps > 0 && !feePayload) {
    res.writeHead(402, { 'Content-Type': 'application/json', 'PAYMENT-REQUIRED': b64(requirementsV2(svc, u)) });
    res.end(JSON.stringify({ ...requirements(svc), error: 'platform fee authorization required (feeBps/feeRecipient in accepts)' }));
    return;
  }
  const settleBody = feePayload ? { ...verifyBody, feePayload } : verifyBody;
  const vr = await postJson(`${FACILITATOR}/verify`, verifyBody);
  if (!vr.isValid) {
    res.writeHead(402, { 'Content-Type': 'application/json', 'PAYMENT-REQUIRED': b64(requirementsV2(svc, u)) });
    res.end(JSON.stringify({ ...requirements(svc), error: `payment invalid: ${vr.invalidReason}` }));
    return;
  }
  const sr = await postJson(`${FACILITATOR}/settle`, settleBody);
  if (!sr.success) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `settlement failed: ${sr.errorReason}` }));
    return;
  }

  let result;
  try {
    result = await svc.handler(u);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message || 'handler error', paid: true, tx: sr.transaction }));
    return;
  }

  const paymentResponseB64 = b64(sr);
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'PAYMENT-RESPONSE': paymentResponseB64,
  });
  res.end(JSON.stringify({
    ...result,
    paid: '$' + (Number(svc.price) / 1e6).toFixed(2) + ' wUSDC',
    tx: sr.transaction,
  }));
});

server.listen(PORT, () => console.log(
  `x402 demo resource server on :${PORT}  (services: ${Object.keys(SERVICES).join(', ')})`));
