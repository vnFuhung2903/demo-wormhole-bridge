// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import "./interfaces/IWormhole.sol";
import "./Policy.sol";
import "./libraries/BytesLib.sol";
import "./interfaces/ITokenBridge.sol";
import "./interfaces/ICircleIntegration.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract WormholeBridge is Policy {
    using SafeERC20 for IERC20;
    using BytesLib for bytes;

    uint32 private NONCE;
    uint8 public constant CONSISTENCY_LEVEL = 200;
    uint64 private minSequence = 0;
    /**
     * Message timeout in seconds: Time out needs to account for:
     * - Finality time on source chain
     * - Time for Wormhole validators to sign and make VAA available to relayers
     * - Time to relay VAA to the target chain
     * - Congestion on target chain leading to delayed inclusion of transaction in target chain
     *
     * Note that there is no way to alter this hard coded value. Including such a feature
     * would require some governance structure and some minumum and maximum values.
     */
    uint256 public constant MESSAGE_TIME_OUT_SECONDS = 2 days;

    IWormhole public immutable wormhole;
    ITokenBridge public immutable tokenBridge;
    ICircleIntegration public immutable circleIntegration;
    mapping(address => mapping (address => uint256)) locked;
    mapping(uint16 => bytes32) messageSender;

    struct Message {
        uint8 payloadID;
        bytes message;
    }

    struct TokenTransfer {
        uint8 payloadID;
        bytes32 recipient;
    }

    event TransferToken(address indexed token, uint256 amount);

    constructor(address _wormhole, address _tokenBridge, address _circleIntegration) Policy() {
        require(_wormhole != address(0), "ZA");
        wormhole = IWormhole(_wormhole);
        require(_tokenBridge != address(0), "ZA");
        tokenBridge = ITokenBridge(_tokenBridge);
        require(_circleIntegration != address(0), "ZA");
        circleIntegration = ICircleIntegration(_circleIntegration);
        NONCE = 0;
    }

    function updateSenderAddress(uint16 _chainId, bytes32 _senderAddress) external onlyPolicy {
        messageSender[_chainId] = _senderAddress;
    }

    function sendMessage(
        address _bettingToken,
        uint64 _amount,
        uint64 _marketId,
        uint64 _answerId
    ) external payable returns(uint64 sequence) {
        uint256 messageFee = wormhole.messageFee();
        require(msg.value >= messageFee, "Invalid msg value");
        IERC20(_bettingToken).safeTransferFrom(msg.sender, address(this), _amount);
        locked[msg.sender][_bettingToken] = _amount;
        bytes memory messagePayload = abi.encodePacked(
            _marketId,
            _answerId,
            uint64(block.timestamp),
            wormhole.chainId(),
            bytes32(bytes20(msg.sender)),
            bytes32(bytes20(_bettingToken)),
            _amount
        );
        Message memory parsedMessage = Message({
            payloadID: 1,
            message: messagePayload
        });

        bytes memory encodeMessage = abi.encodePacked(
            parsedMessage.payloadID,
            uint16(parsedMessage.message.length),
            parsedMessage.message
        );

        sequence = wormhole.publishMessage{value: messageFee}(
            NONCE++, 
            encodeMessage,
            CONSISTENCY_LEVEL
        );
    }

    function receiveMessage(bytes calldata _whMessage) external payable {
        (IWormhole.VM memory vm, bool valid, string memory reason) = wormhole.parseAndVerifyVM(_whMessage);
        require(valid, reason);
        require(messageSender[vm.emitterChainId] == vm.emitterAddress, "Invalid Emitter Address!");

        /**
         * Ensure that the sequence field in the VAA is strictly monotonically increasing. This also acts as
         * a replay protection mechanism to ensure that already executed messages don't execute again.
         */
        require(vm.sequence >= minSequence, "Invalid Sequence number");
        minSequence = vm.sequence + 1;

        // check if the message is still valid as defined by the validity period
        // solhint-disable-next-line not-rely-on-time
        require(vm.timestamp + MESSAGE_TIME_OUT_SECONDS >= block.timestamp, "Message no longer valid");

        (
            address voter,
            address bettingToken,
            uint256 amount,
            uint16 receiverChainId,
            bytes32 receiverAddress
        ) = abi.decode(vm.payload, (address, address, uint256, uint16, bytes32));
        require(receiverChainId == wormhole.chainId(), "Wrong chain Id");
        require(receiverAddress == bytes32(bytes20(address(this))), "Wrong address");

        uint256 lockedAmount = locked[voter][bettingToken];
        require(lockedAmount >= amount, "Invalid amount");
        locked[voter][bettingToken] -= amount;
        IERC20(bettingToken).safeTransfer(voter, amount);
        emit TransferToken(bettingToken, amount);
    }

    function transferCrossChain(
        address _recipient, 
        address _bettingToken, 
        uint64 _amount,
        uint16 _targetChain,
        bytes32 _targetAddress
    ) external payable {
        uint256 messageFee = wormhole.messageFee();
        require(msg.value >= messageFee, "Invalid msg value");
        IERC20(_bettingToken).safeTransferFrom(msg.sender, address(this), _amount);        
        tokenBridge.transferTokensWithPayload(
            _bettingToken,
            _amount,
            _targetChain,
            _targetAddress,
            NONCE,
            abi.encode(_recipient)
        );
    }

    function redeemTransferWithPayload(bytes memory encodedVM) public {
        IWormhole.VM memory vm = wormhole.parseVM(
            encodedVM
        );

        ITokenBridge.TransferWithPayload memory transfer = tokenBridge.parseTransferWithPayload(vm.payload);
        address localTokenAddress = tokenBridge.wrappedAsset(transfer.tokenChain, transfer.tokenAddress);
        if(transfer.tokenChain == 1 && localTokenAddress == address(0)) {
            bytes32 usdcAddress = circleIntegration.fetchLocalTokenAddress(5, transfer.tokenAddress);
            localTokenAddress = address(uint160(uint256(usdcAddress)));
        }
        require(localTokenAddress != address(0), "token not attested");

        tokenBridge.completeTransferWithPayload(
            encodedVM
        );
        uint256 amountTransferred = transfer.amount;

        require(messageSender[vm.emitterChainId] == vm.emitterAddress, "Invalid Emitter Address!");

        TokenTransfer memory payload = decodePayload(
            transfer.payload
        );

        address recipient = address(uint160(uint256(payload.recipient)));
        IERC20(localTokenAddress).safeTransfer(
            recipient,
            amountTransferred
        );
    }

    function decodePayload(
        bytes memory encodedMessage
    ) public pure returns (TokenTransfer memory parsedMessage) {
        uint256 index = 0;
        parsedMessage.payloadID = encodedMessage.toUint8(index);
        require(parsedMessage.payloadID == 1, "invalid payloadID");
        index += 1;
        parsedMessage.recipient = encodedMessage.toBytes32(index);
        index += 32;
        require(index == encodedMessage.length, "invalid payload length");
    }

    function getMessageFee() external view returns(uint256) {
        return wormhole.messageFee();
    }

    function getWormholeChainId() external view returns(uint16) {
        return wormhole.chainId();
    }

    function getSourceAddress(bytes32 tokenAddress, uint16 sourceChain) external view returns(address) {
        uint32 sourceDomain = circleIntegration.getDomainFromChainId(sourceChain);
        return address(uint160(uint256(circleIntegration.fetchLocalTokenAddress(sourceDomain, tokenAddress))));
    }
}