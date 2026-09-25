# PikoChain node image — geth 1.13.9 + PikoChain genesis, zero-config join.
FROM ethereum/client-go:v1.13.9

LABEL org.opencontainers.image.title="PikoChain Node"
LABEL org.opencontainers.image.description="One-command EVM node for the PikoChain network (chainId 2049)"
LABEL org.opencontainers.image.licenses="MIT"

# genesis + bootnodes baked in
COPY genesis.json /pikochain/genesis.json
COPY bootnodes.txt /pikochain/bootnodes.txt
COPY docker/entrypoint.sh /pikochain/entrypoint.sh
RUN chmod +x /pikochain/entrypoint.sh

VOLUME ["/pikochain/data"]
EXPOSE 8545 8546 30303 30303/udp

ENTRYPOINT ["/pikochain/entrypoint.sh"]
