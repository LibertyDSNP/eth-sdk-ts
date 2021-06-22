import { ContractTransaction, EventFilter } from "ethers";
import { ConfigOpts, requireGetProvider, MissingContract, getContracts, requireGetSigner } from "../../config";
import { HexString } from "../../types/Strings";
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
 * @param announcements - array of announcements to batch.
 * @param opts - Optional. Configuration overrides, such as from address, if any
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

const getAnnouncerContract = async (opts?: ConfigOpts): Promise<Announcer> => {
  const { announcer } = getContracts(opts);
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);

  const address = announcer || (await getContractAddress(provider, CONTRACT_NAME));

  if (!address) throw MissingContract;
  return Announcer__factory.connect(address, signer);
};
