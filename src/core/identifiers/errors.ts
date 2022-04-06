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
 * InvalidContentUriError indicates an improperly formatted DSNP announcement
 * identifier.
 */
export class InvalidContentUriError extends IdentifierError {
  contentUri: string;

  constructor(contentUri: string) {
    super(`Invalid Content Uri: ${contentUri}`);
    this.contentUri = contentUri;
  }
}
