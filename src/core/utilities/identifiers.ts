/**
 * DSNPId represents a DSNP message id following the DSNP
 * [Message Identifiers](https://github.com/LibertyDSNP/spec/blob/main/pages/Messages/Identifiers.md)
 * specification.
 */
export type DSNPId = string;

/**
 * DSNPUserId represents a DSNP user id following the DSNP
 * [Message Identifiers](https://github.com/LibertyDSNP/spec/blob/main/pages/Messages/Identifiers.md)
 * specification.
 */
export type DSNPUserId = string;

/**
 * validateDSNPId validates a given string as a DSNPId. If the given string is
 * valid, true is returned. Otherwise, false is returned.
 *
 * @param id The string to validate
 * @returns  True of false depending on whether the string is a valid DSNPId
 */
export const validateDSNPId = (id: string): id is DSNPId => id.match(/dsnp:\/\/[0-9A-F]{16}\/[0-9A-F]{64}/i) !== null;
