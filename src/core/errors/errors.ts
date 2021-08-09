/**
 * DSNPError is a base class for other errors in the DSNP SDK. All errors thrown
 * extending this class can be assumed to have originated in the DSNP SDK, not
 * in any underlying adapters or higher level client code.
 */
export class DSNPError extends Error {
  constructor(message: string) {
    super(`DSNPError: ${message}`);
    this.name = this.constructor.name;
  }
}

/**
 * InvalidHexadecimalSerialization indicates an attempt to coerce a string to hexadecimal serialization failed.
 */
export class InvalidHexadecimalSerialization extends DSNPError {
  outcomeValue: string;
  originalValue: unknown;

  constructor(originalValue: unknown, outcomeValue: string) {
    super(`Invalid Hexadecimal Serialization: ${outcomeValue}`);
    this.outcomeValue = outcomeValue;
    this.originalValue = originalValue;
  }
}
