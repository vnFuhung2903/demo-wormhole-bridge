import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getAddr } from "../scripts/constant";

const deployWormholeBridge: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getUnnamedAccounts, getChainId } = hre;
  const { deploy } = deployments;
  
  const [ deployer ] = await getUnnamedAccounts();
  const chainId = await getChainId();

  await deploy("WormholeBridge", {
    from: deployer,
    args: [
      getAddr("WORMHOLE_CORE_ADDRESS", Number(chainId)),
      getAddr("TOKEN_BRIDGE_ADDRESS", Number(chainId)),
      getAddr("WORMHOLE_RELAYER_ADDRESS", Number(chainId)),
      getAddr("CIRCLE_INTEGRATION", Number(chainId)),
    ],
    log: true,
  });
};

export default deployWormholeBridge;
deployWormholeBridge.tags = ["WormholeBridge"];
