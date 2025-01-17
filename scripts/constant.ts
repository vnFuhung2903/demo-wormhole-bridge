import { ZeroAddress } from "ethers";

export const listAddr = {
  [11155111]: {
    WORMHOLE_CORE_ADDRESS: "0x4a8bc80Ed5a4067f1CCf107057b8270E0cC11A78",
    TOKEN_BRIDGE_ADDRESS: "0xDB5492265f6038831E89f495670FF909aDe94bd9",
    WORMHOLE_RELAYER_ADDRESS: "0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470",
    CIRCLE_INTEGRATION: "0x2703483B1a5a7c577e8680de9Df8Be03c6f30e3c",
  },
  [84532]: {
    WORMHOLE_CORE_ADDRESS: "0x79A1027a6A159502049F10906D333EC57E95F083",
    TOKEN_BRIDGE_ADDRESS: "0x86F55A04690fd7815A3D802bD587e83eA888B239",
    WORMHOLE_RELAYER_ADDRESS: "0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE",
    CIRCLE_INTEGRATION: "0x2703483B1a5a7c577e8680de9Df8Be03c6f30e3c",
  },
  [421614]: {
    WORMHOLE_CORE_ADDRESS: "0x6b9C8671cdDC8dEab9c719bB87cBd3e782bA6a35",
    TOKEN_BRIDGE_ADDRESS: "0xC7A204bDBFe983FCD8d8E61D02b475D4073fF97e",
    WORMHOLE_RELAYER_ADDRESS: "0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470",
    CIRCLE_INTEGRATION: "0x2703483B1a5a7c577e8680de9Df8Be03c6f30e3c",
  },
  [97]: {
    WORMHOLE_CORE_ADDRESS: "0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D",
    TOKEN_BRIDGE_ADDRESS: "0x9dcF9D205C9De35334D646BeE44b2D2859712A09",
    WORMHOLE_RELAYER_ADDRESS: "0x80aC94316391752A193C1c47E27D382b507c93F3",
    CIRCLE_INTEGRATION: ZeroAddress,
  },
  [43113]: {
    WORMHOLE_CORE_ADDRESS: "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C",
    TOKEN_BRIDGE_ADDRESS: "0x61E44E506Ca5659E6c0bba9b678586fA2d729756",
    WORMHOLE_RELAYER_ADDRESS: "0xA3cF45939bD6260bcFe3D66bc73d60f19e49a8BB",
    CIRCLE_INTEGRATION: "0x58f4c17449c90665891c42e14d34aae7a26a472e",
  },
};

/**
 *
 * @param name
 * @param chainId
 */
export const getAddr = (
  name: string,
  chainId: number
): string => {
  const addresses = listAddr[chainId as ChainId];
  return addresses[name as keyof typeof addresses]!;
};

export type ChainId = keyof typeof listAddr;