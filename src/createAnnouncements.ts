import { ConfigOpts } from "./config";
import { createFile } from "./core/batch";
import { DSNPBatchMessage } from "./core/batch/batchMessages";
import { Announcement } from "./core/contracts/announcement";
import { getRandomString } from "./core/utilities";

/**
 * createAnnouncements takes an array of DSNP messages to announce, creates a
 * batch file for each DSNP type in the array, uploads the files and returns an
 * array of Announcements for publishing to the chain.
 *
 * @param messages - The DSNPBatchMessage to publish
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns An array of announcements to post on chain
 */
export const createAnnouncements = async (
  messages: Iterable<DSNPBatchMessage>,
  opts?: ConfigOpts
): Promise<Announcement[]> => {
  const messagesByType: Record<string, DSNPBatchMessage[]> = {};

  for (const message of messages) {
    const dsnpType = message.dsnpType;

    if (!messagesByType[dsnpType]) {
      messagesByType[dsnpType] = [];
    }

    messagesByType[dsnpType].push(message);
  }

  return Promise.all(
    Object.keys(messagesByType).map(
      async (dsnpType: string): Promise<Announcement> => {
        const filename = getRandomString();

        const { url, hash } = await createFile(filename, messagesByType[dsnpType], opts);

        return {
          dsnpType: parseInt(dsnpType),
          uri: url.toString(),
          hash,
        };
      }
    )
  );
};
