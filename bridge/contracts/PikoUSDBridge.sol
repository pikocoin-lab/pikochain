// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PikoUSDBridge - the ONLY minter of wUSDC v2 (PikoChain side)
/// @notice Rule: 1 wUSDC is minted if and only if the operator attests that
///         1 USDC was locked in the PikoUSDVault on Base (event + tx hash).
///         Users burn wUSDC here to request USDC release on Base.
///         Trust model (honest): single operator today -> multisig/DAO later.
///         Fully trustless minting would need ZK proofs of Base state; not yet.
interface IWUSDCv2 {
    function mint(address to, uint256 value) external;
    function burn(uint256 value) external;
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract PikoUSDBridge {
    address public owner;
    address public operator;
    address public vault; // PikoUSDVault on Base (set when deployed; informational for watchers)
    IWUSDCv2 public immutable wusdc;

    event MintAttested(address indexed to, uint256 amount, bytes32 indexed baseTxHash);
    event ReleaseRequested(address indexed user, uint256 amount, address indexed baseRecipient);
    event OperatorChanged(address indexed newOperator);
    event VaultChanged(address indexed newVault);
    event OwnershipTransferred(address indexed newOwner);

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }
    modifier onlyOperator() { require(msg.sender == operator, "not operator"); _; }

    constructor(address _wusdc, address _operator) {
        wusdc = IWUSDCv2(_wusdc);
        owner = msg.sender;
        operator = _operator;
    }

    /// @notice Mint wUSDC 1:1 against USDC locked on Base. Operator attests the Base lock.
    function mint(address to, uint256 amount, bytes32 baseTxHash) external onlyOperator {
        require(to != address(0) && amount > 0, "bad params");
        wusdc.mint(to, amount);
        emit MintAttested(to, amount, baseTxHash);
    }

    /// @notice Burn wUSDC on PikoChain; operator releases USDC on Base to baseRecipient.
    function burnForRelease(uint256 amount, address baseRecipient) external {
        require(baseRecipient != address(0) && amount > 0, "bad params");
        require(wusdc.transferFrom(msg.sender, address(this), amount), "pull failed");
        wusdc.burn(amount);
        emit ReleaseRequested(msg.sender, amount, baseRecipient);
    }

    function setOperator(address _operator) external onlyOwner {
        require(_operator != address(0), "zero address");
        operator = _operator;
        emit OperatorChanged(_operator);
    }

    function setVault(address _vault) external onlyOwner {
        vault = _vault;
        emit VaultChanged(_vault);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero address");
        owner = newOwner;
        emit OwnershipTransferred(newOwner);
    }
}
