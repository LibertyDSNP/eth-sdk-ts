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
 * InvalidAnnouncementUriError indicates an improperly formatted DSNP announcement
 * identifier.
 */
export class InvalidAnnouncementUriError extends IdentifierError {
  AnnouncementUri: string;

  constructor(AnnouncementUri: string) {
    super(`Invalid Announcement Uri: ${AnnouncementUri}`);
    this.AnnouncementUri = AnnouncementUri;
  }
}
