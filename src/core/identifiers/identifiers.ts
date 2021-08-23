import { BigNumber } from "ethers";
import { isString } from "../utilities/validation";
import { HexString } from "../../types/Strings";
import { serializeToHex } from "../announcements";

/**
 * DSNPAnnouncementURI represents a DSNP Announcement Uri following the DSNP
 * [Identifiers](https://github.com/LibertyDSNP/spec/blob/main/pages/Identifiers.md)
 * specification.
 */
export type DSNPAnnouncementURI = string;

/**
 * isDSNPAnnouncementURI() validates a given string as a DSNPAnnouncementURI.
 *
 * @param id - The object to validate
 * @returns True of false depending on whether the string is a valid DSNPAnnouncementURI
 */
export const isDSNPAnnouncementURI = (id: unknown): id is DSNPAnnouncementURI => {
  if (!isString(id)) return false;
  return id.match(/^dsnp:\/\/0x[1-9a-f][0-9a-f]{0,15}\/0x[1-9a-f][0-9a-f]{0,63}$/) !== null;
};

/**
 * DSNPUserId represents a DSNP user id following the DSNP
 * [Identifiers](https://github.com/LibertyDSNP/spec/blob/main/pages/Identifiers.md)
 * specification.
 */
export type DSNPUserId = string;

/**
 * DSNPUserURI represents a URI targeting a user following the DSNP
 * [Identifiers](https://github.com/LibertyDSNP/spec/blob/main/pages/Identifiers.md)
 * specification.
 */
export type DSNPUserURI = string;

/**
 * isDSNPUserId validates a given object as a DSNPUserId.
 *
 * @param id - The object to validate
 * @returns True of false depending on whether the string is a valid DSNPUserId
 */
export const isDSNPUserId = (id: unknown): id is DSNPUserId => {
  if (!isString(id)) return false;
  return id.match(/^0x[1-9a-f][0-9a-f]{0,15}$/) !== null;
};

/**
 * isDSNPUserURI validates a given object as a DSNPUserURI.
 *
 * @param uri - The object to validate
 * @returns True of false depending on whether the string is a valid DSNPUserURI
 */
export const isDSNPUserURI = (uri: unknown): uri is DSNPUserURI => {
  if (!isString(uri)) return false;
  return uri.match(/^dsnp:\/\/0x[1-9a-f][0-9a-f]{0,15}$/) !== null;
};

/**
 * convertBigNumberToDSNPUserId() converts ethers' ridiculous BigNumber
 * implementation hex output to a proper DSNP user id.
 *
 * @param num - The number to convert
 * @returns The same number as a properly formatted DSNPUserId
 */
export const convertBigNumberToDSNPUserId = (num: BigNumber): DSNPUserId => serializeToHex(num);

/**
 * convertDSNPUserIdOrURIToBigNumber() convert a DSNP user id or URI to an
 * ethers BigNumber.
 *
 * @param userIdOrUri - The DSNP user id or URI to convert
 * @returns A big number representation of the same id
 */
export const convertDSNPUserIdOrURIToBigNumber = (userIdOrUri: DSNPUserId | DSNPUserURI): BigNumber => {
  return BigNumber.from(serializeToHex(userIdOrUri));
};

/**
 * convertDSNPUserURIToDSNPUserId() converts a DSNP user URI to a DSNP user id.
 *
 * @param userURI - The DSNPUserURI to convert
 * @returns The DSNPUserId of the user
 */
export const convertDSNPUserURIToDSNPUserId = (userURI: DSNPUserURI): DSNPUserId => {
  return serializeToHex(userURI);
};

/**
 * convertBigNumberToDSNPUserURI() converts ethers' ridiculous BigNumber
 * implementation hex output to a proper DSNP user URI.
 *
 * @param num - The number to convert
 * @returns The same number as a properly formatted DSNPUserURI
 */
export const convertBigNumberToDSNPUserURI = (num: BigNumber): DSNPUserURI => {
  return `dsnp://${serializeToHex(num)}`;
};

/**
 * buildDSNPAnnouncementURI() takes a DSNP user id or URI and a content hash and
 * returns a DSNP Announcement Uri.
 *
 * @param userIdOrUri - The DSNP user id or URI of the announcing user
 * @param contentHash - The content hash of the announcement posted by the user
 * @returns A DSNP Announcement Uri for the given announcement
 */
export const buildDSNPAnnouncementURI = (
  userIdOrUri: DSNPUserId | DSNPUserURI,
  contentHash: HexString
): DSNPAnnouncementURI => {
  return `dsnp://${serializeToHex(userIdOrUri)}/${serializeToHex(contentHash)}`;
};

/**
 * parseDSNPAnnouncementURI() takes a DSNP Announcement Uri and returns the
 * userId and contentHash.
 *
 * @param announcementUri - A DSNP Announcement Id
 * @returns the userId and contentHash from the Announcement Uri
 */
export const parseDSNPAnnouncementURI = (
  announcementUri: DSNPAnnouncementURI
): { userId: DSNPUserId; contentHash: HexString } => {
  const [userId, contentHash] = announcementUri.replace("dsnp://", "").split("/");
  return { userId, contentHash };
};
