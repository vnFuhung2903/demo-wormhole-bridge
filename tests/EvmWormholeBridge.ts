import hre from "hardhat";
import * as dotenv from "dotenv";
import { wormhole } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import { ZeroAddress } from "ethers";

dotenv.config();

describe("EvmWormholeBridge", function () {
  // it("Should register sender address", async () => {
  //   const contract = await hre.ethers.getContractAt("WormholeBridge", process.env.WORMHOLE_BASE_BRIDGE_ADDRESS!);
  //   const wh = await wormhole('Testnet', [evm]);
  //   const chainId = wh.getChain("Avalanche").config.chainId, senderAddress = process.env.WORMHOLE_AVAX_BRIDGE_ADDRESS!;
  //   let bytes32Address = new Uint8Array(32);
  //   for(let i = 0; i < 32; ++i) {
  //       if(i >= 12)
  //         bytes32Address[i] = parseInt(senderAddress.substr((i - 12) * 2 + 2, 2), 16);
  //       else
  //         bytes32Address[i] = parseInt("0", 16);
  //   }
  //   const tx = await contract.registerSender(chainId, bytes32Address);
  //   await tx.wait();
  //   console.log(tx);
  // })

  it("Should send message successfully", async () => {
    const contract = await hre.ethers.getContractAt("WormholeBridge", process.env.WORMHOLE_AVAX_BRIDGE_ADDRESS!);
    const wh = await wormhole('Testnet', [evm]);
    const amount = 10, marketKey = 1, answerKey = 2, bettingKey = 3, targetChain = wh.getChain("BaseSepolia").config.chainId;
    const fee = await contract.quoteEVMDeliveryCost(targetChain);
    const tx = await contract.sendMessageToEvm(
      ZeroAddress, // betting token
      amount,
      marketKey,
      answerKey,
      bettingKey,
      targetChain,
      process.env.WORMHOLE_BASE_BRIDGE_ADDRESS!,
      {
        gasLimit: 1e6, 
        value: fee
      }
    );
    await tx.wait();
    console.log(tx);
  })
});