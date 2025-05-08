import { wormhole, amount, CircleTransfer, UniversalAddress } from '@wormhole-foundation/sdk';
import evm from '@wormhole-foundation/sdk/evm';
import solana from '@wormhole-foundation/sdk/solana';
import { getSigner } from './wormhole_helpers';
import hre from "hardhat";
import { domain, getAddr } from './constant';

const transfer = async () => {
  const wh = await wormhole('Testnet', [evm, solana]);

  const source = await getSigner(wh.getChain('ArbitrumSepolia'));
  const destination = await getSigner(wh.getChain('Solana'));
  const amt = 1_000_000n;
  const automatic = false;
  const nativeGas = automatic ? amount.units(amount.parse('0.0', 6)) : 0n;

  const xfer = await wh.circleTransfer(
    amt,
    source.address,
    destination.address,
    automatic,
    undefined,
    nativeGas
  );

  const srcTxids = await xfer.initiateTransfer(source.signer);
  console.log(`Started Transfer: `, srcTxids);

  const timeout = 120 * 1000; // Timeout in milliseconds (120 seconds)
  const attestIds = await xfer.fetchAttestation(timeout);
  console.log(`Got Attestation: `, attestIds);

  const dstTxids = await xfer.completeTransfer(destination.signer);
  console.log(`Completed Transfer: `, dstTxids);
};

const hardhatTransfer = async (chainId: number) => {
  const contract = await hre.ethers.getContractAt("ICircleBridge", getAddr("CIRCLE_BRIDGE", chainId));
  const token = await hre.ethers.getContractAt("ERC20", getAddr("USDC_ADDRESS", chainId));
  const wh = await wormhole('Testnet', [evm, solana]);
  const solanaChain = wh.getChain('Solana');

  const amt = 1e5;
  const destination = await getSigner(solanaChain);
  const tx_approve = await token.approve(getAddr("CIRCLE_BRIDGE", chainId), amt);
  await tx_approve.wait();

  const tx = await contract.depositForBurn(
    amt,
    domain[solanaChain.chain],
    (new UniversalAddress('68joAAXUiFjKdEkDGKdUTbftLQvRA1AEtZ6fvWBjNE3U', 'base58')).toUint8Array(),
    getAddr("USDC_ADDRESS", chainId),
    {
      gasLimit: 1e6
    }
  );
  await tx.wait();
  console.log(tx);

  const timeout = 120 * 1000; // Timeout in milliseconds (120 seconds)
  const xfer = await CircleTransfer.from(
		wh,
		{
			chain: 'ArbitrumSepolia',
			txid: tx.hash,
		},
		timeout
	);
  const attestIds = await xfer.fetchAttestation(timeout);
  console.log(`Got Attestation: `, attestIds);

  const dstTxids = await xfer.completeTransfer(destination.signer);
  console.log(`Completed Transfer: `, dstTxids);
}
