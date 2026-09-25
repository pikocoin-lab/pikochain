// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title wUSDC v2 - mainnet-track wrapped USD Coin (EIP-3009)
/// @notice Issuance is rule-bound: ONLY the bridge contract (minter) can mint,
///         and the bridge only mints 1:1 against USDC locked on Base.
///         v1 (0x68ac954700Fc1D0592721f1A5e785A8393253385) is retired test supply.
contract WUSDCv2 {
    string public name = "Wrapped USD Coin";
    string public symbol = "wUSDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    address public owner;
    address public minter;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
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
    event OwnershipTransferred(address indexed newOwner);
    event MinterChanged(address indexed newMinter);

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }
    modifier onlyMinter() { require(msg.sender == minter, "not minter"); _; }

    constructor() {
        owner = msg.sender;
        minter = msg.sender; // deployer sets the bridge right after deployment
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

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero address");
        owner = newOwner;
        emit OwnershipTransferred(newOwner);
    }

    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "zero address");
        minter = _minter;
        emit MinterChanged(_minter);
    }

    /// @notice Rule-bound issuance: only the bridge can mint.
    function mint(address to, uint256 value) external onlyMinter {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }

    function burn(uint256 value) external {
        require(balanceOf[msg.sender] >= value, "insufficient balance");
        balanceOf[msg.sender] -= value;
        totalSupply -= value;
        emit Transfer(msg.sender, address(0), value);
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
        address from; address to; uint256 value;
        uint256 validAfter; uint256 validBefore; bytes32 nonce;
        uint8 v; bytes32 r; bytes32 s;
    }

    function transferWithAuthorization(
        address from, address to, uint256 value,
        uint256 validAfter, uint256 validBefore, bytes32 nonce,
        uint8 v, bytes32 r, bytes32 s
    ) external {
        Authorization memory a = Authorization(from, to, value, validAfter, validBefore, nonce, v, r, s);
        _validateAuthorization(a, TRANSFER_WITH_AUTHORIZATION_TYPEHASH);
        _transfer(a.from, a.to, a.value);
    }

    function receiveWithAuthorization(
        address from, address to, uint256 value,
        uint256 validAfter, uint256 validBefore, bytes32 nonce,
        uint8 v, bytes32 r, bytes32 s
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
