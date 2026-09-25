#!/bin/bash
# PikoChain one-liner installer — spreads the chain to any cloud VM in ~60s.
#
#   curl -sSL https://raw.githubusercontent.com/pikochain/pikochain/main/scripts/install.sh | bash
#
set -e

REPO="https://raw.githubusercontent.com/pikochain/pikochain/main"
INSTALL_DIR="$HOME/pikochain"
GETH_VER="1.13.9"
GETH_COMMIT="dd938d10"

echo "⚡ PikoChain installer — infecting this machine with decentralization..."

# --- 1. geth binary ---
if command -v geth >/dev/null 2>&1; then
  echo "✓ geth already installed: $(geth version 2>/dev/null | grep -m1 Version || true)"
else
  echo "→ Downloading geth $GETH_VER..."
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64)  GARCH="amd64" ;;
    aarch64) GARCH="arm64" ;;
    *) echo "✗ Unsupported arch: $ARCH"; exit 1 ;;
  esac
  TMP=$(mktemp -d)
  curl -sSL -o "$TMP/geth.tar.gz" \
    "https://gethstore.blob.core.windows.net/builds/geth-linux-${GARCH}-${GETH_VER}-${GETH_COMMIT}.tar.gz"
  tar -xzf "$TMP/geth.tar.gz" -C "$TMP"
  sudo mkdir -p /usr/local/bin
  sudo cp "$TMP"/geth-linux-*/geth /usr/local/bin/geth
  rm -rf "$TMP"
  echo "✓ geth $GETH_VER installed"
fi

# --- 2. chain files ---
mkdir -p "$INSTALL_DIR"
curl -sSL -o "$INSTALL_DIR/genesis.json" "$REPO/genesis.json"
curl -sSL -o "$INSTALL_DIR/bootnodes.txt" "$REPO/bootnodes.txt"
curl -sSL -o "$INSTALL_DIR/node.sh" "$REPO/scripts/node.sh"
chmod +x "$INSTALL_DIR/node.sh"

# --- 3. init + start ---
if [ ! -d "$INSTALL_DIR/data/geth" ]; then
  echo "→ Initializing genesis..."
  geth --datadir "$INSTALL_DIR/data" init "$INSTALL_DIR/genesis.json"
fi

"$INSTALL_DIR/node.sh" start

echo ""
echo "🎉 This machine is now part of PikoChain."
echo "   RPC:  http://127.0.0.1:8545"
echo "   Manage: ~/pikochain/node.sh {start|stop|logs|status}"
echo "   Spread it: run this installer on your next VM ♻️"
