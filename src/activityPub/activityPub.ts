import { keccak256 } from "js-sha3";
import { HexString } from "../types/Strings";
import { sortObject } from "../utilities/json";

const ISO8601_REGEX = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-](\d{2}):(\d{2}))?/;

export interface ActivityPub {
  "@context": string;
  type: string;
  name?: string;
  content?: string;
  url?: string;
  published?: string;
  inReplyTo?: string;
  attributedTo?: string;
  attachments?: string;
}

type PubType = "Image" | "Video";
export interface ActivityPubAttachment {
  type: PubType;
  mediaType: string;
  url: string;
}

export interface BroadcastOptions {
  attachments?: string[];
  author?: string;
  body?: string;
  title?: string;
  url?: string;
}

export interface ReplyOptions {
  attachments?: string[];
  author?: string;
  body: string;
  inReplyTo: string;
}

export type ActivityPubOptions = BroadcastOptions | ReplyOptions;

/**
 * create() provides a simple factory for generating activityPub notes.
 *
 * @param   options Options for the activity pub object to create
 * @returns         An activity pub object
 */
export const create = (options: ActivityPubOptions): ActivityPub => {
  const activityPub: Record<string, unknown> = {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Note",
    published: new Date().toISOString(),
  };

  if ((options as BroadcastOptions).title) activityPub["name"] = (options as BroadcastOptions).title;
  if (options.body) activityPub["content"] = (options as BroadcastOptions).body;
  if (options.author) activityPub["attributedTo"] = options.author;
  if ((options as ReplyOptions).inReplyTo) activityPub["inReplyTo"] = (options as ReplyOptions).inReplyTo;
  if ((options as BroadcastOptions).url) activityPub["url"] = (options as BroadcastOptions).url;
  if ((options as BroadcastOptions).attachments) activityPub["attachments"] = (options as BroadcastOptions).attachments;

  return (activityPub as unknown) as ActivityPub;
};

/**
 * validate() returns true if the object provided is a valid activityPub.
 * Otherwise, it returns false.
 *
 * @param   activityPub  An object to be validated against the activity pub standard
 * @returns              True or false depending on whether the given object is a valid
 */
export const validate = (activityPub: ActivityPub): boolean => {
  if (activityPub["@context"] !== "https://www.w3.org/ns/activitystreams") return false;
  if (!activityPub.type || typeof activityPub.type !== "string") return false;
  if (activityPub.published && !activityPub.published.match(ISO8601_REGEX)) return false;

  return true;
};

/**
 * serialize() converts an activityPub object to string for upload via the
 * storage adapter.
 *
 * @param   data  The activity pub object to hash
 * @returns       A string representation of the activity pub object
 */
export const serialize = (data: ActivityPub): string => {
  const sortedData = (sortObject((data as unknown) as Record<string, unknown>) as unknown) as ActivityPub;
  return JSON.stringify(sortedData);
};

/**
 * hash() provides a simple way to hash activityPub objects while guaranteeing
 * that identical objects with different key orders still return the same hash.
 * The underlying hash method used is [Keccak256](https://en.wikipedia.org/wiki/SHA-3).
 *
 * @param   data  The activity pub object to hash
 * @returns       A hexadecimal string containing the Keccak hash
 */
export const hash = (data: ActivityPub): HexString => {
  const jsonString = serialize(data);
  return keccak256(jsonString);
};
