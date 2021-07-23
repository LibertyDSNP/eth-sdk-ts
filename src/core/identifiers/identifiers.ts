import { BigNumber } from "ethers";

import { isString } from "../utilities/validation";
import { HexString } from "../../types/Strings";

/**
 * DSNPAnnouncementUri represents a DSNP Announcement Uri following the DSNP
 * [Identifiers](https://github.com/LibertyDSNP/spec/blob/main/pages/Identifiers.md)
 * specification.
 */
export type DSNPAnnouncementUri = string;

/**
 * isDSNPAnnouncementUri() validates a given string as a DSNPAnnouncementUri.
 *
 * @param id - The object to validate
 * @returns True of false depending on whether the string is a valid DSNPAnnouncementUri
 */
export const isDSNPAnnouncementUri = (id: unknown): id is DSNPAnnouncementUri => {
  if (!isString(id)) return false;
  return id.match(/^dsnp:\/\/0x[0-9A-F]{1,16}\/0x[0-9A-F]{64}$/i) !== null;
};

/**
 * DSNPUserId represents a DSNP user id following the DSNP
 * [Identifiers](https://github.com/LibertyDSNP/spec/blob/main/pages/Identifiers.md)
 * specification.
 */
export type DSNPUserId = string;

/**
 * DSNPUserUri represents a URI targeting a user following the DSNP
 * [Identifiers](https://github.com/LibertyDSNP/spec/blob/main/pages/Identifiers.md)
 * specification.
 */
export type DSNPUserUri = string;

/**
 * isDSNPUserId validates a given object as a DSNPUserId.
 *
 * @param id - The object to validate
 * @returns True of false depending on whether the string is a valid DSNPUserId
 */
export const isDSNPUserId = (id: unknown): id is DSNPUserId => {
  if (!isString(id)) return false;
  return id.match(/^0x[0-9A-F]{1,16}$/i) !== null;
};

/**
 * isDSNPUserUri validates a given object as a DSNPUserUri.
 *
 * @param uri - The object to validate
 * @returns True of false depending on whether the string is a valid DSNPUserUri
 */
export const isDSNPUserUri = (uri: unknown): uri is DSNPUserUri => {
  if (!isString(uri)) return false;
  return uri.match(/^0x[0-9A-F]{1,16}$/i) !== null;
};

/**
 * convertBigNumberToDSNPUserId() converts ethers' ridiculous BigNumber implementation
 * hex output to a proper DSNP user id with zero padding.
 *
 * @param num - The number to convert
 * @returns The same number as a properly formatted DSNPUserId
 */
export const convertBigNumberToDSNPUserId = (num: BigNumber): DSNPUserId => {
  const hex = num.toHexString().replace("0x", "");

  return `0x${hex}`;
};

/**
 * convertDSNPUserIdToBigNumber() converts DSNP user ids to ethers BigNumbers.
 *
 * @param userIdOrUri - The DSNP user id or uri to convert
 * @returns A big number representation of the same id
 */
export const convertDSNPUserIdToBigNumber = (userIdOrUri: DSNPUserId | DSNPUserUri): BigNumber => {
  // Support DSNP User URI
  const hex = userIdOrUri.replace("dsnp://", "");
  return BigNumber.from(hex);
};

/**
 * buildDSNPAnnouncementUri() takes a DSNP user id or uri and a content hash and returns
 * a DSNP Announcement Uri.
 *
 * @param userIdOrUri - The DSNP user id or uri of the announcing user
 * @param contentHash - The content hash of the announcement posted by the user
 * @returns A DSNP Announcement Uri for the given announcement
 */
export const buildDSNPAnnouncementUri = (
  userIdOrUri: DSNPUserId | DSNPUserUri,
  contentHash: HexString
): DSNPAnnouncementUri => {
  const userId = userIdOrUri.replace("dsnp://", "");
  return `dsnp://${userId}/${contentHash}`;
};

/**
 * parseDSNPAnnouncementUri() takes a DSNP Announcement Uri and returns the userId and contentHash.
 *
 * @param announcementUri - A DSNP Announcement Id
 * @returns the userId and contentHash from the Announcement Uri
 */
export const parseDSNPAnnouncementUri = (
  announcementUri: DSNPAnnouncementUri
): { userId: DSNPUserId; contentHash: HexString } => {
  const [userId, contentHash] = announcementUri.replace("dsnp://", "").split("/");
  return { userId, contentHash };
};
