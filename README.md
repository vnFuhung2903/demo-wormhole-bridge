# Evm Wormhole bridge

## Getting started

### Register sender program
```
function registerSender(uint16 sourceChain, bytes32 sourceAddress) external onlyPolicy
```
* ``sourceChain``: sender's chainId
* ``sourceAddress``: sender's address
* ``onlyPolicy``: only owner of this contract can call this function

### Send betting message to Solana market program
```
function sendMessageToSolana(
    address _bettingToken,
    uint64 _amount,
    uint64 _marketId,
    uint64 _answerId
) external payable
```
* ``_bettingToken``: token address used for betting in evm chains
* ``_amount``: amount for betting
* ``_marketId``: marketId in solana
* ``_answerId``: answerId in solana

### Receive reward token from Solana market program
```
function redeemTransferWithPayload(bytes memory encodedVM) public
```
* ``encodeVM``: the encoded vaa in bytes