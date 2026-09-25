// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PikoStream - unidirectional payment channels for AI micropayments
/// @notice Sender opens a channel with a wUSDC deposit. Each micropayment is an
///         OFF-CHAIN signed voucher (microseconds, zero gas). Receiver claims the
///         latest voucher on-chain whenever they want; sender refunds the rest
///         after expiry. Built for per-second AI billing (inference, data feeds).
interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
}

contract PikoStream {
    struct Channel {
        address sender;
        address receiver;
        address token;
        uint256 deposit;
        uint256 paid;       // cumulative amount already paid out
        uint256 expiresAt;
        bool closed;
    }

    mapping(bytes32 => Channel) public channels;

    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public constant VOUCHER_TYPEHASH =
        keccak256("Voucher(bytes32 channelId,uint256 cumulativeAmount)");
    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    event ChannelOpened(bytes32 indexed channelId, address indexed sender, address indexed receiver, uint256 deposit, uint256 expiresAt);
    event Payout(bytes32 indexed channelId, uint256 cumulativeAmount);
    event ChannelClosed(bytes32 indexed channelId, uint256 refunded);

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("PikoStream")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function open(
        bytes32 channelId,
        address receiver,
        address token,
        uint256 deposit,
        uint256 duration
    ) external {
        require(channels[channelId].sender == address(0), "channel exists");
        require(receiver != address(0) && deposit > 0 && duration > 0, "bad params");
        require(IERC20(token).transferFrom(msg.sender, address(this), deposit), "deposit failed");
        channels[channelId] = Channel({
            sender: msg.sender,
            receiver: receiver,
            token: token,
            deposit: deposit,
            paid: 0,
            expiresAt: block.timestamp + duration,
            closed: false
        });
        emit ChannelOpened(channelId, msg.sender, receiver, deposit, block.timestamp + duration);
    }

    /// @notice Receiver submits the LATEST voucher only; pays the increment since last claim.
    ///         Older vouchers are safely replayable (monotonic cumulativeAmount check).
    function payout(
        bytes32 channelId,
        uint256 cumulativeAmount,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        Channel storage c = channels[channelId];
        require(!c.closed, "closed");
        require(cumulativeAmount > c.paid && cumulativeAmount <= c.deposit, "bad amount");
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(VOUCHER_TYPEHASH, channelId, cumulativeAmount))
            )
        );
        require(ecrecover(digest, v, r, s) == c.sender, "bad voucher");
        uint256 delta = cumulativeAmount - c.paid;
        c.paid = cumulativeAmount;
        require(IERC20(c.token).transfer(c.receiver, delta), "pay failed");
        emit Payout(channelId, cumulativeAmount);
    }

    /// @notice Sender reclaims the unspent remainder after expiry.
    function refund(bytes32 channelId) external {
        Channel storage c = channels[channelId];
        require(!c.closed, "closed");
        require(msg.sender == c.sender, "not sender");
        require(block.timestamp >= c.expiresAt, "not expired");
        c.closed = true;
        uint256 rest = c.deposit - c.paid;
        require(IERC20(c.token).transfer(c.sender, rest), "refund failed");
        emit ChannelClosed(channelId, rest);
    }
}
