import { ConfigOpts } from "./config";
import { createFile, EmptyBatchError } from "./core/batch";
import { filterIterable, AsyncOrSyncIterable } from "./core/utilities";
import { Publication } from "./core/contracts/publisher";
import { getRandomString } from "./core/utilities/random";
import { AnnouncementWithSignature, DSNPType, SignedAnnouncement, TypedAnnouncement } from "./core/announcements";

/**
 * createPublication() takes a DSNP type and an array of announcements of the given
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
export const createPublication = async <T extends DSNPType>(
  announcements: AsyncOrSyncIterable<AnnouncementWithSignature<TypedAnnouncement<T>>>,
  opts?: ConfigOpts
): Promise<Publication> => {
  const filename = getRandomString();
  const { url, hash } = await createFile(filename, announcements, opts);
  let dsnpType;

  for await (const announcement of announcements) {
    dsnpType = announcement.dsnpType;
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
 * createPublications() takes an array of announcements to publish, creates a
 * batch file for each DSNP type in the array, uploads the files and returns an
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
    const dsnpType = announcement.dsnpType;

    if (publications[dsnpType] === undefined) {
      const filteredIterables = filterIterable<SignedAnnouncement>(
        announcements,
        (announcement) => announcement.dsnpType == dsnpType
      );

      publications[dsnpType] = createPublication<DSNPType>(filteredIterables, opts);
    }
  }

  return Promise.all(Object.values(publications));
};
