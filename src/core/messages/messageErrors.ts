import { DSNPType } from "./messages";
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
  dsnpType: DSNPType;

  constructor(dsnpType: DSNPType) {
    super(`Invalid DSNP Type: ${dsnpType}`);
    this.name = "InvalidMessageTypeError";
    this.dsnpType = dsnpType;
  }
}
