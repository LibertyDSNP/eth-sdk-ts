import { ContractTransaction, EventFilter } from "ethers";
import { ConfigOpts, requireGetProvider, MissingContract, getContracts, requireGetSigner } from "../../config";
import { HexString } from "../../types/Strings";
import { Publisher, Publisher__factory } from "../../types/typechain";
import { getContractAddress } from "./contract";

const CONTRACT_NAME = "Publisher";

export interface Publication {
  dsnpType: number;
  url: string;
  hash: HexString;
}

/**
 * publish() calls the publisher smart contract and publishes the URLs and hashes
 * of a generated batch publications to the blockchain.
 *
 * @param publications - array of publications to publish.
 * @returns A contract receipt promise
 */
export const publish = async (publications: Publication[]): Promise<ContractTransaction> => {
  const contract = await getPublisherContract();
  return contract.publish(publications);
};

/**
 * Retrieves event filter for DSNPBatch event
 *
 * @returns DSNPBatch event filter
 */
export const dsnpBatchFilter = async (): Promise<EventFilter> => {
  const contract = await getPublisherContract();
  return contract.filters.DSNPBatchPublication();
};

const getPublisherContract = async (opts?: ConfigOpts): Promise<Publisher> => {
  const { publisher } = getContracts(opts);
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);

  const address = publisher || (await getContractAddress(provider, CONTRACT_NAME));

  if (!address) throw MissingContract;
  return Publisher__factory.connect(address, signer);
};
