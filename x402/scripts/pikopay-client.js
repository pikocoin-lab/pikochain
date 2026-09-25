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

async function pay(url, signer, opts = {}) {
  const network = opts.network || 'eip155:2049';
  const tokenName = opts.tokenName || 'Wrapped USD Coin';
  const tokenVersion = opts.tokenVersion || '1';
  const timeoutSec = opts.timeoutSec || 600;

  let r = await fetch(url, { headers: opts.headers || {} });
  if (r.status === 200) return { paid: false, status: 200, body: await r.json(), paymentResponse: null };
  if (r.status !== 402) throw new Error(`pikopay: unexpected status ${r.status}`);
  const req402 = await r.json();
  const accept = (req402.accepts || []).find((a) => a.network === network);
  if (!accept) throw new Error(`pikopay: no ${network} option offered`);

  const now = Math.floor(Date.now() / 1000);
  const authorization = {
    from: await signer.getAddress(),
    to: accept.payTo,
    value: accept.maxAmountRequired,
    validAfter: (now - 60).toString(),
    validBefore: (now + timeoutSec).toString(),
    nonce: ethers.hexlify(ethers.randomBytes(32)),
  };
  const signature = await signer.signTypedData(
    { name: tokenName, version: tokenVersion, chainId: Number(network.split(':')[1]), verifyingContract: accept.asset },
    TRANSFER_TYPES,
    authorization
  );
  const paymentPayload = { x402Version: 1, scheme: 'exact', network, payload: { signature, authorization } };

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
