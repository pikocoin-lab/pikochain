#!/usr/bin/env python3
"""Deploy official ERC-8004 Identity + Reputation registries on PikoChain (local test only)."""
import json, time, urllib.request
from eth_utils import keccak
from eth_abi import encode

RPC = "http://127.0.0.1:8545"
DEPLOYER = "0xc4c319e7f366224f2ff2bbb8b8fc0c2de5b99084"

def rpc(method, params):
    req = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
    r = urllib.request.urlopen(urllib.request.Request(
        RPC, data=json.dumps(req).encode(), headers={"Content-Type": "application/json"}), timeout=30)
    out = json.load(r)
    if "error" in out:
        raise RuntimeError(f"RPC {method} error: {out['error']}")
    return out["result"]

def sel(sig):
    return keccak(text=sig)[:4].hex()

def send_tx(to, data, value=0):
    base = {"from": DEPLOYER, "value": hex(value), "data": data}
    if to:
        base["to"] = to
    gas = int(rpc("eth_estimateGas", [base]), 16)
    gas_price = rpc("eth_gasPrice", [])
    base["gas"] = hex(int(gas * 1.25))
    base["gasPrice"] = gas_price
    txh = rpc("eth_sendTransaction", [base])
    for _ in range(60):
        time.sleep(2)
        rc = rpc("eth_getTransactionReceipt", [txh])
        if rc:
            assert int(rc["status"], 16) == 1, f"tx {txh} failed: {rc}"
            return txh, rc
    raise TimeoutError(f"no receipt for {txh}")

def call(to, data):
    return rpc("eth_call", [{"to": to, "data": data, "from": DEPLOYER}, "latest"])

def deploy(bytecode):
    txh, rc = send_tx(None, "0x" + bytecode)
    addr = rc["contractAddress"]
    print(f"  deployed -> {addr}  (tx {txh})", flush=True)
    return addr

def addr_of(b32):
    return "0x" + b32[-40:]

# ---------- load artifacts ----------
with open("/tmp/erc8004-build-paris/combined.json") as f:
    arts = json.load(f)["contracts"]
def art(name):
    return arts[name]

IDENT = "contracts/IdentityRegistryUpgradeable.sol:IdentityRegistryUpgradeable"
REP = "contracts/ReputationRegistryUpgradeable.sol:ReputationRegistryUpgradeable"
MINI = "contracts/HardhatMinimalUUPS.sol:HardhatMinimalUUPS"
PROXY = "contracts/ERC1967Proxy.sol:ERC1967Proxy"
with open("/tmp/erc8004-helper/build/combined.json") as f:
    helper = list(json.load(f)["contracts"].values())[0]

INIT_ADDR = "0xc4d66de8"   # initialize(address)
INIT_VOID = "0x8129fc1c"   # initialize()
UPGRADE = "0x" + sel("upgradeToAndCall(address,bytes)")

out = {"deployer": DEPLOYER, "chainId": 2049}

print("== 1. HardhatMinimalUUPS implementation ==", flush=True)
mini = deploy(art(MINI)["bin"])

print("== 2. Identity proxy -> MinimalUUPS ==", flush=True)
init_i = INIT_ADDR + encode(["address"], ["0x0000000000000000000000000000000000000000"]).hex()
proxy_bin = art(PROXY)["bin"] + encode(["address", "bytes"], [mini, bytes.fromhex(init_i[2:])]).hex()
proxy_ident = deploy(proxy_bin)

print("== 3. IdentityRegistry implementation ==", flush=True)
impl_ident = deploy(art(IDENT)["bin"])

print("== 4. Upgrade identity proxy -> real impl + initialize() ==", flush=True)
data = UPGRADE + encode(["address", "bytes"], [impl_ident, bytes.fromhex(INIT_VOID[2:])]).hex()
send_tx(proxy_ident, data)
ver = call(proxy_ident, "0x" + sel("getVersion()"))
from eth_abi import decode
print("  getVersion():", decode(["string"], bytes.fromhex(ver[2:]))[0], flush=True)
print("  owner():", addr_of(call(proxy_ident, "0x" + sel("owner()"))), flush=True)
out["identityProxy"] = proxy_ident
out["identityImpl"] = impl_ident

print("== 5. Reputation proxy -> MinimalUUPS (init with identity proxy) ==", flush=True)
init_r = INIT_ADDR + encode(["address"], [proxy_ident]).hex()
proxy_bin_r = art(PROXY)["bin"] + encode(["address", "bytes"], [mini, bytes.fromhex(init_r[2:])]).hex()
proxy_rep = deploy(proxy_bin_r)

print("== 6. ReputationRegistry implementation ==", flush=True)
impl_rep = deploy(art(REP)["bin"])

print("== 7. Upgrade reputation proxy -> real impl + initialize(identityProxy) ==", flush=True)
initdata = "0x" + sel("initialize(address)") + encode(["address"], [proxy_ident]).hex()
data = UPGRADE + encode(["address", "bytes"], [impl_rep, bytes.fromhex(initdata[2:])]).hex()
send_tx(proxy_rep, data)
ver = call(proxy_rep, "0x" + sel("getVersion()"))
print("  getVersion():", decode(["string"], bytes.fromhex(ver[2:]))[0], flush=True)
print("  owner():", addr_of(call(proxy_rep, "0x" + sel("owner()"))), flush=True)
print("  getIdentityRegistry():", addr_of(call(proxy_rep, "0x" + sel("getIdentityRegistry()"))), flush=True)
out["reputationProxy"] = proxy_rep
out["reputationImpl"] = impl_rep
out["minimalUUPS"] = mini

# ---------- functional tests ----------
print("== 8. register agent ==", flush=True)
data = "0x" + sel("register(string)") + encode(["string"], ["ipfs://bafytest-piko-agent-1"]).hex()
txh, rc = send_tx(proxy_ident, data)
agent_id = None
for lg in rc["logs"]:
    if lg["topics"][0] == "0x" + keccak(text="Registered(uint256,string,address)").hex():
        agent_id = int(lg["topics"][1], 16)
print(f"  agentId={agent_id} (tx {txh})", flush=True)
out["testAgentId"] = agent_id

uri = call(proxy_ident, "0x" + sel("tokenURI(uint256)") + encode(["uint256"], [agent_id]).hex())
print("  tokenURI:", decode(["string"], bytes.fromhex(uri[2:]))[0], flush=True)
wallet = call(proxy_ident, "0x" + sel("getAgentWallet(uint256)") + encode(["uint256"], [agent_id]).hex())
print("  agentWallet:", addr_of(wallet), flush=True)

print("== 9. self-feedback must revert ==", flush=True)
data = "0x" + sel("giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)") + encode(
    ["uint256", "int128", "uint8", "string", "string", "string", "string", "bytes32"],
    [agent_id, 90, 2, "quality", "t", "", "", b"\x00" * 32]).hex()
try:
    rpc("eth_call", [{"from": DEPLOYER, "to": proxy_rep, "data": data}, "latest"])
    print("  !! self-feedback did NOT revert (unexpected)", flush=True)
    out["selfFeedbackReverts"] = False
except RuntimeError as e:
    print("  self-feedback reverted as expected", flush=True)
    out["selfFeedbackReverts"] = True

print("== 10. deploy FeedbackHelper + give feedback from distinct client ==", flush=True)
helper_addr = deploy(helper["bin"])
out["feedbackHelper"] = helper_addr
data = "0x" + sel("give(address,uint256,int128,uint8,string,string)") + encode(
    ["address", "uint256", "int128", "uint8", "string", "string"],
    [proxy_rep, agent_id, 85, 2, "quality", "api-test"]).hex()
txh, rc = send_tx(helper_addr, data)
print(f"  feedback tx {txh}", flush=True)

fb = call(proxy_rep, "0x" + sel("readFeedback(uint256,address,uint64)") + encode(
    ["uint256", "address", "uint64"], [agent_id, helper_addr, 1]).hex())
val, dec, t1, t2, revoked = decode(["int128", "uint8", "string", "string", "bool"], bytes.fromhex(fb[2:]))
print(f"  readFeedback: value={val} decimals={dec} tag1={t1} tag2={t2} revoked={revoked}", flush=True)
out["feedback"] = {"value": val, "decimals": dec, "tag1": t1, "tag2": t2, "revoked": revoked}

summ = call(proxy_rep, "0x" + sel("getSummary(uint256,address[],string,string)") + encode(
    ["uint256", "address[]", "string", "string"], [agent_id, [helper_addr], "quality", "api-test"]).hex())
count, svalue, sdec = decode(["uint64", "int128", "uint8"], bytes.fromhex(summ[2:]))
print(f"  getSummary: count={count} value={svalue} decimals={sdec}", flush=True)
out["summary"] = {"count": count, "value": svalue, "decimals": sdec}

with open("/tmp/erc8004-deployment.json", "w") as f:
    json.dump(out, f, indent=2)
print("\nALL DONE. summary -> /tmp/erc8004-deployment.json", flush=True)
