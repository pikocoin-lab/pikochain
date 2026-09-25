#!/bin/bash
# Start PikoChain x402 demo stack: facilitator (:8090) + resource server (:8091)
cd "$(dirname "$0")"
# Bounty 自助领币保持开启（否则重启后 /bounty 变 403）
export X402_BOUNTY_ENABLED=1
# 平台手续费（2026-09-25 用户拍板开启）：每笔 exact/upto 结算抽 1%，由付款人另签一份
# EIP-3009 fee 授权支付，商户实收标价不受影响。收款地址为用户主地址。
# fee=0 时行为与旧版完全一致；fee>0 时缺 fee 签名的支付会被拒绝（客户端需支持 feePayload）。
export X402_FEE_BPS=100
export X402_FEE_RECIPIENT=0x3BD7d1505Ea03D1483044287f2246FF68231B277
for svc in facilitator server; do
  if pgrep -f "x402/scripts/$svc.js" >/dev/null; then
    echo "$svc already running"
  else
    nohup node scripts/$svc.js >> logs/$svc.log 2>&1 &
    echo "$svc started (pid $!)"
  fi
done
