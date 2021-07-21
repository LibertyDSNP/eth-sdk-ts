import { DSNPUserId } from "../identifiers";

interface ActivityContentMention {
  type: "Mention";
  href: DSNPUserId;
}

/**
 * ActivityContentTag represents a tag included in the tag field of an activity
 * content object
 */
export type ActivityContentTag = ActivityContentMention | string;

/**
 * ActivtyContentHash represents a hash included in the hash field of an
 * activity content object
 */
export interface ActivtyContentHash {
  algorithm: string;
  [others: string]: string;
}

/**
 * BaseActivityContent represents a base activity content object
 */
export interface BaseActivityContent {
  "@context": string;
  type: string;
  published: string;
  context?: string;
  tag?: Array<ActivityContentTag> | ActivityContentTag;
}

export type ActivityContentAttachment = ActivityContent | string;

/**
 * ActivityContentLink represents a Link type activity content object
 */
export interface ActivityContentLink extends BaseActivityContent {
  type: "Link";
  href: string;
  mediaType?: string;
}

/**
 * ActivityContentNote represents a Note type activity content object
 */
export interface ActivityContentNote extends BaseActivityContent {
  type: "Note";
  content: string;
  mediaType?: string;
  attachment?: Array<ActivityContentAttachment> | ActivityContentAttachment;
  summary?: string;
}

/**
 * ActivityContentPerson represents a Person type activity content object
 */
export interface ActivityContentPerson extends BaseActivityContent {
  type: "Person";
  name: string;
}

/**
 * ActivityContentAudio represents a Audio type activity content object
 */
export interface ActivityContentAudio extends BaseActivityContent {
  type: "Audio";
  url: ActivityContentLink | string;
  mediaType: string;
  hash: Array<ActivtyContentHash> | ActivtyContentHash;
  duration?: string;
}

/**
 * ActivityContentImage represents a Image type activity content object
 */
export interface ActivityContentImage extends BaseActivityContent {
  type: "Image";
  url: ActivityContentLink | string;
  mediaType: string;
  hash: Array<ActivtyContentHash> | ActivtyContentHash;
  height: number;
  width: number;
}

/**
 * ActivityContentProfile represents a Profile type activity content object
 */
export interface ActivityContentProfile extends BaseActivityContent {
  type: "Profile";
  describes: ActivityContentPerson;
  summary?: string;
  icon?: ActivityContentImage;
  links?: Array<ActivityContentLink>;
}

/**
 * ActivityContentVideo represents a Video type activity content object
 */
export interface ActivityContentVideo extends BaseActivityContent {
  type: "Video";
  url: ActivityContentLink | string;
  mediaType: string;
  hash: Array<ActivtyContentHash> | ActivtyContentHash;
  height: number;
  width: number;
  duration?: string;
}

/**
 * ActivityContent represents an activity content object of unknown type
 */
export type ActivityContent =
  | ActivityContentLink
  | ActivityContentNote
  | ActivityContentPerson
  | ActivityContentAudio
  | ActivityContentImage
  | ActivityContentProfile
  | ActivityContentVideo;

/**
 * createLink() provides a simple factory for generating ActivityContentLink
 * objects.
 *
 * @param href - The URL to include in the link
 * @param options - Any additional fields for the activity content link
 * @returns An activity content link object
 */
export const createLink = (href: string, options?: Partial<ActivityContentLink>): ActivityContentLink => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Link",
  published: new Date().toISOString(),
  href,
  ...options,
});

/**
 * createNote() provides a simple factory for generating ActivityContentNote
 * objects.
 *
 * @param content - The text content to include in the note
 * @param options - Any additional fields for the activity content note
 * @returns An activity content note object
 */
export const createNote = (content: string, options?: Partial<ActivityContentNote>): ActivityContentNote => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Note",
  published: new Date().toISOString(),
  content,
  ...options,
});

/**
 * createPerson() provides a simple factory for generating ActivityContentPerson
 * objects.
 *
 * @param name - The new display name for the user
 * @returns An activity content person object
 */
export const createPerson = (name: string): ActivityContentPerson => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Person",
  published: new Date().toISOString(),
  name,
});

/**
 * createAudio() provides a simple factory for generating ActivityContentAudio
 * objects.
 *
 * @param url - The URL of the audio file
 * @param mediaType - The MIME type of the audio file
 * @param hash - An ActivtyContentHash or array of ActivtyContentHashes for the file
 * @param options - Any additional fields for the activity content audio
 * @returns An activity content audio object
 */
export const createAudio = (
  url: string,
  mediaType: string,
  hash: Array<ActivtyContentHash> | ActivtyContentHash,
  options?: Partial<ActivityContentAudio>
): ActivityContentAudio => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Audio",
  published: new Date().toISOString(),
  url: createLink(url, { mediaType }),
  mediaType,
  hash,
  ...options,
});

/**
 * createImage() provides a simple factory for generating ActivityContentImage
 * objects.
 *
 * @param url - The URL of the image file
 * @param mediaType - The MIME type of the image file
 * @param hash - An ActivtyContentHash or array of ActivtyContentHashes for the file
 * @param height - The height of the image
 * @param width - The width of the image
 * @param options - Any additional fields for the activity content image
 * @returns An activity content image object
 */
export const createImage = (
  url: string,
  mediaType: string,
  hash: Array<ActivtyContentHash> | ActivtyContentHash,
  height: number,
  width: number,
  options?: Partial<ActivityContentImage>
): ActivityContentImage => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Image",
  published: new Date().toISOString(),
  url: createLink(url, { mediaType }),
  mediaType,
  hash,
  height,
  width,
  ...options,
});

/**
 * createProfile() provides a simple factory for generating
 * ActivityContentProfile objects.
 *
 * @param name - The new display name for the user
 * @param options - Any additional fields for the activity content profile
 * @returns An activity content profile object
 */
export const createProfile = (name: string, options?: Partial<ActivityContentProfile>): ActivityContentProfile => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Profile",
  published: new Date().toISOString(),
  describes: createPerson(name),
  ...options,
});

/**
 * createVideo() provides a simple factory for generating ActivityContentVideo
 * objects.
 *
 * @param url - The URL of the video file
 * @param mediaType - The MIME type of the video file
 * @param hash - An ActivtyContentHash or array of ActivtyContentHashes for the file
 * @param height - The height of the video
 * @param width - The width of the video
 * @param options - Any additional fields for the activity content video
 * @returns An activity content video object
 */
export const createVideo = (
  url: string,
  mediaType: string,
  hash: Array<ActivtyContentHash> | ActivtyContentHash,
  height: number,
  width: number,
  options?: Partial<ActivityContentVideo>
): ActivityContentVideo => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Video",
  published: new Date().toISOString(),
  url: createLink(url, { mediaType }),
  mediaType,
  hash,
  height,
  width,
  ...options,
});
