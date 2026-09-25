// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PikoPayRegistry - on-chain service directory for the PikoPay AI payment network
/// @notice Agents discover payable services here: endpoint + price, no middleman.
contract PikoPayRegistry {
    struct Service {
        address owner;
        string endpoint;       // e.g. http://host:8091/api/insight
        uint256 pricePerCall;  // in token smallest units (wUSDC: 6 decimals)
        address payTo;
        string meta;           // human/agent-readable description
        bool active;
    }

    mapping(bytes32 => Service) public services;

    event ServiceRegistered(bytes32 indexed id, address indexed owner, string endpoint, uint256 pricePerCall);
    event ServiceUpdated(bytes32 indexed id, uint256 pricePerCall, bool active);

    function register(
        bytes32 id,
        string calldata endpoint,
        uint256 pricePerCall,
        address payTo,
        string calldata meta
    ) external {
        require(services[id].owner == address(0), "id taken");
        require(payTo != address(0), "bad payTo");
        services[id] = Service(msg.sender, endpoint, pricePerCall, payTo, meta, true);
        emit ServiceRegistered(id, msg.sender, endpoint, pricePerCall);
    }

    function setPrice(bytes32 id, uint256 pricePerCall) external {
        Service storage s = services[id];
        require(msg.sender == s.owner, "not owner");
        s.pricePerCall = pricePerCall;
        emit ServiceUpdated(id, pricePerCall, s.active);
    }

    function setActive(bytes32 id, bool active) external {
        Service storage s = services[id];
        require(msg.sender == s.owner, "not owner");
        s.active = active;
        emit ServiceUpdated(id, s.pricePerCall, active);
    }

    function get(bytes32 id) external view returns (
        address owner, string memory endpoint, uint256 pricePerCall,
        address payTo, string memory meta, bool active
    ) {
        Service storage s = services[id];
        return (s.owner, s.endpoint, s.pricePerCall, s.payTo, s.meta, s.active);
    }
}
