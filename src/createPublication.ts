import { ConfigOpts } from "./config";
import { createFile, EmptyBatchError } from "./core/batch";
import { DSNPBatchMessage, DSNPMessageSigned } from "./core/batch/batchMessages";
import { Publication } from "./core/contracts/publisher";
import { DSNPType, DSNPTypedMessage } from "./core/messages";
import { filterIterable, AsyncOrSyncIterable } from "./core/utilities";
import { getRandomString } from "./core/utilities/random";

/**
 * createPublication() takes a DSNP type and an array of messages of the given
 * type, generates a batch file from the messages, stores them and returns an
 * annoucement linking to the file.
 *
 * @throws {@link MissingStoreConfigError}
 * Thrown if the store is not configured.
 * @throws {@link EmptyBatchError}
 * Thrown if the message iterator provided is empty.
 * @throws {@link MixedTypeBatchError}
 * Thrown if the message iterator provided contains multiple DSNP message types.
 * @param messages - The DSNPBatchMessages to publish
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A promise of the generated publication
 */
export const createPublication = async <T extends DSNPType>(
  messages: AsyncOrSyncIterable<DSNPMessageSigned<DSNPTypedMessage<T>>>,
  opts?: ConfigOpts
): Promise<Publication> => {
  const filename = getRandomString();
  const { url, hash } = await createFile(filename, messages, opts);
  let dsnpType;

  for await (const message of messages) {
    dsnpType = message.dsnpType;
    break;
  }

  if (dsnpType === undefined) throw new EmptyBatchError();

  return {
    dsnpType,
    url: url.toString(),
    hash,
  };
};

/**
 * createPublications() takes an array of DSNP messages to announce, creates a
 * batch file for each DSNP type in the array, uploads the files and returns an
 * array of Publications for publishing to the chain.
 *
 * @throws {@link MissingStoreConfigError}
 * Thrown if the store is not configured.
 * @throws {@link EmptyBatchError}
 * Thrown if the message iterator provided is empty.
 * @param messages - The DSNPBatchMessages to publish
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns An array of publications to post on chain
 */
export const createPublications = async (
  messages: AsyncOrSyncIterable<DSNPBatchMessage>,
  opts?: ConfigOpts
): Promise<Publication[]> => {
  const publications: Record<string, Promise<Publication>> = {};

  for await (const message of messages) {
    const dsnpType = message.dsnpType;

    if (publications[dsnpType] === undefined) {
      const filteredMessageIterables = filterIterable<DSNPBatchMessage>(
        messages,
        (message) => message.dsnpType == dsnpType
      );

      publications[dsnpType] = createPublication<DSNPType>(filteredMessageIterables, opts);
    }
  }

  return Promise.all(Object.values(publications));
};
