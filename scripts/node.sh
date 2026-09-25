#!/bin/bash
# PikoChain node manager — start | stop | logs | status
DIR="$(cd "$(dirname "$0")" && pwd)"
DATA="$DIR/data"

bootnodes_flag() {
  BN=$(grep -v '^#' "$DIR/bootnodes.txt" 2>/dev/null | grep -v '^[[:space:]]*$' | tr '\n' ',' | sed 's/,$//')
  [ -n "$BN" ] && echo "--bootnodes $BN"
}

case "${1:-status}" in
  start)
    if pgrep -f "geth.*--datadir $DATA" >/dev/null; then
      echo "✓ PikoChain already running"
      exit 0
    fi
    # shellcheck disable=SC2046
    nohup geth --datadir "$DATA" --networkid 2049 --syncmode full \
      $(bootnodes_flag) \
      --http --http.addr 127.0.0.1 --http.port 8545 \
      --http.api eth,net,web3,txpool --http.corsdomain "*" \
      --port 30303 \
      >>"$DIR/node.log" 2>&1 &
    disown
    sleep 2
    echo "🚀 PikoChain node started (RPC :8545)"
    ;;
  stop)
    pkill -f "geth.*--datadir $DATA" && echo "■ Stopped" || echo "- Not running"
    ;;
  logs)
    tail -f "$DIR/node.log"
    ;;
  status)
    if pgrep -f "geth.*--datadir $DATA" >/dev/null; then
      BLOCK=$(curl -s -X POST http://127.0.0.1:8545 -H 'Content-Type: application/json' \
        -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' | grep -oE '0x[0-9a-f]+')
      echo "✓ Running — block $BLOCK ($((BLOCK)))"
    else
      echo "✗ Not running (start with: $0 start)"
    fi
    ;;
  *)
    echo "usage: $0 {start|stop|logs|status}"
    ;;
esac
