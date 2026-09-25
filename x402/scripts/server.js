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

// ---------- web-intel: POST /api/extract ----------
// Input: JSON {"url":"https://..."} (or ?url= for GET). Output: clean markdown
// + title/description/OG metadata + tech-stack detection + outbound links.
// No third-party API keys: pure fetch + @mozilla/readability + turndown.
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const TurndownService = require('turndown');
const dns = require('dns').promises;
const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

function isPrivateIP(ip) {
  const m = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const a = +m[1], b = +m[2];
    return a === 10 || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || a === 127 || a === 0 || (a === 169 && b === 254);
  }
  const l = ip.toLowerCase();
  return l === '::1' || l.startsWith('fe80:') || l.startsWith('fc') || l.startsWith('fd');
}

async function checkUrlAllowed(raw) {
  let u;
  try { u = new URL(String(raw)); } catch { return 'invalid URL'; }
  if (!['http:', 'https:'].includes(u.protocol)) return 'only http(s) URLs allowed';
  let addrs;
  try { addrs = await dns.lookup(u.hostname, { all: true }); }
  catch { return 'DNS resolution failed'; }
  if (addrs.some((a) => isPrivateIP(a.address))) return 'private/internal URLs are blocked';
  return null;
}

async function fetchPage(target) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  let r;
  try {
    r = await fetch(target, {
      signal: ctl.signal, redirect: 'follow',
      headers: { 'User-Agent': 'PikoIntel/1.0 (+https://pikochain.serveousercontent.com)' },
    });
  } finally { clearTimeout(t); }
  if (!r.ok) throw new Error(`fetch failed: HTTP ${r.status}`);
  const ct = r.headers.get('content-type') || '';
  if (!/text\/html|application\/xhtml/i.test(ct))
    throw new Error(`unsupported content-type: ${ct.slice(0, 60)}`);
  const reader = r.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 2000000) { try { reader.cancel(); } catch {} throw new Error('page too large (>2MB)'); }
    chunks.push(value);
  }
  const headers = {};
  r.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
  return { html: Buffer.concat(chunks).toString('utf8'), headers, finalUrl: r.url };
}

const TECH_FINGERPRINTS = [
  { name: 'WordPress', test: (h, html) => html.includes('wp-content') || html.includes('wp-includes') || /<meta[^>]+generator[^>]*wordpress/i.test(html) },
  { name: 'Next.js', test: (h, html) => html.includes('_next/static') || html.includes('__NEXT_DATA__') },
  { name: 'Nuxt', test: (h, html) => html.includes('_nuxt/') || html.includes('__NUXT__') },
  { name: 'Gatsby', test: (h, html) => html.includes('chunk-mapping') },
  { name: 'Drupal', test: (h, html) => /drupal\.js|Drupal\.settings/i.test(html) },
  { name: 'Joomla', test: (h, html) => /<meta[^>]+generator[^>]*joomla/i.test(html) },
  { name: 'Shopify', test: (h, html) => html.includes('cdn.shopify.com') },
  { name: 'Wix', test: (h, html) => html.includes('wixstatic.com') },
  { name: 'Squarespace', test: (h, html) => html.includes('squarespace') },
  { name: 'Ghost', test: (h, html) => /<meta[^>]+generator[^>]*ghost/i.test(html) },
  { name: 'React', test: (h, html) => html.includes('react-dom') || /data-reactroot/i.test(html) },
  { name: 'Vue', test: (h, html) => html.includes('vue.runtime') || /data-v-[a-f0-9]{8}/i.test(html) },
  { name: 'Angular', test: (h, html) => html.includes('ng-version') },
  { name: 'jQuery', test: (h, html) => /jquery(\.min)?\.js/i.test(html) },
  { name: 'Tailwind', test: (h, html) => /tailwind/i.test(html) },
  { name: 'Bootstrap', test: (h, html) => /bootstrap(\.min)?\.(css|js)/i.test(html) },
  { name: 'Cloudflare', test: (h) => !!(h['cf-ray'] || (h.server || '').toLowerCase().includes('cloudflare')) },
  { name: 'Fastly', test: (h) => !!(h['x-served-by'] && /cache/i.test(h['x-served-by'])) },
  { name: 'Akamai', test: (h) => !!h['x-akamai-transformed'] },
  { name: 'CloudFront', test: (h) => (h.via || '').includes('cloudfront') || (h.server || '').includes('cloudfront') },
];

async function extractHandler(u, postBody) {
  const target = (postBody && postBody.url) || u.searchParams.get('url');
  const { html, headers, finalUrl } = await fetchPage(target);
  const dom = new JSDOM(html, { url: finalUrl });
  const doc = dom.window.document;
  const meta = (sel) => doc.querySelector(sel)?.getAttribute('content') || null;
  const title = doc.querySelector('title')?.textContent?.trim() || null;
  const description = meta('meta[name="description"]');
  const og = {};
  for (const p of ['og:title', 'og:description', 'og:image', 'og:type', 'og:site_name',
                   'og:url', 'twitter:card', 'twitter:title', 'twitter:description']) {
    const v = meta(`meta[property="${p}"],meta[name="${p}"]`);
    if (v) og[p] = v;
  }
  let markdown = '';
  try {
    const article = new Readability(doc).parse();
    if (article && article.content) markdown = turndown.turndown(article.content);
  } catch { /* fall through to fallback */ }
  if (!markdown.trim()) {
    markdown = (doc.body?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 8000);
  }
  markdown = markdown.slice(0, 20000);
  const techStack = TECH_FINGERPRINTS
    .filter((f) => { try { return f.test(headers, html); } catch { return false; } })
    .map((f) => f.name);
  if (headers.server) techStack.push('server:' + headers.server.slice(0, 40));
  if (headers['x-powered-by']) techStack.push('powered-by:' + headers['x-powered-by'].slice(0, 40));
  const host = new URL(finalUrl).hostname;
  const outboundLinks = [...new Set(
    [...doc.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))
  )]
    .map((href) => { try { return new URL(href, finalUrl).href; } catch { return null; } })
    .filter((h) => h && /^https?:/.test(h) && new URL(h).hostname !== host)
    .slice(0, 50);
  dom.window.close();
  return {
    service: 'extract', url: target, finalUrl,
    title, description, og, techStack, outboundLinks, markdown,
  };
}

async function extractValidate(u, postBody) {
  const target = (postBody && postBody.url) || u.searchParams.get('url');
  if (!target) return 'missing URL: POST JSON {"url":"https://..."} (or ?url=...)';
  return checkUrlAllowed(target); // null = ok, else the reason
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
  // web-intel: paid page extraction. POST JSON {"url":"https://..."} (GET ?url= also works).
  // Returns clean markdown + title/description/OG + tech-stack + outbound links. $0.01/call.
  '/api/extract': {
    price: '10000',
    description: 'Web intelligence: URL -> clean markdown + metadata + tech-stack + outbound links - $0.01 per call',
    resource: `${PUBLIC}/x402/extract`, handler: extractHandler, validate: extractValidate,
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

function readBodyRaw(req, max) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > max) { reject(new Error('body too large')); req.destroy(); }
      else data += c;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

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
  // read JSON body for POST (bounded); handlers/validators receive it as 2nd arg
  let postBody = null;
  if (req.method === 'POST') {
    try {
      const raw = await readBodyRaw(req, 65536);
      postBody = raw ? JSON.parse(raw) : {};
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'malformed JSON body' }));
      return;
    }
  }
  // validate request params BEFORE asking for payment (don't charge for bad input)
  if (svc.validate) {
    const err = await svc.validate(u, postBody);
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
      result = await svc.handler(u, postBody);
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
  // Run settlement and the service handler concurrently: wall time ~= max(settle,
  // handler) instead of the sum, keeping public-tunnel responses under the edge
  // timeout. The handler result is only ever returned when settlement succeeded;
  // on settlement failure it is computed and discarded, never sent back.
  const [srSettled, hrSettled] = await Promise.allSettled([
    postJson(`${FACILITATOR}/settle`, settleBody),
    (async () => svc.handler(u, postBody))(),
  ]);
  const sr = srSettled.status === 'fulfilled' ? srSettled.value : null;
  if (!sr || !sr.success) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `settlement failed: ${sr ? sr.errorReason : 'facilitator unreachable'}` }));
    return;
  }
  if (hrSettled.status === 'rejected') {
    const e = hrSettled.reason;
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: (e && e.message) || 'handler error', paid: true, tx: sr.transaction }));
    return;
  }
  const result = hrSettled.value;

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
