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
