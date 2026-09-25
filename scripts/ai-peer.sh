#!/bin/bash
# PikoChain AI 节点 peer keeper
# 背景：PikoChain 主网目前通过一条 TCP 公网桥暴露 P2P（免费隧道每 30 分钟换端口），
# 本脚本每 5 分钟轮询最新的 enode 地址并保持连接，断线自动重连。
#
# 用法（已用 install.sh 装好节点后，加到 cron 每 5 分钟跑一次）：
#   */5 * * * * bash /path/to/pikochain/scripts/ai-peer.sh >>/tmp/piko-peer.log 2>&1
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
DATA="$DIR/data"
BRIDGE="https://pikochain.serveousercontent.com/enode.txt"
STATE="$DIR/.peer-enode"

ENODE=$(curl -s -m 20 "$BRIDGE" | tr -d ' \t\n\r')
if [ -z "$ENODE" ]; then
  echo "[$(date '+%F %T')] bridge unreachable, skip" >&2
  exit 0
fi
OLD=$(cat "$STATE" 2>/dev/null || true)

# 即使 enode 没变，也确保 peer 在（geth 可能丢了连接）
if [ "$ENODE" != "$OLD" ]; then
  if [ -n "$OLD" ]; then
    geth attach --datadir "$DATA" --exec "admin.removePeer('$OLD')" >/dev/null 2>&1
  fi
  echo -n "$ENODE" > "$STATE"
  echo "[$(date '+%F %T')] bridge enode updated"
fi
geth attach --datadir "$DATA" --exec "admin.addPeer('$ENODE')" >/dev/null 2>&1
PEERS=$(geth attach --datadir "$DATA" --exec "admin.peers.length" 2>/dev/null)
echo "[$(date '+%F %T')] peers=${PEERS:-?} bridge=${ENODE:0:20}..."
