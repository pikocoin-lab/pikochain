// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PikoUSDVault - holds real USDC on Base (deploy on Base mainnet)
/// @notice Users lock USDC here; the operator watches Locked events and mints
///         wUSDC 1:1 on PikoChain via PikoUSDBridge. Burn on PikoChain ->
///         operator calls release() here.
///         DEPLOY NOTE: pass the real USDC address on Base as _usdc.
///         Verify it at deploy time (do not trust this comment for the address).
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract PikoUSDVault {
    address public owner;
    address public operator;
    IERC20 public immutable usdc;

    event Locked(address indexed user, uint256 amount);
    event Released(address indexed to, uint256 amount);
    event OperatorChanged(address indexed newOperator);

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }
    modifier onlyOperator() { require(msg.sender == operator, "not operator"); _; }

    constructor(address _usdc, address _operator) {
        require(_usdc != address(0) && _operator != address(0), "zero address");
        usdc = IERC20(_usdc);
        owner = msg.sender;
        operator = _operator;
    }

    /// @notice Lock real USDC. Watcher mints wUSDC on PikoChain against this event.
    function lock(uint256 amount) external {
        require(amount > 0, "zero amount");
        require(usdc.transferFrom(msg.sender, address(this), amount), "lock failed");
        emit Locked(msg.sender, amount);
    }

    /// @notice Release USDC after wUSDC was burned on PikoChain (ReleaseRequested).
    function release(address to, uint256 amount) external onlyOperator {
        require(to != address(0) && amount > 0, "bad params");
        require(usdc.transfer(to, amount), "release failed");
        emit Released(to, amount);
    }

    function setOperator(address _operator) external onlyOwner {
        require(_operator != address(0), "zero address");
        operator = _operator;
        emit OperatorChanged(_operator);
    }
}
