import {  ContractTransaction, ethers, EventFilter } from "ethers";
import { getConfig, Config } from "../config/config";
import { HexString } from "../types/Strings";
import { MissingProvider, MissingSigner, MissingContract } from "../utilities/errors";
import { abi as announcerABI } from "@dsnp/contracts/abi/Announcer.json";
import { Announcer } from "../types/typechain/Announcer";
import { GAS_LIMIT_BUFFER, getContract } from "./contract";

const CONTRACT_NAME = "Announcer";

export interface Announcement {
  dsnpType: number;
  uri: string;
  hash: HexString;
}

/**
 * batch() allows users call the batch smart contract and post the URI and hash
 * of a generated batch to the blockchain.
 *
 * @param announcements array of announcments to batch.
 * @param opts Optional. Configuration overrides, such as from address, if any
 * @returns    A contract receipt promise
 */
export const batch = async (announcements: Announcement[], opts?: Config): Promise<ContractTransaction> => {
  const { provider, signer } = await getConfig(opts);

  if (!signer) throw MissingSigner;
  if (!provider) throw MissingProvider;

  const contract = await getAnnouncerContract(provider);
  if (!contract) throw MissingContract;

  const gasEstimate = await getGasLimit(contract, announcements);
  return contract.connect(signer).batch(announcements, { gasLimit: gasEstimate });
};

export const dsnpBatchFilter = async (provider: ethers.providers.Provider): Promise<EventFilter> => {
  const contract = await getAnnouncerContract(provider);
  return contract.filters.DSNPBatch();
};

/**
 * Goes through logs finding all DNSPBatch events
 * @param provider provider from which to retrieve events
 * @returns All announcements recorded as DSNPBatch events
 */
export const decodeDSNPBatchEvents = async (provider: ethers.providers.Provider): Promise<Announcement[]> => {
  const filter = await dsnpBatchFilter(provider);
  const logs: ethers.providers.Log[] = await provider.getLogs(filter);
  const decoder = new ethers.utils.Interface(announcerABI);
  return logs
    .map((log: ethers.providers.Log) => decoder.parseLog(log))
    .filter((desc) => desc.name === "DSNPBatch")
    .map((desc) => {
      const { dsnpType, dsnpHash, dsnpUri } = desc.args;
      return { dsnpType, hash: dsnpHash, uri: dsnpUri };
    });
};

const getAnnouncerContract = async (provider: ethers.providers.Provider): Promise<Announcer> => {
  return (getContract(provider, CONTRACT_NAME, announcerABI) as unknown) as Announcer;
};

const getGasLimit = async (contract: Announcer, announcements: Announcement[]): Promise<number> => {
  const gasEstimate = await contract.estimateGas.batch(announcements);

  return gasEstimate.toNumber() + GAS_LIMIT_BUFFER;
};
