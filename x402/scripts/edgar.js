// SEC EDGAR 财报提取模块: POST /api/edgar  {"ticker":"AAPL"} | {"cik":"320193"}
//   ?ticker=AAPL&filingType=10-K 亦可。输出: 公司/CIK、最新申报元数据、XBRL 关键财务
//   (Revenue / Net Income / Total Assets, 最新 10-K 年度值)。
// 数据源: data.sec.gov (免费, 无需 key)。www.sec.gov 从本机出口 IP 被 Akamai 限流,
// ticker->CIK 采用本地核验映射表 + 条件刷新; 所有 SEC 请求带识别 UA, 节流 <=10 req/s。
const fs = require('fs');
const path = require('path');

const SEC_UA = 'PikoChain-edgar/1.0 (contact: piko@pikochain)';
const CACHE_DIR = path.join(__dirname, '..', 'sec-cache');
const BUNDLED = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, 'tickers.json'), 'utf8'));

// ---------- SEC 请求节流 (<=10 req/s, 实际 ~6/s) ----------
let lastSecTs = 0;
async function secThrottle() {
  const gap = 170 - (Date.now() - lastSecTs);
  if (gap > 0) await new Promise((r) => setTimeout(r, gap));
  lastSecTs = Date.now();
}
async function secFetch(url) {
  await secThrottle();
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(url, {
      signal: ctl.signal,
      headers: { 'User-Agent': SEC_UA, Accept: 'application/json' },
    });
    if (!r.ok) throw new Error(`SEC upstream HTTP ${r.status}`);
    return r.json();
  } catch (e) {
    if (e.message.startsWith('SEC upstream')) throw e;
    throw new Error(`SEC upstream unreachable: ${e.message}`);
  } finally { clearTimeout(t); }
}

// ---------- 内存缓存 ----------
const mem = new Map();
const cGet = (k) => { const e = mem.get(k); return e && e.exp > Date.now() ? e.v : null; };
const cSet = (k, v, ttl) => mem.set(k, { exp: Date.now() + ttl, v });
const HOUR = 3600000;

// ---------- ticker -> CIK ----------
function loadTickerMap() {
  const full = path.join(CACHE_DIR, 'tickers-full.json');
  try {
    const st = fs.statSync(full);
    if (Date.now() - st.mtimeMs < 24 * HOUR) {
      const d = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (Object.keys(d).length > 1000) return d;
    }
  } catch { /* fall through to bundled */ }
  const m = {};
  for (const [t, v] of Object.entries(BUNDLED)) m[t] = v.cik;
  return m;
}
// 尝试刷新全量映射 (www.sec.gov 可能 403, 失败则静默保留现有)
async function tryRefreshTickerMap() {
  const marker = path.join(CACHE_DIR, '.refresh-attempt');
  try {
    const last = Number(fs.readFileSync(marker, 'utf8') || 0);
    if (Date.now() - last < 24 * HOUR) return;
  } catch { /* first run */ }
  try { fs.writeFileSync(marker, String(Date.now())); } catch { /* ignore */ }
  try {
    const raw = await secFetch('https://www.sec.gov/files/company_tickers.json');
    const m = {};
    for (const v of Object.values(raw)) {
      if (v.ticker && v.cik_str) m[String(v.ticker).toUpperCase()] = String(v.cik_str).padStart(10, '0');
    }
    if (Object.keys(m).length > 5000) {
      fs.writeFileSync(path.join(CACHE_DIR, 'tickers-full.json'), JSON.stringify(m));
    }
  } catch { /* keep bundled map; www.sec.gov is rate-limited from our egress IP */ }
}

async function getSubmissions(cik10) {
  const k = 'sub:' + cik10;
  let v = cGet(k);
  if (!v) {
    v = await secFetch(`https://data.sec.gov/submissions/CIK${cik10}.json`);
    if (!v || !v.filings || !v.filings.recent) throw new Error('bad submissions payload');
    cSet(k, v, HOUR);
  }
  return v;
}

async function resolveCIK(input) {
  const s = String(input).trim();
  if (/^\d{1,10}$/.test(s)) {
    const cik10 = s.padStart(10, '0');
    await getSubmissions(cik10); // 404/空 -> throw, 校验 CIK 真实存在
    return cik10;
  }
  const t = s.toUpperCase();
  const map = loadTickerMap();
  if (!/^[A-Z]{1,5}$/.test(t) || !map[t]) throw new Error(`unknown ticker "${s}"`);
  return map[t];
}

// ---------- 申报选择 ----------
function pickFiling(sub, filingType) {
  const r = sub.filings.recent;
  const want = filingType ? [filingType] : ['10-K', '10-Q'];
  for (let i = 0; i < r.form.length; i++) {
    if (want.includes(r.form[i])) {
      return {
        form: r.form[i],
        filed: r.filingDate[i],
        accessionNumber: r.accessionNumber[i],
        periodEnd: r.reportDate[i] || null,
        primaryDocument: r.primaryDocument[i],
      };
    }
  }
  throw new Error(filingType ? `no ${filingType} filings found` : 'no 10-K/10-Q filings found');
}

function filingUrl(cik10, accession, primaryDoc) {
  const cikTrim = String(Number(cik10));
  const accTrim = accession.replace(/-/g, '');
  return `https://www.sec.gov/Archives/edgar/data/${cikTrim}/${accTrim}/${primaryDoc}`;
}

// ---------- XBRL 财务 ----------
const REVENUE_CONCEPTS = [
  'RevenueFromContractWithCustomerExcludingAssessedTax',
  'SalesRevenueNet',
  'Revenues',
];
async function getConcept(cik10, concept) {
  const k = `xbrl:${cik10}:${concept}`;
  let v = cGet(k);
  if (!v) {
    v = await secFetch(
      `https://data.sec.gov/api/xbrl/companyconcept/CIK${cik10}/us-gaap/${concept}.json`);
    cSet(k, v, HOUR);
  }
  return v;
}
// 取某 concept 最新 10-K 年度事实
function latestAnnualFact(data) {
  const units = (data && data.units) || {};
  const facts = [];
  for (const arr of Object.values(units)) {
    for (const f of arr) {
      if (f.form === '10-K' && typeof f.val === 'number') facts.push(f);
    }
  }
  if (!facts.length) return null;
  facts.sort((a, b) => (a.end < b.end ? 1 : -1));
  const f = facts[0];
  return { value: f.val, unit: f.unit || 'USD', fiscalYearEnd: f.end, filed: f.filed, form: '10-K' };
}

async function getFinancials(cik10) {
  // Revenue: 多个 concept 按最新 10-K 期末择优 (AAPL 等已弃用 Revenues)
  let revenue = null, revenueConcept = null;
  await Promise.all(REVENUE_CONCEPTS.map(async (c) => {
    try { cSet('revtmp:' + c, latestAnnualFact(await getConcept(cik10, c)), HOUR); }
    catch { cSet('revtmp:' + c, null, HOUR); }
  }));
  for (const c of REVENUE_CONCEPTS) {
    const f = cGet('revtmp:' + c);
    if (f && (!revenue || f.fiscalYearEnd > revenue.fiscalYearEnd)) { revenue = f; revenueConcept = c; }
  }
  const [ni, assets] = await Promise.all([
    getConcept(cik10, 'NetIncomeLoss').then(latestAnnualFact).catch(() => null),
    getConcept(cik10, 'Assets').then(latestAnnualFact).catch(() => null),
  ]);
  if (revenue) revenue.concept = revenueConcept;
  return { revenue, netIncome: ni, totalAssets: assets };
}

// ---------- 对外: validate (付款前) / handler ----------
function readInput(u, postBody) {
  const ticker = (postBody && (postBody.ticker || postBody.cik)) ||
    u.searchParams.get('ticker') || u.searchParams.get('cik');
  const filingType = (postBody && postBody.filingType) || u.searchParams.get('filingType') || null;
  return { ticker, filingType };
}

async function edgarValidate(u, postBody) {
  const { ticker, filingType } = readInput(u, postBody);
  if (!ticker) return 'missing ticker: POST JSON {"ticker":"AAPL"} (or {"cik":"320193"}, ?ticker=...)';
  const s = String(ticker).trim();
  if (!/^\d{1,10}$/.test(s) && !/^[A-Za-z]{1,5}$/.test(s))
    return 'bad ticker/cik format (1-5 letters, or 1-10 digit CIK)';
  if (filingType && !['10-K', '10-Q'].includes(filingType))
    return 'filingType must be "10-K" or "10-Q"';
  // 上游可用性预检: SEC 挂了/被墙 -> 400, 绝不在收费前收钱
  try {
    const cik10 = await resolveCIK(s);
    pickFiling(await getSubmissions(cik10), filingType || null);
  } catch (e) {
    return `upstream check failed: ${e.message}`;
  }
  return null;
}

async function edgarHandler(u, postBody) {
  const { ticker, filingType } = readInput(u, postBody);
  const cik10 = await resolveCIK(String(ticker).trim());
  const sub = await getSubmissions(cik10);
  const filing = pickFiling(sub, filingType || null);
  const financials = await getFinancials(cik10);
  // 后台尝试刷新全量 ticker 映射 (不阻塞)
  tryRefreshTickerMap().catch(() => {});
  return {
    service: 'edgar',
    ticker: /^[A-Za-z]{1,5}$/.test(String(ticker).trim()) ? String(ticker).trim().toUpperCase() : null,
    company: { name: sub.name, cik: cik10 },
    filing: {
      form: filing.form,
      filed: filing.filed,
      periodEnd: filing.periodEnd,
      accessionNumber: filing.accessionNumber,
      documentUrl: filingUrl(cik10, filing.accessionNumber, filing.primaryDocument),
    },
    financials,
    source: 'SEC EDGAR (data.sec.gov), public filings',
    note: 'financials are latest 10-K annual XBRL facts; test wUSDC payment, no real value',
  };
}

module.exports = { edgarHandler, edgarValidate, resolveCIK, getSubmissions, pickFiling, getFinancials };
