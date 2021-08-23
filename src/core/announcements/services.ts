import { AnnouncementWithSignature } from "./crypto";
import { AnnouncementType, TypedAnnouncement } from "./factories";

/**
 * convertSignedAnnouncementToAnnouncement() takes a SignedAnnouncement and
 * returns the same Announcement without a signature.
 *
 * @param obj - The SignedAnnouncement to convert
 * @returns An unsigned version of the Announcement
 */
export const convertSignedAnnouncementToAnnouncement = <T extends AnnouncementType>(
  obj: AnnouncementWithSignature<T>
): TypedAnnouncement<T> => {
  const newObj: TypedAnnouncement<T> = { ...obj };

  delete (newObj as Record<string, unknown>)["signature"];

  return newObj;
};
