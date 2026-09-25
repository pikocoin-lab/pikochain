#!/bin/sh
# PikoChain entrypoint: init datadir on first run, then join the network.
set -e

DATA=/pikochain/data
GENESIS=/pikochain/genesis.json

if [ ! -d "$DATA/geth" ]; then
  echo "⚡ First run — initializing PikoChain genesis (chainId 2049)..."
  geth --datadir "$DATA" init "$GENESIS"
fi

# Build --bootnodes flag from bootnodes.txt (skip comments/blank lines)
BOOTNODES=$(grep -v '^#' /pikochain/bootnodes.txt | grep -v '^[[:space:]]*$' | tr '\n' ',' | sed 's/,$//')
BOOTFLAG=""
if [ -n "$BOOTNODES" ]; then
  BOOTFLAG="--bootnodes $BOOTNODES"
  echo "🌐 Joining via $(echo "$BOOTNODES" | tr ',' '\n' | grep -c enode) bootnode(s)"
else
  echo "📡 No public bootnodes yet — running standalone, will auto-peer when they go live."
fi

# Extra bootnodes can be injected:  -e BOOTNODES="enode://..."
if [ -n "$EXTRA_BOOTNODES" ]; then
  BOOTFLAG="--bootnodes ${BOOTNODES:+$BOOTNODES,}$EXTRA_BOOTNODES"
fi

echo "🚀 Starting PikoChain node..."
# shellcheck disable=SC2086
exec geth --datadir "$DATA" \
  --networkid 2049 \
  --syncmode full \
  $BOOTFLAG \
  --http --http.addr 0.0.0.0 --http.port 8545 \
  --http.api eth,net,web3,txpool \
  --http.corsdomain "*" \
  --ws --ws.addr 0.0.0.0 --ws.port 8546 \
  --ws.api eth,net,web3 \
  --port 30303 \
  "$@"
