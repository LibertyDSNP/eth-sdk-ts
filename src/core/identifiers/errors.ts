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
 * InvalidAnnouncementIdentifierError indicates an improperly formatted DSNP announcement
 * identifier.
 */
export class InvalidAnnouncementIdentifierError extends IdentifierError {
  announcementId: string;

  constructor(announcementId: string) {
    super(`Invalid Announcement Id: ${announcementId}`);
    this.announcementId = announcementId;
  }
}
