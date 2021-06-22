import { sortObject } from "../utilities/json";

const ISO8601_REGEX = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-](\d{2}):(\d{2}))?/;

type PubType = "Image" | "Video";

/**
 * ActivityPubAttachment represents an attachment to an activity pub object
 */
export interface ActivityPubAttachment {
  type: PubType;
  mediaType: string;
  url: string;
}

/**
 * ActivityPub represents an activity pub object
 */
export interface ActivityPub {
  "@context": string;
  id?: string;
  type: string;
  name?: string;
  content?: string;
  url?: string;
  published?: string;
  inReplyTo?: string;
  attributedTo?: string;
  preferredUsername?: string;
  attachments?: ActivityPubAttachment[];
}

/**
 * ActivityPubOpts represents options to be passed to the create method.
 */
export type ActivityPubOpts = Partial<ActivityPub>;

/**
 * create() provides a simple factory for generating activityPub notes.
 *
 * @param options - Options for the activity pub object to create
 * @returns An activity pub object
 */
export const create = (options: ActivityPubOpts): ActivityPub =>
  ({
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Note",
    published: new Date().toISOString(),
    ...options,
  } as ActivityPub);

/**
 * isValid() returns true if the object provided is a valid activityPub.
 * Otherwise, it returns false.
 *
 * @param activityPub - An object to be validated against the activity pub standard
 * @returns True or false depending on whether the given object is a valid
 */
export const isValid = (activityPub: ActivityPub): boolean => {
  if (activityPub["@context"] !== "https://www.w3.org/ns/activitystreams") return false;
  if (!activityPub.type || typeof activityPub.type !== "string") return false;
  if (activityPub.published && !activityPub.published.match(ISO8601_REGEX)) return false;

  return true;
};

/**
 * isValidReply() returns true if the object provided is a valid activityPub
 * reply. Otherwise, it returns false.
 *
 * @param activityPub - An object to be validated against the activity pub standard
 * @returns True or false depending on whether the given object is a valid
 */
export const isValidReply = (activityPub: ActivityPub): boolean => {
  if (!isValid(activityPub)) return false;
  if (!activityPub["inReplyTo"]) return false;

  return true;
};

/**
 * isValidProfile() returns true if the object provided is a valid activityPub
 * profile. Otherwise, it returns false.
 *
 * @param activityPub - An object to be validated against the activity pub standard
 * @returns True or false depending on whether the given object is a valid
 */
export const isValidProfile = (activityPub: ActivityPub): boolean => {
  if (!isValid(activityPub)) return false;
  if (activityPub["type"] !== "Person") return false;

  return true;
};

/**
 * serialize() converts an activityPub object to string for upload via the
 * storage adapter.
 *
 * @param data - The activity pub object to hash
 * @returns A string representation of the activity pub object
 */
export const serialize = (data: ActivityPub): string => {
  const sortedData = (sortObject((data as unknown) as Record<string, unknown>) as unknown) as ActivityPub;
  return JSON.stringify(sortedData);
};
