import Web3 from "web3";
import { MissingContract } from "../utilities/errors";
import { AbiItem } from "web3-utils";

import { getConfig, Config } from "../config/config";
import { HexString } from "../types/Strings";
import { MissingAccountAddress, MissingProvider } from "../utilities/errors";
import { hashPrefix } from "../utilities/hash";
import { TransactionReceipt } from "web3-core/types";
import { getContractAddress } from "../contract/contract";
import { abi as announcerABI } from "@unfinishedlabs/contracts/abi/Announcer.json";
import { Announcer } from "../types/typechain/Announcer";

const GAS_LIMIT_BUFFER = 1000;
const contract: Announcer | null = null;
const CONTRACT_NAME = "Announcer";

const getContract = async (web3Instance: Web3): Promise<Announcer | null> => {
  if (contract) return contract;
  const contractAddr = await getContractAddress(web3Instance, CONTRACT_NAME);
  if (!contractAddr) return null;
  return (new web3Instance.eth.Contract(announcerABI as AbiItem[], contractAddr) as any) as Announcer;
};

const getGasLimit = async (contract: Announcer, uri: string, hash: HexString, fromAddress: string): Promise<number> => {
  const gasEstimate = await contract.methods.batch(hashPrefix(hash), uri).estimateGas({
    from: fromAddress,
  });

  return gasEstimate + GAS_LIMIT_BUFFER;
};

/**
 * batch() allows users call the batch smart contract and post the URI and hash
 * of a generated batch to the blockchain.
 *
 * @param uri  The URI of the hosted batch to post
 * @param hash A hash of the batch contents for use in verification
 * @param opts Optional. Configuration overrides, such as from address, if any
 * @returns    A [web3 contract receipt promise](https://web3js.readthedocs.io/en/v1.3.4/web3-eth-contract.html#id36)
 */
export const batch = async (uri: string, hash: HexString, opts?: Config): Promise<TransactionReceipt> => {
  const { accountAddress, provider } = await getConfig(opts);

  if (!accountAddress) throw MissingAccountAddress;
  if (!provider) throw MissingProvider;

  const contract = await getContract(provider);
  if (!contract) throw MissingContract;

  const gasEstimate = await getGasLimit(contract, uri, hash, accountAddress);
  return contract.methods.batch(hashPrefix(hash), uri).send({
    from: accountAddress,
    gas: gasEstimate,
  });
};
