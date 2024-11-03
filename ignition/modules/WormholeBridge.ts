import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import bs58 from "bs58";
import * as dotenv from "dotenv";

dotenv.config();

const WormholeBridgeModule = buildModule("WormholeBridgeModule", (m) => {
  const wormhole = m.getParameter("_wormhole", process.env.WORMHOLE_CORE_ETH_ADDRESS!);
  const tokenBridge = m.getParameter("_tokenBridge", process.env.TOKEN_BRIDGE_ETH_ADDRESS!);
  const circleIntegration = m.getParameter("_circleIntegration", process.env.CIRCLE_INTEGRATION!);

  const contract = m.contract("WormholeBridge", [wormhole, tokenBridge, circleIntegration]);
  return { contract };
});

export default WormholeBridgeModule;
