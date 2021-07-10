import { DSNPError } from "../errors";

/**
 * MessageError indicates an error in a DSNP message or type.
 */
export class MessageError extends DSNPError {
  constructor(message: string) {
    super(message);
    this.name = "MessageError";
  }
}

/**
 * InvalidMessageTypeError indicates an invalid DSNP message type.
 */
export class InvalidMessageTypeError extends MessageError {
  dsnpType: number;

  constructor(dsnpType: number) {
    super(`Invalid DSNP Type: ${dsnpType}`);
    this.name = "InvalidMessageTypeError";
    this.dsnpType = dsnpType;
  }
}
