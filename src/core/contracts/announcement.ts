import { ContractTransaction, ethers, EventFilter } from "ethers";
import { getConfig } from "config";
import { HexString } from "types/Strings";
import { MissingProvider, MissingSigner, MissingContract } from "core/utilities/errors";
import { abi as announcerABI } from "@dsnp/contracts/abi/Announcer.json";
import { Announcer, Announcer__factory } from "types/typechain";
import { getContractAddress } from "./contract";

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
export const batch = async (announcements: Announcement[]): Promise<ContractTransaction> => {
  const contract = await getAnnouncerContract();
  return contract.batch(announcements);
};

/**
 * Retrieves event filter for DSNPBatch event
 * @returns DSNPBatch event filter
 */
export const dsnpBatchFilter = async (): Promise<EventFilter> => {
  const contract = await getAnnouncerContract();
  return contract.filters.DSNPBatch();
};

/**
 * Goes through logs finding all DNSPBatch events
 * @param provider provider from which to retrieve events
 * @returns All announcements recorded as DSNPBatch events
 */
export const decodeDSNPBatchEvents = async (): Promise<Announcement[]> => {
  const { provider } = getConfig();
  if (!provider) throw MissingProvider;

  const filter = await dsnpBatchFilter();
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

const getAnnouncerContract = async (): Promise<Announcer> => {
  const {
    signer,
    provider,
    contracts: { announcer },
  } = await getConfig();
  if (!signer) throw MissingSigner;
  if (!provider) throw MissingProvider;

  const address = announcer || (await getContractAddress(provider, CONTRACT_NAME));

  if (!address) throw MissingContract;
  return Announcer__factory.connect(address, signer);
};