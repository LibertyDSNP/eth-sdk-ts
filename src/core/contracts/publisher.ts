import { ContractTransaction, EventFilter } from "ethers";
import { ConfigOpts, requireGetProvider, requireGetSigner } from "../../config";
import { HexString } from "../../types/Strings";
import { Publisher, Publisher__factory } from "../../types/typechain";
import { getContractAddress } from "./contract";

const CONTRACT_NAME = "Publisher";

export interface Publication {
  announcementType: number;
  fileUrl: string;
  fileHash: HexString;
}

/**
 * publish() calls the publisher smart contract and publishes the URLs and hashes
 * of a generated batch publications to the blockchain.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the batch contract address cannot be found.
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
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the batch contract address cannot be found.
 * @returns DSNPBatch event filter
 */
export const dsnpBatchFilter = async (): Promise<EventFilter> => {
  const contract = await getPublisherContract();
  return contract.filters.DSNPBatchPublication();
};

const getPublisherContract = async (opts?: ConfigOpts): Promise<Publisher> => {
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);
  const address = await getContractAddress(provider, CONTRACT_NAME, opts);

  return Publisher__factory.connect(address, signer);
};
