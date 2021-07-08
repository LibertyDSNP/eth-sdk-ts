import { ConfigOpts } from "./config";
import { createFile } from "./core/batch";
import { DSNPBatchMessage, DSNPMessageSigned } from "./core/batch/batchMessages";
import { Announcement } from "./core/contracts/announcement";
import { DSNPType, DSNPTypedMessage } from "./core/messages";
import { filterIterable, AsyncOrSyncIterable } from "./core/utilities";
import { getRandomString } from "./core/utilities/random";

/**
 * createAnnouncement() takes a DSNP type and an array of messages of the given
 * type, generates a batch file from the messages, stores them and returns an
 * annoucement linking to the file.
 *
 * @param dsnpType - The DSNPType of the messages passed in
 * @param messages - The DSNPBatchMessages to publish
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A promise of the generated annoucement
 */
export const createAnnouncement = async <T extends DSNPType>(
  dsnpType: T,
  messages: AsyncOrSyncIterable<DSNPMessageSigned<DSNPTypedMessage<T>>>,
  opts?: ConfigOpts
): Promise<Announcement> => {
  const filename = getRandomString();

  const { url, hash } = await createFile(filename, dsnpType, messages, opts);

  return {
    dsnpType,
    uri: url.toString(),
    hash,
  };
};

/**
 * createAnnouncements() takes an array of DSNP messages to announce, creates a
 * batch file for each DSNP type in the array, uploads the files and returns an
 * array of Announcements for publishing to the chain.
 *
 * @param messages - The DSNPBatchMessages to publish
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns An array of announcements to post on chain
 */
export const createAnnouncements = async (
  messages: AsyncOrSyncIterable<DSNPBatchMessage>,
  opts?: ConfigOpts
): Promise<Announcement[]> => {
  const announcements: Record<string, Promise<Announcement>> = {};

  for await (const message of messages) {
    const dsnpType = message.dsnpType;

    if (!announcements[dsnpType]) {
      const filteredMessages = filterIterable<DSNPBatchMessage>(messages, (message) => message.dsnpType == dsnpType);

      announcements[dsnpType] = createAnnouncement<DSNPType>(dsnpType, filteredMessages, opts);
    }
  }

  return Promise.all(Object.values(announcements));
};
