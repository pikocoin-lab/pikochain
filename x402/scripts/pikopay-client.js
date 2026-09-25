// pikopay-client: one-line x402 payments for AI agents.
//   const { pay } = require('./pikopay-client');
//   const res = await pay('http://host:8091/api/insight', agentWallet);
// Handles 402 -> EIP-712 sign -> X-PAYMENT retry automatically.
const { ethers } = require('ethers');

const TRANSFER_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};

async function signAuth(signer, { name, version, chainId, verifyingContract, to, value, timeoutSec }) {
  const now = Math.floor(Date.now() / 1000);
  const authorization = {
    from: await signer.getAddress(),
    to,
    value: value.toString(),
    validAfter: (now - 60).toString(),
    validBefore: (now + timeoutSec).toString(),
    nonce: ethers.hexlify(ethers.randomBytes(32)),
  };
  const signature = await signer.signTypedData(
    { name, version, chainId, verifyingContract },
    TRANSFER_TYPES,
    authorization
  );
  return { signature, authorization };
}

async function pay(url, signer, opts = {}) {
  const network = opts.network || 'eip155:2049';
  const tokenName = opts.tokenName || 'Wrapped USD Coin';
  const tokenVersion = opts.tokenVersion || '1';
  const timeoutSec = opts.timeoutSec || 600;
  const chainId = Number(network.split(':')[1]);

  let r = await fetch(url, { headers: opts.headers || {} });
  if (r.status === 200) return { paid: false, status: 200, body: await r.json(), paymentResponse: null };
  if (r.status !== 402) throw new Error(`pikopay: unexpected status ${r.status}`);
  const req402 = await r.json();
  const accept = (req402.accepts || []).find((a) => a.network === network);
  if (!accept) throw new Error(`pikopay: no ${network} option offered`);

  const domain = {
    name: tokenName, version: tokenVersion, chainId,
    verifyingContract: accept.asset,
  };
  const payment = await signAuth(signer, {
    ...domain, to: accept.payTo, value: BigInt(accept.maxAmountRequired), timeoutSec,
  });
  const paymentPayload = {
    x402Version: 1, scheme: 'exact', network,
    payload: payment,
  };

  // platform fee leg: when the 402 advertises feeBps > 0, sign a second
  // EIP-3009 authorization (fresh nonce) paying price*bps/10000 to feeRecipient.
  // The merchant still receives the full price; the fee is paid on top.
  const feeBps = Number(accept.feeBps || accept.extra?.feeBps || 0);
  const feeRecipient = accept.feeRecipient || accept.extra?.feeRecipient || '';
  if (feeBps > 0) {
    if (!feeRecipient) throw new Error('pikopay: feeBps advertised but no feeRecipient');
    const fee = (BigInt(accept.maxAmountRequired) * BigInt(feeBps)) / 10000n;
    if (fee > 0n) {
      paymentPayload.feePayload = await signAuth(signer, {
        ...domain, to: feeRecipient, value: fee, timeoutSec,
      });
    }
  }

  r = await fetch(url, {
    headers: {
      ...(opts.headers || {}),
      'X-PAYMENT': Buffer.from(JSON.stringify(paymentPayload)).toString('base64'),
    },
  });
  const body = await r.json().catch(() => ({}));
  return {
    paid: r.status === 200,
    status: r.status,
    body,
    paymentResponse: r.headers.get('payment-response')
      ? JSON.parse(Buffer.from(r.headers.get('payment-response'), 'base64').toString('utf8'))
      : null,
    paymentPayload, // keep for potential batch use
  };
}

module.exports = { pay };
