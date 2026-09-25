# market-intel — x402 agent-service market intelligence

Daily vertical scraping pipeline. Every day it scrapes **public** x402
paid-service listings and stores structured snapshots in SQLite. Over time this
builds a proprietary database: service directory, per-service price history,
new-service alerts, category price indexes — the raw material for our own
"agent market intel" paid API.

## What it collects (day 1 sources)

| source | what | rows (first run) |
|---|---|---|
| strale `x402-listing.md` | revenue-ranked capability table (real 30-day revenue order) | 8 |
| strale `/x402/catalog` | machine-readable catalog: 272 capabilities w/ USD prices | 272 |
| awesome-x402 × 2 READMEs | curated ecosystem tools & services | ~138 |
| floe x402 directory README | categorized vendor services | 9 |

Every row records its `source_url`. Public listings only — no logins, no
LinkedIn, no personal data. Respects robots.txt, 1.5s throttle, identifies as
`PikoChain-market-intel/1.0`. A blocked source is logged and skipped; rows are
never fabricated.

## Layout

- `market-intel` — the whole thing: idempotent scraper + CLI (Python 3, stdlib only)
- SQLite DB lives **outside** the repo: `~/workspace/data/market-intel/market.db`
  (override with `MARKET_INTEL_DB`). Scrape log: `.../scrape.log`.

Schema: `services` (unique on name+endpoint, `active` flag),
`price_history` (appended **only on price change**), `daily_stats`
(one row per UTC date).

## CLI

```bash
./market-intel scrape            # full scrape, idempotent (daily cron calls this)
./market-intel list              # active services, price desc
./market-intel new --days 7      # services first seen in last N days
./market-intel price <name>      # price history (substring match)
./market-intel stats             # daily aggregates
```

## Daily cron (runbook)

```bash
bash -lc 'cd ~/workspace/pikochain/market-intel && ./market-intel scrape >> ~/workspace/data/market-intel/scrape.log 2>&1'
```

- Idempotent: re-running the same day only refreshes `last_seen`; `price_history`
  grows only when a price actually changes; `daily_stats` upserts per date.
- Services that vanish from all sources are flipped to `active=0` (kept for history).
- `market-intel new --days 1` after the run shows that day's new services.

## Data notes

- strale catalog prices are authoritative (machine-readable `price_usd`).
- awesome-list prices are parsed from prose (`$X` in descriptions) — directional,
  not audited. Check `source_url` before quoting.
- `price_units` = USDC 6-decimal atomic units (`usd × 1e6`); `NULL` = unknown.
- Categories are keyword-inferred; `other` means unclassified.

## Roadmap

- More sources: x402.org/ecosystem, x402 Bazaar catalog, BlockRun directory,
  `gh search code` for 402-issuing endpoints.
- Alerting: diff `new --days 1` into the daily report.
- Paid API: serve category price indexes + new-service feed over x402.
