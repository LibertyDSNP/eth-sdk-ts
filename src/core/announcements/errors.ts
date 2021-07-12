import { DSNPType } from "./announcementTypes";
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
 * InvalidAnnouncementTypeError indicates an invalid Announcement DSNP type.
 */
export class InvalidAnnouncementTypeError extends AnnouncementError {
  dsnpType: DSNPType;

  constructor(dsnpType: DSNPType) {
    super(`Invalid DSNP Type: ${dsnpType}`);
    this.dsnpType = dsnpType;
  }
}
