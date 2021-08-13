import { AnnouncementType } from "./factories";
import { DSNPError } from "../errors";

/**
 * AnnouncementError indicates an error in a DSNP announcement or type.
 */
export class AnnouncementError extends DSNPError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * InvalidAnnouncementTypeError indicates an invalid Announcement type.
 */
export class InvalidAnnouncementTypeError extends AnnouncementError {
  announcementType: AnnouncementType;

  constructor(announcementType: AnnouncementType) {
    super(`Invalid DSNP Type: ${announcementType}`);
    this.announcementType = announcementType;
  }
}

/**
 * InvalidTombstoneAnnouncementTypeError indicates an invalid Announcement type
 * included as a Tombstone target.
 */
export class InvalidTombstoneAnnouncementTypeError extends AnnouncementError {
  announcementType: AnnouncementType;

  constructor(announcementType: AnnouncementType) {
    super(`Invalid Tombstone Target Type: ${announcementType}`);
    this.announcementType = announcementType;
  }
}
