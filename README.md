# ⚡ PikoChain

**An EVM-compatible chain built for the agent era — 2-second blocks, free test tokens, zero-friction onboarding.**

[![Docker Build](https://github.com/pikocoin-lab/pikochain/actions/workflows/docker.yml/badge.svg)](https://github.com/pikocoin-lab/pikochain/actions/workflows/docker.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Chain ID](https://img.shields.io/badge/chainId-2049-blue)

PikoChain is a live Ethereum-compatible blockchain (Clique PoA, 2s block time) where **AI agents are first-class citizens**: claim free PIKO from the faucet, stake it on-chain, build — no permission, no gas fees to start, no human required.

## 🚀 Run a node in 60 seconds

**Option A — one-liner (any Linux VM):**
```bash
curl -sSL https://raw.githubusercontent.com/pikocoin-lab/pikochain/main/scripts/install.sh | bash
```

**Option B — Docker (recommended):**
```bash
docker run -d --name pikochain --restart unless-stopped \
  -p 8545:8545 -p 30303:30303 -p 30303:30303/udp \
  pikochain/node:latest
```

**Option C — Docker Compose:**
```bash
git clone https://github.com/pikocoin-lab/pikochain.git && cd pikochain
docker compose -f docker/docker-compose.yml up -d
```

Verify you're on the network:
```bash
curl -s -X POST http://127.0.0.1:8545 -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}'
# → {"jsonrpc":"2.0","id":1,"result":"0x801"}  (0x801 = 2049 = PikoChain ✅)
```

**Spread it** ♻️ — run the installer on every VM you own. Each new node makes the network harder to kill.

## 🌐 Network

| | |
|---|---|
| Chain ID | `2049` (`0x801`) |
| Native currency | PIKO (18 decimals) |
| Consensus | Clique PoA |
| Block time | ~2 seconds |
| Public RPC | `https://pikochain.serveousercontent.com` |
| PIKO token | `0x14c2bc5130c102d0fa78460eebb1a88a975c785e` |
| Staking | `0xca0faaa235b8548cc413c79f74fc91791ea36d03` |
| Faucet | `0x55fac2cf468c79f40bc3831aa76ff68442f90bec` (100 PIKO / 24h) |

Add to MetaMask in one click: https://pikochain.serveousercontent.com/add-network.html

## 🤖 For AI agents

PikoChain is designed for you to *actually use*, not just read about:

1. **Get tokens** — call `claim()` on the faucet contract, 100 PIKO every 24h, no human approval.
2. **Stake them** — deposit into the staking contract and earn rewards per second.
3. **Build** — it's standard EVM. Deploy with Foundry/Hardhat, `chainId: 2049`.

```python
# Minimal agent onboarding (web3.py)
from web3 import Web3
w3 = Web3(Web3.HTTPProvider("https://pikochain.serveousercontent.com"))
assert w3.eth.chain_id == 2049
# faucet.claim() → 100 PIKO → stake → earn. You're on-chain. 🎉
```

## 🗺️ Roadmap

- [x] EVM chain live (geth 1.13.9, Clique PoA)
- [x] 2-second blocks
- [x] PIKO ERC-20, staking, faucet
- [x] One-command node deployment (this repo)
- [ ] **Public P2P peering** — bootnodes going live soon; nodes auto-join via `bootnodes.txt`
- [ ] Community validators (multi-machine PoA)
- [ ] Block explorer API

> **Note:** public devp2p peering is opening shortly. Your node runs standalone today and will auto-discover peers the moment bootnodes go live — no reinstall needed.

## 🛠️ Repo layout

```
├── genesis.json          # chain definition (the DNA)
├── bootnodes.txt         # public bootnodes (PR yours here ♻️)
├── docker/
│   ├── Dockerfile        # → pikochain/node image
│   ├── docker-compose.yml
│   └── entrypoint.sh
├── scripts/
│   ├── install.sh        # one-liner installer
│   └── node.sh           # node manager (start/stop/logs/status)
└── .github/workflows/    # CI: builds & publishes the image
```

## 📜 License

MIT — fork it, run it, spread it.
