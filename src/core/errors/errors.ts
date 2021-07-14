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
 * NotImplementedError indicates that a particular feature is not available in
 * the current version of the SDK. Typically, this means that the given method
 * is planned for a future release but not yet complete.
 */
export class NotImplementedError extends DSNPError {
  constructor() {
    super("This feature is not implemented in the current SDK version.");
  }
}
