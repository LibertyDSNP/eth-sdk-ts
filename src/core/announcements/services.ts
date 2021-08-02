import { SignedAnnouncement } from "./crypto";
import { Announcement } from "./factories";

/**
 * convertSignedAnnouncementToAnnouncement() takes a SignedAnnouncement and
 * returns the same Announcement without a signature.
 *
 * @param obj - The SignedAnnouncement to convert
 * @returns An unsigned version of the Announcement
 */
export const convertSignedAnnouncementToAnnouncement = (obj: SignedAnnouncement): Announcement => {
  const newObj: Record<string, unknown> = {};

  for (const key in obj) {
    if (key != "signature") newObj[key] = (obj as unknown as Record<string, unknown>)[key];
  }

  return newObj as unknown as Announcement;
};
