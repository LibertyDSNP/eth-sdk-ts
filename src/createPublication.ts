import { ConfigOpts } from "./config";
import {
  AnnouncementWithSignature,
  AnnouncementType,
  SignedAnnouncement,
  TypedAnnouncement,
} from "./core/announcements";
import { createFile, EmptyBatchError } from "./core/batch";
import { Publication } from "./core/contracts/publisher";
import { filterIterable, AsyncOrSyncIterable } from "./core/utilities";
import { getRandomString } from "./core/utilities/random";

/**
 * createPublication() takes an Announcement type and an array of announcements of the given
 * type, generates a batch file from the announcements, stores them and returns an
 * publication linking to the file.
 *
 * @throws {@link MissingStoreConfigError}
 * Thrown if the store is not configured.
 * @throws {@link EmptyBatchError}
 * Thrown if the announcement iterator provided is empty.
 * @throws {@link MixedTypeBatchError}
 * Thrown if the announcement iterator provided contains multiple DSNP announcement types.
 * @param announcements - The Signed Announcements to publish
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A promise of the generated publication
 */
export const createPublication = async <T extends AnnouncementType>(
  announcements: AsyncOrSyncIterable<AnnouncementWithSignature<TypedAnnouncement<T>>>,
  opts?: ConfigOpts
): Promise<Publication> => {
  const filename = getRandomString();
  const { url, hash } = await createFile(filename, announcements, opts);
  let announcementType;

  for await (const announcement of announcements) {
    announcementType = announcement.announcementType;
    break;
  }

  if (announcementType === undefined) throw new EmptyBatchError();

  return {
    announcementType,
    fileUrl: url.toString(),
    fileHash: hash,
  };
};

/**
 * createPublications() takes an array of announcements to publish, creates a
 * batch file for each Announcement type in the array, uploads the files and returns an
 * array of Publications for publishing to the chain.
 *
 * @throws {@link MissingStoreConfigError}
 * Thrown if the store is not configured.
 * @throws {@link EmptyBatchError}
 * Thrown if the announcement iterator provided is empty.
 * @param announcements - The Signed Announcements to publish
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns An array of publications to post on chain
 */
export const createPublications = async (
  announcements: AsyncOrSyncIterable<SignedAnnouncement>,
  opts?: ConfigOpts
): Promise<Publication[]> => {
  const publications: Record<string, Promise<Publication>> = {};

  for await (const announcement of announcements) {
    const announcementType = announcement.announcementType;

    if (publications[announcementType] === undefined) {
      const filteredIterables = filterIterable<SignedAnnouncement>(
        announcements,
        (announcement) => announcement.announcementType == announcementType
      );

      publications[announcementType] = createPublication<AnnouncementType>(filteredIterables, opts);
    }
  }

  return Promise.all(Object.values(publications));
};
