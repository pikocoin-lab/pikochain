#!/bin/bash
# Start PikoChain x402 demo stack: facilitator (:8090) + resource server (:8091)
cd "$(dirname "$0")"
for svc in facilitator server; do
  if pgrep -f "x402/scripts/$svc.js" >/dev/null; then
    echo "$svc already running"
  else
    nohup node scripts/$svc.js >> logs/$svc.log 2>&1 &
    echo "$svc started (pid $!)"
  fi
done
