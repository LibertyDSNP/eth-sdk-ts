import { BigNumber } from "ethers";

import { isString } from "../utilities/validation";

/**
 * DSNPAnnouncementId represents a DSNP Announcement Id following the DSNP
 * [Message Identifiers](https://github.com/LibertyDSNP/spec/blob/main/pages/Messages/Identifiers.md)
 * specification.
 */
export type DSNPAnnouncementId = string;

/**
 * isDSNPAnnouncementId() validates a given string as a DSNPAnnouncementId.
 *
 * @param id - The object to validate
 * @returns True of false depending on whether the string is a valid DSNPAnnouncementId
 */
export const isDSNPAnnouncementId = (id: unknown): id is DSNPAnnouncementId => {
  if (!isString(id)) return false;
  return id.match(/^dsnp:\/\/[0-9A-F]{16}\/[0-9A-F]{64}$/i) !== null;
};

/**
 * DSNPUserId represents a DSNP user id following the DSNP
 * [Message Identifiers](https://github.com/LibertyDSNP/spec/blob/main/pages/Messages/Identifiers.md)
 * specification.
 */
export type DSNPUserId = string;

/**
 * isDSNPUserId validates a given object as a DSNPUserId.
 *
 * @param id - The object to validate
 * @returns True of false depending on whether the string is a valid DSNPUserId
 */
export const isDSNPUserId = (id: unknown): id is DSNPUserId => {
  if (!isString(id)) return false;
  return id.match(/^dsnp:\/\/[0-9A-F]{16}$/i) !== null;
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
  const paddingLength = 16 - hex.length;
  const padding = Array(paddingLength + 1).join("0");

  return `dsnp://${padding}${hex}`;
};

/**
 * convertDSNPUserIdToBigNumber() converts DSNP user ids to ethers BigNumbers.
 *
 * @param dsnpUserId - The DSNP user id to convert
 * @returns A big number representation of the same id
 */
export const convertDSNPUserIdToBigNumber = (dsnpUserId: DSNPUserId): BigNumber => {
  const hex = dsnpUserId.replace("dsnp://", "0x");
  return BigNumber.from(hex);
};
