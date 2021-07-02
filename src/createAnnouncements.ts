import { ConfigOpts } from "./config";
import { createFile } from "./core/batch";
import { DSNPBatchMessage } from "./core/batch/batchMessages";
import { Announcement } from "./core/contracts/announcement";
import { DSNPType } from "./core/messages";
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
  const messagesByType: { [key in DSNPType]?: DSNPBatchMessage[] } = {};

  for (const message of messages) {
    const dsnpType = message.dsnpType;

    if (!messagesByType[dsnpType]) {
      messagesByType[dsnpType] = [];
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    messagesByType[dsnpType]!.push(message);
  }

  return Promise.all(
    Object.entries(messagesByType).map(
      async ([dsnpTypeString, messages]: [string, Array<DSNPBatchMessage> | undefined]): Promise<Announcement> => {
        const filename = getRandomString();
        const dsnpType = parseInt(dsnpTypeString) as DSNPType;

        const { url, hash } = await createFile(filename, dsnpType, messages as Array<DSNPBatchMessage>, opts);

        return {
          dsnpType,
          uri: url.toString(),
          hash,
        };
      }
    )
  );
};
