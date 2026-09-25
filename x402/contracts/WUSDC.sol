// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title wUSDC - EIP-3009 compatible wrapped USD Coin (PikoChain x402 demo)
/// @notice Demo token for x402 micropayments on PikoChain (chainId 2049).
///         PRODUCTION WARNING: minting here is owner-controlled. Real wUSDC
///         must be minted 1:1 against USDC locked on Base via PikoHTLC atomic swaps.
contract WUSDC {
    string public name = "Wrapped USD Coin";
    string public symbol = "wUSDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    // EIP-3009: authorizer => nonce => used
    mapping(address => mapping(bytes32 => bool)) public authorizationState;

    bytes32 public DOMAIN_SEPARATOR;

    bytes32 public constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH =
        keccak256("TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)");
    bytes32 public constant RECEIVE_WITH_AUTHORIZATION_TYPEHASH =
        keccak256("ReceiveWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)");
    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    // ---- demo mint (owner only; replace with HTLC-backed mint in production) ----
    function mint(address to, uint256 value) external onlyOwner {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }

    // ---- ERC-20 ----
    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= value, "allowance exceeded");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "zero address");
        require(balanceOf[from] >= value, "insufficient balance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }

    // ---- EIP-3009 ----
    struct Authorization {
        address from;
        address to;
        uint256 value;
        uint256 validAfter;
        uint256 validBefore;
        bytes32 nonce;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        Authorization memory a = Authorization(from, to, value, validAfter, validBefore, nonce, v, r, s);
        _validateAuthorization(a, TRANSFER_WITH_AUTHORIZATION_TYPEHASH);
        _transfer(a.from, a.to, a.value);
    }

    function receiveWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(to == msg.sender, "receiver must be caller");
        Authorization memory a = Authorization(from, to, value, validAfter, validBefore, nonce, v, r, s);
        _validateAuthorization(a, RECEIVE_WITH_AUTHORIZATION_TYPEHASH);
        _transfer(a.from, a.to, a.value);
    }

    function _validateAuthorization(Authorization memory a, bytes32 typehash) internal {
        require(block.timestamp >= a.validAfter, "authorization not yet valid");
        require(block.timestamp <= a.validBefore, "authorization expired");
        require(!authorizationState[a.from][a.nonce], "authorization already used");
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(typehash, a.from, a.to, a.value, a.validAfter, a.validBefore, a.nonce))
            )
        );
        require(ecrecover(digest, a.v, a.r, a.s) == a.from, "invalid signature");
        authorizationState[a.from][a.nonce] = true;
        emit AuthorizationUsed(a.from, a.nonce);
    }
}
