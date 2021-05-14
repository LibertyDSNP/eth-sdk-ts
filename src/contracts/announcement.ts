import Web3 from "web3";
import { MissingContract } from "../utilities/errors";
import { AbiItem } from "web3-utils";

import { getConfig, Config } from "../config/config";
import { HexString } from "../types/Strings";
import { MissingAccountAddress, MissingProvider } from "../utilities/errors";
import { hashPrefix } from "../utilities/hash";
import { TransactionReceipt } from "web3-core/types";
import { getContractAddress } from "./contract";
import { abi as announcerABI } from "@dsnp/contracts/abi/Announcer.json";
import { Announcer } from "../types/typechain/Announcer";

const GAS_LIMIT_BUFFER = 1000;
const contract: Announcer | null = null;
const CONTRACT_NAME = "Announcer";

export interface Announcement {
  dsnpType: number;
  uri: string;
  hash: HexString;
}

const annoucementsAsArrays = (announcements: Announcement[]): Array<[number, string, HexString]> =>
  announcements.map(({ dsnpType, uri, hash }) => [dsnpType, uri, hashPrefix(hash)]);

const getContract = async (web3Instance: Web3): Promise<Announcer | null> => {
  if (contract) return contract;
  const contractAddr = await getContractAddress(web3Instance, CONTRACT_NAME);
  if (!contractAddr) return null;
  return (new web3Instance.eth.Contract(announcerABI as AbiItem[], contractAddr) as unknown) as Announcer;
};

const getGasLimit = async (
  contract: Announcer,
  announcements: Announcement[],
  fromAddress: string
): Promise<number> => {
  const gasEstimate = await contract.methods.batch(annoucementsAsArrays(announcements)).estimateGas({
    from: fromAddress,
  });

  return gasEstimate + GAS_LIMIT_BUFFER;
};

/**
 * batch() allows users call the batch smart contract and post the URI and hash
 * of a generated batch to the blockchain.
 *
 * @param announcement[] a list of announcements
 * @param opts Optional. Configuration overrides, such as from address, if any
 * @returns    A [web3 contract receipt promise](https://web3js.readthedocs.io/en/v1.3.4/web3-eth-contract.html#id36)
 */
export const batch = async (announcements: Announcement[], opts?: Config): Promise<TransactionReceipt> => {
  const { accountAddress, provider } = await getConfig(opts);

  if (!accountAddress) throw MissingAccountAddress;
  if (!provider) throw MissingProvider;

  const contract = await getContract(provider);
  if (!contract) throw MissingContract;

  const gasEstimate = await getGasLimit(contract, announcements, accountAddress);
  return contract.methods.batch(annoucementsAsArrays(announcements)).send({
    from: accountAddress,
    gas: gasEstimate,
  });
};
