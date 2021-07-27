import { DSNPUserId } from "../identifiers";
import { hash } from "../utilities";

interface ActivityContentBase {
  "@context": "https://www.w3.org/ns/activitystreams";
  type: string;
  name?: string;
  published?: string;
  location?: Array<ActivityContentLocation> | ActivityContentLocation;
  tag?: Array<ActivityContentTag> | ActivityContentTag;
}

/**
 * ActivityContentNote represents a post created by the user.
 */
export interface ActivityContentNote extends ActivityContentBase {
  type: "Note";
  mediaType: "text/plain";
  content: string;
  attachment?: Array<ActivityContentAttachment> | ActivityContentAttachment;
}

/**
 * ActivityContentProfile represents profile data for the posting user.
 */
export interface ActivityContentProfile extends ActivityContentBase {
  type: "Profile";
  icon?: Array<ActivityContentImage>;
  summary?: string;
}

/**
 * ActivityContentLocation represents location data associated with an
 * ActivityContentNote or ActivtyContentProfile.
 */
export interface ActivityContentLocation {
  type: "Place";
  name?: string;
  accuracy?: number;
  altitude?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  units?: string;
}

/**
 * ActivityContentTag is either an ActivityContentHashtag or an
 * ActivityContentMention.
 */
export type ActivityContentTag = ActivityContentHashtag | ActivityContentMention;

/**
 * ActivityContentHashtag represents a hashtag associated with an
 * ActivityContentNote or an ActivityContentProfile.
 */
export interface ActivityContentHashtag {
  name: string;
}

/**
 * ActivityContentMention represents a mention associated with an
 * ActivityContentNote or an ActivityContentProfile.
 */
export interface ActivityContentMention {
  type: "Mention";
  id: DSNPUserId;
  name?: string;
}

/**
 * ActivityContentAttachment represents a piece of external content associated
 * with an ActivityContentNote, such as a picture, video, audio clip or website.
 */
export type ActivityContentAttachment =
  | ActivityContentAudio
  | ActivityContentImage
  | ActivityContentVideo
  | ActivityContentLink;

/**
 * ActivityContentAudio represents an audio clip attached to an
 * ActivityContentNote. ActivityContentAudio objects contain an array of
 * ActivityContentAudioLinks with different versions of the same content. For
 * example, a single item of audio content may be available in multiple formats,
 * such as OGG or MP3, which may be included as individual
 * ActivityContentAudioLink objects. The semantic content of each file should
 * always be identical.
 */
export interface ActivityContentAudio {
  type: "Audio";
  url: Array<ActivityContentAudioLink>;
  name?: string;
  duration?: string;
}

/**
 * ActivityContentImage represents an image file attached to an
 * ActivityContentNote. ActivityContentImage objects contain an array of
 * ActivityContentImageLinks with different versions of the same content. For
 * example, a single picture may be available in multiple formats, such as JPEG
 * or PNG, which may be included as individual ActivityContentImageLink
 * objects. The height and width of the included ActivityContentImageLink
 * objects may also vary to provide faster loading on different screen size
 * devices. The semantic content of each file should always be identical.
 */
export interface ActivityContentImage {
  type: "Image";
  url: Array<ActivityContentImageLink>;
  name?: string;
}

/**
 * ActivityContentVideo represents an video file attached to an
 * ActivityContentNote. ActivityContentVideoLink objects contain an array of
 * ActivityContentVideoLinks with different versions of the same content. For
 * example, a single video may be available in multiple formats, such as MPEG
 * or MKV, which may be included as individual ActivityContentVideoLink
 * objects. The height and width of the included ActivityContentVideoLink
 * objects may also vary to provide faster loading on different screen size
 * devices. The semantic content of each file should always be identical.
 */
export interface ActivityContentVideo {
  type: "Video";
  url: Array<ActivityContentVideoLink>;
  name?: string;
  duration?: string;
}

/**
 * ActivityContentLink represents a link attached to an ActivityContentNote.
 * Unlike ActivityContentAudio, ActivityContentImage and ActivityContentVideo
 * objects, link objects may point to dynamic content, such as a news article,
 * which should not be hashed to prove their authenticity.
 */
export interface ActivityContentLink {
  type: "Link";
  href: string;
  name?: string;
}

/**
 * ActivityContentAudioLink represents a specific audio file included in an
 * ActivityContentAudio object.
 */
export interface ActivityContentAudioLink extends ActivityContentLink {
  mediaType: string;
  hash: Array<ActivityContentHash>;
}

/**
 * ActivityContentImageLink represents a specific image file included in an
 * ActivityContentImage object.
 */
export interface ActivityContentImageLink extends ActivityContentLink {
  mediaType: string;
  hash: Array<ActivityContentHash>;
  height?: number;
  width?: number;
}

/**
 * ActivityContentVideoLink represents a specific video file included in an
 * ActivityContentVideo object.
 */
export interface ActivityContentVideoLink extends ActivityContentLink {
  mediaType: string;
  hash: Array<ActivityContentHash>;
  height?: number;
  width?: number;
}

/**
 * ActivtyContentHash represents a hash included in the hash field of an
 * ActivityContentAudioLink, ActivityContentImageLink or
 * ActivityContentVideoLink object to prove it's authenticity.
 */
export interface ActivityContentHash {
  algorithm: string;
  [others: string]: string;
}

/**
 * createNote() provides a simple factory for generating an ActivityContentNote
 * object.
 *
 * @param content - The text content to include in the note
 * @param options - Any additional fields for the ActivityContentNote
 * @returns An ActivityContentNote object
 */
export const createNote = (content: string, options?: Partial<ActivityContentNote>): ActivityContentNote => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Note",
  mediaType: "text/plain",
  content,
  ...options,
});

/**
 * createProfile() provides a simple factory for generating an
 * ActivityContentProfile object.
 *
 * @param options - Any fields for the ActivityContentProfile
 * @returns An ActivityContentProfile object
 */
export const createProfile = (options?: Partial<ActivityContentProfile>): ActivityContentProfile => ({
  "@context": "https://www.w3.org/ns/activitystreams",
  type: "Profile",
  ...options,
});

/**
 * createAudioAttachment() provides a simple factory for generating an
 * ActivityContentAudio object.
 *
 * @param links - An array of ActivityContentAudioLink objects to include
 * @param options - Any additional fields for the ActivityContentAudio
 * @returns An ActivityContentAudio object
 */
export const createAudioAttachment = (
  links: Array<ActivityContentAudioLink>,
  options?: Partial<ActivityContentAudio>
): ActivityContentAudio => ({
  type: "Audio",
  url: links,
  ...options,
});

/**
 * createAudioLink() provides a simple factory for generation an
 * ActivityContentAudioLink object for inclusion in an ActivityContentAudio
 * object.
 *
 * @param href      - The URL of the file
 * @param mediaType - The MIME type of the file
 * @param hash      - An ActivityContentHash object to authenticate the file
 * @param options - Any additional fields for the ActivityContentAudioLink
 * @returns An ActivityContentAudioLink object
 */
export const createAudioLink = (
  href: string,
  mediaType: string,
  hash: Array<ActivityContentHash>,
  options?: Partial<ActivityContentAudioLink>
): ActivityContentAudioLink => ({
  type: "Link",
  href,
  mediaType,
  hash,
  ...options,
});

/**
 * createImageAttachment() provides a simple factory for generating an
 * ActivityContentImage object.
 *
 * @param links - An array of ActivityContentImageLink objects to include
 * @param options - Any additional fields for the ActivityContentImage
 * @returns An ActivityContentImage object
 */
export const createImageAttachment = (
  links: Array<ActivityContentImageLink>,
  options?: Partial<ActivityContentImage>
): ActivityContentImage => ({
  type: "Image",
  url: links,
  ...options,
});

/**
 * createImageLink() provides a simple factory for generation an
 * ActivityContentImageLink object for inclusion in an ActivityContentImage
 * object.
 *
 * @param href      - The URL of the file
 * @param mediaType - The MIME type of the file
 * @param hash      - An ActivityContentHash object to authenticate the file
 * @param options - Any additional fields for the ActivityContentImageLink
 * @returns An ActivityContentImageLink object
 */
export const createImageLink = (
  href: string,
  mediaType: string,
  hash: Array<ActivityContentHash>,
  options?: Partial<ActivityContentImageLink>
): ActivityContentImageLink => ({
  type: "Link",
  href,
  mediaType,
  hash,
  ...options,
});

/**
 * createVideoAttachment() provides a simple factory for generating an
 * ActivityContentVideo object.
 *
 * @param links - An array of ActivityContentVideoLink objects to include
 * @param options - Any additional fields for the ActivityContentVideo
 * @returns An ActivityContentVideo object
 */
export const createVideoAttachment = (
  links: Array<ActivityContentVideoLink>,
  options?: Partial<ActivityContentVideo>
): ActivityContentVideo => ({
  type: "Video",
  url: links,
  ...options,
});

/**
 * createVideoLink() provides a simple factory for generation an
 * ActivityContentVideoLink object for inclusion in an ActivityContentVideo
 * object.
 *
 * @param href      - The URL of the file
 * @param mediaType - The MIME type of the file
 * @param hash      - An ActivityContentHash object to authenticate the file
 * @param options - Any additional fields for the ActivityContentVideoLink
 * @returns An ActivityContentVideoLink object
 */
export const createVideoLink = (
  href: string,
  mediaType: string,
  hash: Array<ActivityContentHash>,
  options?: Partial<ActivityContentVideoLink>
): ActivityContentVideoLink => ({
  type: "Link",
  href,
  mediaType,
  hash,
  ...options,
});

/**
 * createLinkAttachment() provides a simple factory for generating an
 * ActivityContentLink object.
 *
 * @param href - The URL to include in the link
 * @param options - Any additional fields for the ActivityContentLink
 * @returns An ActivityContentLink object
 */
export const createLinkAttachment = (href: string, options?: Partial<ActivityContentLink>): ActivityContentLink => ({
  type: "Link",
  href,
  ...options,
});

/**
 * createLocation() provides a simple factory for generating an
 * ActivityContentLocation object.
 *
 * @param options - Any options for the ActivityContentLocation
 * @returns An ActivityContentLocation object
 */
export const createLocation = (options?: Partial<ActivityContentLocation>): ActivityContentLocation => ({
  type: "Place",
  ...options,
});

/**
 * createHashtag() provides a simple factory for generating an
 * ActivityContentHashtag object.
 *
 * @param name - The hashtag value, without "#" character
 * @returns An ActivityContentTag object
 */
export const createHashtag = (name: string): ActivityContentHashtag => ({
  name,
});

/**
 * createMention() provides a simple factory for generating an
 * ActivityContentMention object.
 *
 * @param id - The DSNPUserId of the mention user
 * @param options - Any additional fields for the ActivityContentMention
 * @returns An ActivityContentMention object
 */
export const createMention = (id: DSNPUserId, options?: Partial<ActivityContentMention>): ActivityContentMention => ({
  type: "Mention",
  id,
  ...options,
});

/**
 * createHash() provides a simple factory for generating an ActivityContentHash
 * object. This factory assumes the user intends to use a standard Keccak256
 * hash. To use other authentication algorithms, users should build their own
 * ActivityContentHash objects.
 *
 * @param content - The file content to be hashed
 * @returns An ActivityContentHash containing the keccak256 proof of the content
 */
export const createHash = (content: string): ActivityContentHash => ({
  algorithm: "keccak256",
  value: hash(content),
});
