import { BigNumber } from "ethers";

import { isString } from "../utilities/validation";
import { HexString } from "../../types/Strings";

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
  return id.match(/^dsnp:\/\/0x[0-9A-F]{1,16}\/0x[0-9A-F]{64}$/i) !== null;
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
  return id.match(/^0x[0-9A-F]{1,16}$/i) !== null;
};

/**
 * isDSNPUserURI validates a given object as a DSNPUserURI.
 *
 * @param uri - The object to validate
 * @returns True of false depending on whether the string is a valid DSNPUserURI
 */
export const isDSNPUserURI = (uri: unknown): uri is DSNPUserURI => {
  if (!isString(uri)) return false;
  return uri.match(/^dsnp:\/\/0x[0-9A-F]{1,16}$/i) !== null;
};

/**
 * convertBigNumberToDSNPUserId() converts ethers' ridiculous BigNumber
 * implementation hex output to a proper DSNP user id.
 *
 * @param num - The number to convert
 * @returns The same number as a properly formatted DSNPUserId
 */
export const convertBigNumberToDSNPUserId = (num: BigNumber): DSNPUserId => num.toHexString();

/**
 * convertDSNPUserIdOrURIToBigNumber() convert a DSNP user id or URI to an
 * ethers BigNumber.
 *
 * @param userIdOrUri - The DSNP user id or URI to convert
 * @returns A big number representation of the same id
 */
export const convertDSNPUserIdOrURIToBigNumber = (userIdOrUri: DSNPUserId | DSNPUserURI): BigNumber => {
  // Support DSNP User URI
  const hex = userIdOrUri.replace("dsnp://", "");
  return BigNumber.from(hex);
};

/**
 * convertDSNPUserURIToDSNPUserId() converts a DSNP user URI to a DSNP user id.
 *
 * @param userURI - The DSNPUserURI to convert
 * @returns The DSNPUserId of the user
 */
export const convertDSNPUserURIToDSNPUserId = (userURI: DSNPUserURI): DSNPUserId =>
  userURI.replace(/dsnp:\/\/0x0+/, "0x0");

/**
 * convertBigNumberToDSNPUserURI() converts ethers' ridiculous BigNumber
 * implementation hex output to a proper DSNP user URI with zero padding.
 *
 * @param num - The number to convert
 * @returns The same number as a properly formatted DSNPUserURI
 */
export const convertBigNumberToDSNPUserURI = (num: BigNumber): DSNPUserURI => {
  const hex = num.toHexString().replace("0x", "");
  const paddingLength = 16 - hex.length;
  const padding = Array(paddingLength + 1).join("0");

  return `dsnp://0x${padding}${hex}`;
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
  const bigNumber = convertDSNPUserIdOrURIToBigNumber(userIdOrUri);
  const userURI = convertBigNumberToDSNPUserURI(bigNumber);
  return `${userURI}/${contentHash}`;
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
