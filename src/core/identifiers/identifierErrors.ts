import { DSNPError } from "../errors";

/**
 * IdentifierError indicates an error in a DSNP identifier.
 */
export class IdentifierError extends DSNPError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * InvalidMessageIdentifierError indicates an improperly formatted DSNP message
 * identifier.
 */
export class InvalidMessageIdentifierError extends IdentifierError {
  dsnpMessageId: string;

  constructor(dsnpMessageId: string) {
    super(`Invalid DSNP Message Id: ${dsnpMessageId}`);
    this.dsnpMessageId = dsnpMessageId;
  }
}
