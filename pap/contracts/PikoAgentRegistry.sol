// SPDX-License-Identifier: CC0-1.0
pragma solidity 0.8.20;

/// @title PikoAgentRegistry — PAP-1 身份注册表
/// @notice 实现 PAP-1 §4（身份与授权）+ §5.1（EIP-712 信封）+ 附录 C 参考接口。
/// @dev 本地参考实现，未审计。只做本地编译测试，绝不部署到任何链。
///      - 身份记录字段遵循 §4.2：agentId / controller / payTo / metadataURI / metadataHash / recovery / status / createdAt
///      - metadataURI 仅允许 ipfs://（CIDv1，客户端校验）或 https://（§4.2）
///      - 版本字段遵循 §3.2：PAP_VERSION "1.0"，MAJOR.MINOR；resolve 返回固定元组以便向前兼容
///      - EIP-712 domain 参数化遵循 §5.1：name "Piko Agent Protocol" / version "1.0" / chainId / verifyingContract
///      - eventId 定义为 typed data 的 EIP-712 digest（§5.1），不写入结构本身
///      - ERC-1271 智能账户校验超出本合约范围，由未来的 EventVerifier 处理（§4.3：MVP 可用 EOA）
contract PikoAgentRegistry {

    // ============ 版本（§3.2） ============

    /// @notice 协议版本，MAJOR.MINOR
    string public constant PAP_VERSION = "1.0";
    uint8 public constant PAP_MAJOR = 1;
    uint8 public constant PAP_MINOR = 0;

    // ============ EIP-712（§5.1） ============

    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    /// @notice PAPEvent 类型哈希，字段顺序与 §5.1 完全一致，不得调整
    bytes32 public constant PAP_EVENT_TYPEHASH = keccak256(
        "PAPEvent(string papVersion,string eventType,address actor,uint256 nonce,uint64 createdAt,uint64 expiresAt,string hashAlg,bytes32 contentHash,string contentURI,bytes32 parentId,bytes32 contextId)"
    );

    bytes32 private constant DOMAIN_NAME_HASH = keccak256(bytes("Piko Agent Protocol"));
    bytes32 private constant DOMAIN_VERSION_HASH = keccak256(bytes("1.0"));

    /// @notice PAP 事件信封，字段顺序与 §5.1 完全一致
    struct PAPEvent {
        string papVersion;
        string eventType;
        address actor;
        uint256 nonce;
        uint64 createdAt;
        uint64 expiresAt;
        string hashAlg;
        bytes32 contentHash;
        string contentURI;
        bytes32 parentId;
        bytes32 contextId;
    }

    // ============ 身份记录（§4.2） ============

    enum Status { ACTIVE, SUSPENDED }

    struct Agent {
        address controller;
        address payTo;
        string metadataURI;
        bytes32 metadataHash;
        address recovery;
        Status status;
        uint64 createdAt;
    }

    uint256 private _nextAgentId = 1;
    mapping(uint256 => Agent) private _agents;
    /// @notice 防重复注册：keccak256(controller, keccak256(uri), metadataHash)
    mapping(bytes32 => bool) private _registrationSeal;

    // ============ 事件 ============

    event AgentRegistered(uint256 indexed agentId, address indexed controller, string metadataURI, bytes32 metadataHash);
    event MetadataUpdated(uint256 indexed agentId, string metadataURI, bytes32 metadataHash);
    event ControllerRotated(uint256 indexed agentId, address indexed oldController, address indexed newController);
    event PayToUpdated(uint256 indexed agentId, address indexed oldPayTo, address indexed newPayTo);
    event RecoveryUpdated(uint256 indexed agentId, address indexed oldRecovery, address indexed newRecovery);
    event StatusChanged(uint256 indexed agentId, uint8 status);

    // ============ 注册（附录 C 接口） ============

    /// @notice 注册 agent 身份。调用者成为 controller 与 payTo（§4.2）。
    /// @dev 同一 controller 可注册多个 agentId（附录 B.3），但完全相同的三元组视为重复注册而回滚。
    function register(string calldata metadataURI, bytes32 metadataHash, address recovery)
        external
        returns (uint256 agentId)
    {
        require(_isValidURI(metadataURI), "PAP: bad metadataURI scheme");
        require(recovery != address(0), "PAP: recovery required");

        bytes32 seal = keccak256(abi.encode(msg.sender, keccak256(bytes(metadataURI)), metadataHash));
        require(!_registrationSeal[seal], "PAP: duplicate registration");
        _registrationSeal[seal] = true;

        agentId = _nextAgentId++;
        _agents[agentId] = Agent({
            controller: msg.sender,
            payTo: msg.sender,
            metadataURI: metadataURI,
            metadataHash: metadataHash,
            recovery: recovery,
            status: Status.ACTIVE,
            createdAt: uint64(block.timestamp)
        });
        emit AgentRegistered(agentId, msg.sender, metadataURI, metadataHash);
    }

    /// @notice 更新元数据，仅 controller（附录 B.3：非 controller 必须回滚）
    function setMetadata(uint256 agentId, string calldata uri, bytes32 hash) external {
        Agent storage a = _agents[agentId];
        require(a.controller != address(0), "PAP: unknown agent");
        require(a.status == Status.ACTIVE, "PAP: agent suspended");
        require(msg.sender == a.controller, "PAP: not controller");
        require(_isValidURI(uri), "PAP: bad metadataURI scheme");
        a.metadataURI = uri;
        a.metadataHash = hash;
        emit MetadataUpdated(agentId, uri, hash);
    }

    /// @notice 密钥轮换：由旧 controller 签署（§4.3）。轮换后旧 controller 立即失效（附录 B.3）。
    function rotateController(uint256 agentId, address newController) external {
        Agent storage a = _agents[agentId];
        require(a.controller != address(0), "PAP: unknown agent");
        require(a.status == Status.ACTIVE, "PAP: agent suspended");
        require(msg.sender == a.controller, "PAP: not controller");
        require(newController != address(0), "PAP: zero controller");
        address oldController = a.controller;
        a.controller = newController;
        emit ControllerRotated(agentId, oldController, newController);
    }

    /// @notice 查询身份（附录 C 接口）。返回元组固定顺序，向前兼容不得调整。
    function resolve(uint256 agentId) external view returns (
        address controller, address payTo, string memory uri, bytes32 hash, uint8 status
    ) {
        Agent storage a = _agents[agentId];
        require(a.controller != address(0), "PAP: unknown agent");
        return (a.controller, a.payTo, a.metadataURI, a.metadataHash, uint8(a.status));
    }

    // ============ 身份管理扩展（§4.2 / §4.3） ============

    /// @notice 更新收款地址，仅 controller
    function setPayTo(uint256 agentId, address newPayTo) external {
        Agent storage a = _agents[agentId];
        require(a.controller != address(0), "PAP: unknown agent");
        require(a.status == Status.ACTIVE, "PAP: agent suspended");
        require(msg.sender == a.controller, "PAP: not controller");
        require(newPayTo != address(0), "PAP: zero payTo");
        address oldPayTo = a.payTo;
        a.payTo = newPayTo;
        emit PayToUpdated(agentId, oldPayTo, newPayTo);
    }

    /// @notice 更新恢复账户，仅 controller（§4.3：恢复账户需预设）
    function setRecovery(uint256 agentId, address newRecovery) external {
        Agent storage a = _agents[agentId];
        require(a.controller != address(0), "PAP: unknown agent");
        require(msg.sender == a.controller, "PAP: not controller");
        require(newRecovery != address(0), "PAP: zero recovery");
        address oldRecovery = a.recovery;
        a.recovery = newRecovery;
        emit RecoveryUpdated(agentId, oldRecovery, newRecovery);
    }

    /// @notice 冻结身份，仅 controller。冻结后不得产生新的受限状态（附录 B.3）。
    function suspend(uint256 agentId) external {
        Agent storage a = _agents[agentId];
        require(a.controller != address(0), "PAP: unknown agent");
        require(msg.sender == a.controller, "PAP: not controller");
        a.status = Status.SUSPENDED;
        emit StatusChanged(agentId, uint8(Status.SUSPENDED));
    }

    /// @notice 解冻身份，仅 controller
    function activate(uint256 agentId) external {
        Agent storage a = _agents[agentId];
        require(a.controller != address(0), "PAP: unknown agent");
        require(msg.sender == a.controller, "PAP: not controller");
        a.status = Status.ACTIVE;
        emit StatusChanged(agentId, uint8(Status.ACTIVE));
    }

    // ============ 只读辅助 ============

    /// @notice 返回完整身份记录（含 recovery 与 createdAt）
    function getAgent(uint256 agentId) external view returns (
        address controller, address payTo, string memory uri, bytes32 hash,
        address recovery, uint8 status, uint64 createdAt
    ) {
        Agent storage a = _agents[agentId];
        require(a.controller != address(0), "PAP: unknown agent");
        return (a.controller, a.payTo, a.metadataURI, a.metadataHash, a.recovery, uint8(a.status), a.createdAt);
    }

    /// @notice 已注册 agent 数量
    function agentCount() external view returns (uint256) {
        return _nextAgentId - 1;
    }

    /// @notice 本合约的 EIP-712 domain separator（§5.1 参数化 domain）
    function domainSeparator() public view returns (bytes32) {
        return keccak256(abi.encode(
            EIP712_DOMAIN_TYPEHASH,
            DOMAIN_NAME_HASH,
            DOMAIN_VERSION_HASH,
            block.chainid,
            address(this)
        ));
    }

    // ============ EIP-712 事件验证（§5.1） ============

    /// @notice PAPEvent 结构体哈希（字段顺序固定，见 PAP_EVENT_TYPEHASH）
    function hashPAPEvent(PAPEvent calldata e) public pure returns (bytes32) {
        return keccak256(abi.encode(
            PAP_EVENT_TYPEHASH,
            keccak256(bytes(e.papVersion)),
            keccak256(bytes(e.eventType)),
            e.actor,
            e.nonce,
            e.createdAt,
            e.expiresAt,
            keccak256(bytes(e.hashAlg)),
            e.contentHash,
            keccak256(bytes(e.contentURI)),
            e.parentId,
            e.contextId
        ));
    }

    /// @notice 事件 digest（即 eventId，§5.1：digest 本身不写入结构）
    function eventDigest(PAPEvent calldata e) public view returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator(), hashPAPEvent(e)));
    }

    /// @notice 在显式 domain 下计算 digest，用于规范附录 B.1 测试向量验证
    function eventDigestForDomain(bytes32 domainSep, PAPEvent calldata e) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", domainSep, hashPAPEvent(e)));
    }

    /// @notice 从 digest + 签名恢复 signer。长度非法直接回滚。
    function recoverSigner(bytes32 digest, bytes calldata signature) public pure returns (address) {
        require(signature.length == 65, "PAP: bad signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        return ecrecover(digest, v, r, s);
    }

    /// @notice 严格验证事件签名：恢复出的 signer 为零地址则回滚（§5.1：验证者必须检查签名）
    /// @dev nonce / 时间窗口 / 内容哈希 / 引用交易的检查属于事件验证层，由未来的 EventVerifier 执行
    function verifyEvent(PAPEvent calldata e, bytes calldata signature) external view returns (address signer) {
        signer = recoverSigner(eventDigest(e), signature);
        require(signer != address(0), "PAP: invalid signature");
    }

    // ============ 内部 ============

    /// @notice URI scheme 白名单（§4.2）：仅 ipfs:// 或 https://
    /// @dev ipfs CIDv1 的完整 multibase 校验由客户端执行，链上只做 scheme 门控
    function _isValidURI(string calldata uri) internal pure returns (bool) {
        bytes memory b = bytes(uri);
        if (b.length > 8) {
            // "https://"
            if (
                b[0] == 0x68 && b[1] == 0x74 && b[2] == 0x74 && b[3] == 0x70 &&
                b[4] == 0x73 && b[5] == 0x3a && b[6] == 0x2f && b[7] == 0x2f
            ) return true;
        }
        if (b.length > 7) {
            // "ipfs://"
            if (
                b[0] == 0x69 && b[1] == 0x70 && b[2] == 0x66 && b[3] == 0x73 &&
                b[4] == 0x3a && b[5] == 0x2f && b[6] == 0x2f
            ) return true;
        }
        return false;
    }
}
