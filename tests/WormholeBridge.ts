import hre from "hardhat";
import { createVAA, serialize, UniversalAddress, wormhole } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import * as dotenv from "dotenv";
import { AbiCoder, ZeroAddress } from "ethers";

dotenv.config();

describe("WormholeBridge", function () {
  let contract: any;
  let usdc: any;
  beforeEach(async () => {
    contract = await hre.ethers.getContractAt("WormholeBridge", process.env.WORMHOLE_ETH_BRIDGE_ADDRESS!);
    usdc = await hre.ethers.getContractAt("IERC20", process.env.USDC_ADDRESS!);
  })

  // it("Should send message successfully", async () => {
  //   const amount = 10, marketKey = 1, answerKey = 1;
  //   const fee = await contract.getMessageFee(); 
  //   const tx_approve = await usdc.approve(process.env.WORMHOLE_BASE_BRIDGE_ADDRESS!, 10);
  //   await tx_approve.wait();
  //   const tx = await contract.sendMessage(
  //     process.env.USDC_ADDRESS!, 
  //     amount, 
  //     marketKey, 
  //     answerKey, 
  //     {
  //       gasLimit: 2e7, 
  //       value: fee
  //     }
  //   );
  //   const receipt = await tx.wait();
  //   const sequence = Buffer.from(receipt.logs[1].data.slice(2, 66), 'hex');
  //   console.log(Number(sequence.readBigInt64BE(24)));
  // })

  it("Should change emitter address", async () => {
    const wh = await wormhole('Testnet', [evm, solana]);
    const chain = wh.getChain('Solana');
    console.log(chain.config.chainId);
    
    let [msgId] = await chain.parseTransaction('5RGcTecUBDQUa18Q2b1yRZYamYYhswwP4Fb93rn933Yu9mHFyikLKk94mjUfghycuAAEHipYiCoBXkm4MPYFDkLF');
    let VM = await wh.getVaa(msgId, 'TokenBridge:TransferWithPayload', 1000000);
    const tx = await contract.registerSender(chain.config.chainId, VM!.emitterAddress.toUint8Array());
    await tx.wait();
    console.log(tx);
  })

  // it("Should add local usdc address", async () => {
  //   const wh = await wormhole('Testnet', [evm, solana]);
  //   const chain = wh.getChain('Solana');
  //   console.log(chain.config.chainId);
    
  //   let [msgId] = await chain.parseTransaction('5PYjxyB4RBw3oDVaZmKcnKZztq1NzKU1yAACUY6LjY1iwaTGgSWKXQqvcGEi664Mnqkks5PpBq72zP6ipYexMGJa');
  //   let VM = await wh.getVaa(msgId, 'TokenBridge:TransferWithPayload', 1000000);
  //   console.log(VM!.payload.payload);
    
  //   const sourceBytes = VM!.payload.token.address.toString();
  //   console.log(sourceBytes);

  //   const tx = await contract.addUsdcAddress(sourceBytes, process.env.USDC_ADDRESS!);
  //   await tx.wait();
  //   console.log(tx);
  // })

  // it("Should decode VAA", async () => {
  //   const wh = await wormhole('Testnet', [evm, solana]);
  //   const chain = wh.getChain('Solana');
  //   console.log(chain.config.chainId);
    
  //   let [msgId] = await chain.parseTransaction('5PLUuBpoehUVuH3iPYf73F6EArGLPxss4uQu3Y7kY1vVCB11TEvQ6kfS5uvsXbHMfLr9VgQY829nzkWCgFGj9VSn');
  //   let VM = await wh.getVaa(msgId, 'TokenBridge:TransferWithPayload', 60000);

  //   console.log(VM?.payload.token.address.toUint8Array());
    
  //   const solanaUSDC = Uint8Array.from(Buffer.from('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', 'base64').slice(1));
  //   console.log(Uint8Array.from(Buffer.from('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', 'base64')));

  // })

  // it("Should claim token", async () => {
  //   const timestamp = Math.floor(Date.now() / 1000);
  //   const emitterAddress = new UniversalAddress(ZeroAddress, 'hex');
  //   let receiverArr = new Uint8Array(32);
  //   receiverArr.set(Buffer.from(String(process.env.WORMHOLE_BASE_BRIDGE_ADDRESS!).slice(2), 'hex'), 0);

  //   const type = ["address", "address", "uint256", "uint16", "bytes32"];
  //   const value = ["0xc0489CE75b6C23E664F0Bf27E5677A353796cE38", process.env.USDC_ADDRESS!, 10, 10004, receiverArr]
  //   const payload = Buffer.from(AbiCoder.defaultAbiCoder().encode(type, value).slice(2), 'hex');
  //   const vaaBytes = serialize(createVAA('Uint8Array', {
  //     guardianSet: 0,
  //     timestamp: timestamp,
  //     nonce: 0,
  //     emitterChain: "Solana",
  //     emitterAddress: emitterAddress,
  //     sequence: 0n,
  //     consistencyLevel: 0,
  //     signatures: [],
  //     payload: payload
  //   }));

  //   let tx = await contract.receiveMessage(vaaBytes, {gasLimit: 2e7});
  //   await tx.wait();
  //   console.log(tx);
  // })

  it("Should claim token by vaa", async () => {
    const wh = await wormhole('Testnet', [evm, solana]);
    const chain = wh.getChain('Solana');
    console.log(chain.config.chainId);
    
    let [msgId] = await chain.parseTransaction('5RGcTecUBDQUa18Q2b1yRZYamYYhswwP4Fb93rn933Yu9mHFyikLKk94mjUfghycuAAEHipYiCoBXkm4MPYFDkLF');
    let vaaBytes = await wh.getVaaBytes(msgId, 2592000);
    let tx = await contract.redeemTransferWithPayload(vaaBytes, {gasLimit: 2e7});
    await tx.wait();
    console.log(tx);
  })
});