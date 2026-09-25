#!/bin/bash
# Base seller 公网隧道看门狗：ssh 断了就重连，URL 写入 /tmp/piko-base-url.txt
# 用法：bash keep-base-tunnel.sh（建议每 5 分钟跑一次）
LOG=/tmp/serveo-base.log
URL_FILE=/tmp/piko-base-url.txt
DURABLE_PROXY=~/workspace/my-chain/evm/proxy-ssh.sh
[ -x /tmp/proxy-ssh.sh ] || { [ -x "$DURABLE_PROXY" ] && cp "$DURABLE_PROXY" /tmp/proxy-ssh.sh && chmod +x /tmp/proxy-ssh.sh; }

running() { pgrep -f "pikobase:80:localhost:8092" > /dev/null 2>&1; }

if ! running; then
    echo "[$(date '+%F %T')] base tunnel down, restarting..." >> "$LOG"
    (ssh -i ~/.ssh/serveo_pikochain -o StrictHostKeyChecking=no -o ConnectTimeout=15 \
        -o ServerAliveInterval=30 -o ServerAliveCountMax=3 \
        -o ProxyCommand="/tmp/proxy-ssh.sh %h %p" \
        -R pikobase:80:localhost:8092 serveo.net "sleep 3600" >> "$LOG" 2>&1 &)
    sleep 45
fi
URL=$(grep -oE "https://[a-z0-9.-]+\.serveousercontent\.com" "$LOG" | tail -1)
[ -n "$URL" ] && echo -n "$URL" > "$URL_FILE"
# 健康检查：公网 /text-stats?quote=1 应返回 402 且 network 为 base 主网
if [ -n "$URL" ]; then
    OK=0
    for i in 1 2 3; do
        OK=$(curl -s -m 15 "$URL/text-stats?quote=1" | grep -c '"network":"base"')
        [ "$OK" -ge 1 ] && break
        sleep 20
    done
    [ "$OK" -ge 1 ] || { echo "[$(date '+%F %T')] base health check failed after 3 tries" >> "$LOG"; pkill -f "pikobase:80:localhost:8092"; }
fi
