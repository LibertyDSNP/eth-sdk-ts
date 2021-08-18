import { isBigInt, isString } from "../utilities/validation";
import { HexString } from "../../types/Strings";
import { BigNumber } from "ethers";

const DSNP_SCHEMA_REGEX = /^dsnp:\/\//i;

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
  return id.match(/^dsnp:\/\/[0-9]{1,20}\/0x[0-9a-f]{64}$/) !== null;
};

/**
 * DSNPUserId represents a DSNP user id following the DSNP
 * [Identifiers](https://github.com/LibertyDSNP/spec/blob/main/pages/Identifiers.md)
 * specification.
 */
export type DSNPUserId = bigint;

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
export const isDSNPUserId = (id: unknown): id is DSNPUserId => isBigInt(id);

/**
 * isDSNPUserURI validates a given object as a DSNPUserURI.
 *
 * @param uri - The object to validate
 * @returns True of false depending on whether the string is a valid DSNPUserURI
 */
export const isDSNPUserURI = (uri: unknown): uri is DSNPUserURI => {
  if (!isString(uri)) return false;
  return uri.match(/^dsnp:\/\/[0-9]{1,20}$/) !== null;
};

/**
 * convertToDSNPUserId() converts just about any valid DSNP User URI, BigNumber,
 * hex string, etc... to a proper DSNP User Id.
 *
 * @param value - The unknown value to parse to a DSNP User Id
 * @returns The same value as a properly formatted DSNPUserId
 */
export const convertToDSNPUserId = (value: unknown): DSNPUserId => {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (BigNumber.isBigNumber(value)) value.toBigInt();

  if (typeof value === "string") {
    if (isDSNPUserURI(value)) {
      return BigInt(value.replace(DSNP_SCHEMA_REGEX, ""));
    }
    return BigInt(value);
  }
  // Cast or throw?
  return BigInt(String(value));
};

/**
 * convertToDSNPUserURI() converts just about any valid DSNP User id, BigNumber,
 * hex string, etc... to a proper DSNP User URI.
 *
 * @param value - The string
 * @returns The same value as a properly formatted DSNPUserURI
 */
export const convertToDSNPUserURI = (value: unknown): DSNPUserURI => {
  return `dsnp://${convertToDSNPUserId(value)}`;
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
  return `dsnp://${convertToDSNPUserId(userIdOrUri)}/${contentHash}`;
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
  return { userId: BigInt(userId), contentHash };
};
