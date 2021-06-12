import { ContractTransaction, ethers, EventFilter } from "ethers";
import { ConfigOpts, requireGetProvider, MissingContract, getContracts, requireGetSigner } from "../../config";
import { HexString } from "../../types/Strings";
import { abi as announcerABI } from "@dsnp/contracts/abi/Announcer.json";
import { Announcer, Announcer__factory } from "../../types/typechain";
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
 * @param opts optional configuration
 * @returns All announcements recorded as DSNPBatch events
 */
export const decodeDSNPBatchEvents = async (opts?: ConfigOpts): Promise<Announcement[]> => {
  const provider = requireGetProvider(opts);
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

const getAnnouncerContract = async (opts?: ConfigOpts): Promise<Announcer> => {
  const { announcer } = getContracts(opts);
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);

  const address = announcer || (await getContractAddress(provider, CONTRACT_NAME));

  if (!address) throw MissingContract;
  return Announcer__factory.connect(address, signer);
};
