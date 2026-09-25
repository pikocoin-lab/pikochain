// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PikoPaySettler - settle N x402 payments in ONE transaction
/// @notice The facilitator fans out verified EIP-3009 authorizations here.
///         Anyone can call; every leg is authorized by the payer's own signature.
interface IWUSDC {
    function transferWithAuthorization(
        address from, address to, uint256 value,
        uint256 validAfter, uint256 validBefore, bytes32 nonce,
        uint8 v, bytes32 r, bytes32 s
    ) external;
}

contract PikoPaySettler {
    struct Auth {
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

    event BatchSettled(uint256 count);

    function batchTransfer(address token, Auth[] calldata auths) external {
        for (uint256 i = 0; i < auths.length; i++) {
            Auth calldata a = auths[i];
            IWUSDC(token).transferWithAuthorization(
                a.from, a.to, a.value, a.validAfter, a.validBefore, a.nonce, a.v, a.r, a.s
            );
        }
        emit BatchSettled(auths.length);
    }
}
