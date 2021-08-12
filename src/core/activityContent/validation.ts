import {
  ActivityContentNote,
  ActivityContentProfile,
  ActivityContentAttachment,
  ActivityContentAudio,
  ActivityContentImage,
  ActivityContentVideo,
  ActivityContentAudioLink,
  ActivityContentImageLink,
  ActivityContentVideoLink,
  ActivityContentLink,
  ActivityContentHash,
  ActivityContentTag,
  ActivityContentHashtag,
  ActivityContentMention,
  ActivityContentLocation,
} from "./factories";
import { isDSNPUserId } from "../identifiers";
import { isRecord, isString, isNumber, isArrayOfType } from "../utilities/validation";
import { InvalidActivityContentError } from "./errors";

/**
 * Regex for ISO 8601 / XML Schema Dates
 * - T separation
 * - Required Time
 * - Supports fractional seconds
 * - Z or hour minute offset
 */
const ISO8601_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{1,})?(Z|[+-][01][0-9]:[0-5][0-9])?$/;
const HREF_REGEX = /^https?:\/\/.+/;
const DURATION_REGEX = /^-?P[0-9]+Y?([0-9]+M)?([0-9]+D)?(T([0-9]+H)?([0-9]+M)?([0-9]+(\.[0-9]+)?S)?)?$/;
const HASH_REGEX = /^0x[0-9A-Fa-f]{64}$/;
const SUPPORTED_ALGORITHMS = ["keccak256"];
const SUPPORTED_AUDIO_MEDIA_TYPES = ["audio/mp3", "audio/ogg", "audio/webm"];
const SUPPORTED_IMAGE_MEDIA_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg+xml",
  "image/webp",
  "image/gif",
];
const SUPPORTED_VIDEO_MEDIA_TYPES = ["video/mpeg", "video/ogg", "video/webm", "video/H256", "video/mp4"];

const InvalidRecordMessage = (extra?: string): string => {
  return `${extra || "object"} is not a record type`;
};

const getActivityContentAttachment = (obj: unknown): ActivityContentAttachment | undefined => {
  try {
    return requireActivityContentAttachment(obj);
  } catch (e) {
    console.error(e.toString());
    return undefined;
  }
};

/**
 * requireActivityContentAttachment validates an unknown object and returns it
 * as an ActivityContentAttachment type if valid, and throws an error if not.
 *
 * @param obj - the object to convert
 */
export const requireActivityContentAttachment = (obj: unknown): ActivityContentAttachment => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentAttachment")); // this check is required for type checking to work
  if (!obj["type"]) throw new InvalidActivityContentError("ActivityContentAttachment type is invalid");
  switch (obj["type"]) {
    case "Image":
      return requireActivityContentImage(obj);
    case "Audio":
      return requireActivityContentAudio(obj);
    case "Link":
      return requireIsActivityContentLink(obj);
    case "Video":
      return requireActivityContentVideo(obj);
    default:
      throw new InvalidActivityContentError("unknown activity content type: " + obj["type"]);
  }
};

const requireIsMediaContentLink = (obj: Record<string, unknown>, name: string): boolean => {
  if (obj["type"] !== "Link") throw new InvalidActivityContentError(`${name} type is not 'Link'`);
  requireIsString(obj["mediaType"], `${name} mediaType`);
  requireIsString(obj["href"], `${name} href`);
  if (!isArrayOfType(obj["hash"], requireIsActivityContentHash))
    throw new InvalidActivityContentError(`${name} hash is invalid`);

  if (!hasAtLeastOneSupportedHashAlgorithm(obj["hash"]))
    throw new InvalidActivityContentError(
      "ActivityContent hash algorithms must contain at least one of: " + SUPPORTED_ALGORITHMS.join(",")
    );

  return true;
};

const requireValidDimensions = (obj: Record<string, unknown>, name?: string): boolean => {
  if (obj["height"] && !isNumber(obj["height"])) throw new InvalidActivityContentError(`${name} height is invalid`);
  if (obj["width"] && !isNumber(obj["width"])) throw new InvalidActivityContentError(`${name} width is invalid`);
  return true;
};

const requireIsActivityContentAudioLink = (obj: unknown): obj is ActivityContentAudioLink => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentAudioLink"));
  requireIsMediaContentLink(obj, "ActivityContentAudioLink");
  return true;
};

const requireIsActivityContentImageLink = (obj: unknown): obj is ActivityContentImageLink => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentImageLink"));
  requireIsMediaContentLink(obj, "ActivityContentImageLink");
  requireValidDimensions(obj, "ActivityContentImageLink");
  return true;
};

const requireIsActivityContentVideoLink = (obj: unknown): obj is ActivityContentVideoLink => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentVideoLink"));
  requireIsMediaContentLink(obj, "ActivityContentVideoLink");
  requireValidDimensions(obj, "ActivityContentVideoLink");
  return true;
};

const requireIsActivityContentLink = (obj: unknown): ActivityContentLink => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentVideoLink"));
  if (obj["type"] !== "Link") throw new InvalidActivityContentError("ActivityContentLink type is not 'Link'");

  const href = requireIsString(obj["href"], "ActivityContentLink href");
  if (!isValidHrefField(href)) throw new InvalidActivityContentError("ActivityContentLink href is invalid");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentLink name");

  return { type: "Link", href: "", ...obj };
};

const requireIsActivityContentHash = (obj: unknown): obj is ActivityContentHash => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentHash"));
  const hashVal = requireIsString(obj["value"], "ActivityContentHash value field");
  if (!hashVal.match(HASH_REGEX)) throw new InvalidActivityContentError("ActivityContentHash value is invalid");

  requireIsString(obj["algorithm"], "ActivityContentHash algorithm");
  return true;
};

const requireIsActivityContentLocation = (obj: unknown): obj is ActivityContentLocation => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentLocation"));
  if (obj["type"] !== "Place") throw new InvalidActivityContentError("ActivityContentLocation type is not 'Place'");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentLocation name");
  if (obj["units"]) requireIsString(obj["units"], "ActivityContentLocation units");

  ["accuracy", "altitude", "latitude", "longitude", "radius"].forEach((dimension) => {
    if (obj[dimension] && !isNumber(obj[dimension]))
      throw new InvalidActivityContentError(`ActivityContentLocation ${dimension} is not a number`);
  });

  return true;
};

const requireIsActivityContentTag = (obj: unknown): obj is ActivityContentTag => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentTag"));
  if (obj["type"] && obj["type"] === "Mention") {
    return requireIsActivityContentMention(obj);
  }
  return requireIsActivityContentHashtag(obj);
};

const requireIsActivityContentHashtag = (obj: unknown): obj is ActivityContentHashtag => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentHashtag")); // this check is required for type checking to work
  requireIsString(obj["name"], "ActivityContentHashtag name");
  return true;
};

const requireIsActivityContentMention = (obj: unknown): obj is ActivityContentMention => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentMention")); // this check is required for type checking to work
  if (!isDSNPUserId(obj["id"]))
    throw new InvalidActivityContentError("ActivityContentMention id is not a valid DSNPUserId");
  if (obj["name"]) requireIsString(obj["name"], "ActivityContentMention name");
  return true;
};

/**
 * requireActivityContentAudio converts a validated unknown object type to an ActivityContentAudio
 * in a type safe way.  It throws an error if the object is not valid.
 *
 * @param obj - the object to convert
 */
const requireActivityContentAudio = (obj: unknown): ActivityContentAudio => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentAudio")); // this check is required for type checking to work
  if (obj["type"] !== "Audio") throw new InvalidActivityContentError('type is not "Audio"');

  if (!isArrayOfType(obj["url"], requireIsActivityContentAudioLink))
    throw new InvalidActivityContentError("invalid ActivityContentAudioLink");

  if (!hasAtLeastOneSupportedAudioMediaType(obj["url"]))
    throw new InvalidActivityContentError("ActivityContentAudio has no supported media types");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentAudio name");

  if (obj["duration"]) {
    const duration = requireIsString(obj["duration"], "ActivityContentAudio duration");
    if (!isValidDurationField(duration))
      throw new InvalidActivityContentError("ActivityContentAudio duration is invalid");
  }

  return { type: "Audio", url: [], ...obj };
};

/**
 * requireActivityContentImage converts a validated unknown object type to an ActivityContentImage
 * in a type safe way. It throws an error if the object is not valid.
 *
 * @param obj - the object to convert
 */
const requireActivityContentImage = (obj: unknown): ActivityContentImage => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentImage")); // this check is required for type checking to work
  if (obj["type"] !== "Image") throw new InvalidActivityContentError('"type" is not "Image"');

  if (!isArrayOfType(obj["url"], requireIsActivityContentImageLink))
    throw new InvalidActivityContentError("invalid ActivityContentImageLink");
  if (!hasAtLeastOneSupportedImageMediaType(obj["url"]))
    throw new InvalidActivityContentError("ActivityContentImage has no supported media types");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentImage name");

  // const content: ActivityContentImage = { type: "Image", url: [], ...obj };
  return { type: "Image", url: [], ...obj };
};

/**
 * requireActivityContentVideo converts a validated unknown object type to an ActivityContentVideo
 * in a type safe way.  It throws an error if the object is not valid.
 *
 * @param obj - the object to convert
 */
const requireActivityContentVideo = (obj: unknown): ActivityContentVideo => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("")); // this check is required for type checking to work
  if (obj["type"] !== "Video") throw new InvalidActivityContentError("type is not 'Video'");

  if (!isArrayOfType(obj["url"], requireIsActivityContentVideoLink))
    throw new InvalidActivityContentError("invalid ActivityContentVideoLink");

  if (!hasAtLeastOneSupportedVideoMediaType(obj["url"]))
    throw new InvalidActivityContentError("ActivityContentVideo has no supported media types");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentVideo name");
  if (obj["duration"]) {
    const duration = requireIsString(obj["duration"], "ActivityContentVideo duration");
    if (!isValidDurationField(duration))
      throw new InvalidActivityContentError("ActivityContentVideo duration is invalid");
  }

  return { type: "Video", url: [], ...obj };
};

const requireIsString = (obj: unknown, name: string): string => {
  if (!isString(obj)) throw new InvalidActivityContentError(`${name} is not a string`);
  return obj as string;
};

const requireIsArray = (obj: unknown, name: string): Array<unknown> => {
  if (!Array.isArray(obj)) throw new InvalidActivityContentError(`${name} is not an Array`);
  return obj as Array<unknown>;
};

const isValidHrefField = (obj: string): boolean => obj.match(HREF_REGEX) !== null;

const isValidPublishedField = (obj: string): boolean => obj.match(ISO8601_REGEX) !== null;

const isValidDurationField = (obj: string): boolean => obj.match(DURATION_REGEX) !== null;

const hasAtLeastOneSupportedAudioMediaType = (obj: Array<ActivityContentAudioLink>): boolean => {
  for (const audioLink of obj) {
    if (SUPPORTED_AUDIO_MEDIA_TYPES.includes(audioLink["mediaType"])) return true;
  }

  return false;
};

const hasAtLeastOneSupportedImageMediaType = (obj: Array<ActivityContentImageLink>): boolean => {
  for (const imageLink of obj) {
    if (SUPPORTED_IMAGE_MEDIA_TYPES.includes(imageLink["mediaType"])) return true;
  }

  return false;
};

const hasAtLeastOneSupportedVideoMediaType = (obj: Array<ActivityContentVideoLink>): boolean => {
  for (const videoLink of obj) {
    if (SUPPORTED_VIDEO_MEDIA_TYPES.includes(videoLink["mediaType"])) return true;
  }

  return false;
};

const hasAtLeastOneSupportedHashAlgorithm = (obj: Array<ActivityContentHash>): boolean => {
  for (const hash of obj) {
    if (hash["algorithm"] === "keccak256" && isString(hash["value"]) && hash["value"].match(HASH_REGEX)) return true;
  }

  return false;
};

const requireActivityContentBaseType = (obj: unknown, typeName: string): boolean => {
  if (!isRecord(obj)) throw new InvalidActivityContentError("ActivityContentNote"); // this check is required for type checking to work
  if (obj["@context"] !== "https://www.w3.org/ns/activitystreams")
    throw new InvalidActivityContentError(`invalid ActivityContent${typeName} @context`);
  if (obj["type"] !== typeName) throw new InvalidActivityContentError(`invalid ActivityContent${typeName} type`);
  if (obj["name"]) requireIsString(obj["name"], `ActivityContent${typeName} name`);
  if (obj["published"]) requireIsString(obj["published"], `ActivityContent${typeName} published`);
  if (obj["tag"] && !isRecord(obj["tag"])) requireIsArray(obj["tag"], `ActivityContent${typeName} tag`);
  if (obj["location"] && !isRecord(obj["location"]))
    throw new InvalidActivityContentError(InvalidRecordMessage(`ActivityContent${typeName} location`));
  return true;
};

/**
 * requireActivityContentNoteType() is a type check function for ActivityContentNote
 * objects. Note that this function only checks that the given object meets the
 * first-level type definition of an ActivityContentNote. It **does not** perform
 * deeper type validations or any logic
 * validations, such as checking the format of string fields or checking that
 * required attachments each include at least one supported format.
 *
 * @param obj - The object to check
 * @returns true if the object is an ActivityContentNote, otherwise throws an Error.
 */
export const requireActivityContentNoteType = (obj: unknown): obj is ActivityContentNote => {
  if (!isRecord(obj)) throw new InvalidActivityContentError("ActivityContentNote"); // this check is required for type checking to work
  requireActivityContentBaseType(obj, "Note");
  if (obj["mediaType"] !== "text/plain") throw new InvalidActivityContentError("invalid ActivityContentNote mediaType");
  if (obj["attachment"]) requireIsArray(obj["attachment"], "ActivityContentNote attachment");
  return true;
};

/**
 * requireIsActivityContentProfileType() is a type check function for
 * ActivityContentProfile objects. Note that this function only checks that the
 * given object meets the first-level type definition of an ActivityContentProfile. It
 * does not** perform deeper type validations or any logic validations, such as checking the format of
 * string fields or checking that the icon field includes at least one supported
 * image format.
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is an ActivityContentProfile
 */
export const requireIsActivityContentProfileType = (obj: unknown): obj is ActivityContentProfile => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentProfile"));
  requireActivityContentBaseType(obj, "Profile");
  if (obj["summary"]) requireIsString(obj["summary"], "ActivityContentProfile summary");
  if (obj["icon"] && !isArrayOfType(obj["icon"], requireIsActivityContentImageLink))
    throw new InvalidActivityContentError("ActivityContentProfile icon is invalid");
  if (obj["attachment"]) requireIsArray(obj["attachment"], "ActivityContentProfile attachment");
  return true;
};

/**
 * requireGetSupportedContentAttachments iterates over the provided list and returns
 * the valid attachments. If the passed in obj is empty, returns an empty array.
 * If there are attachments but none of them are valid, it throws an error.
 *
 * @param obj - an array of unknown object types to check for validity
 * @returns an array of all valid attachments
 */
export const requireGetSupportedContentAttachments = (obj: Array<unknown>): Array<ActivityContentAttachment> => {
  if (!obj.length) return [];
  const validTypeAttachments = obj.filter((attachment) => {
    return !!getActivityContentAttachment(attachment);
  });
  if (!validTypeAttachments.length) {
    for (const attachment of obj) {
      requireActivityContentAttachment(attachment);
    }
  }
  return validTypeAttachments as Array<ActivityContentAttachment>;
};

/**
 * requireValidActivityContentNote() validates that a given object meets all
 * necessary specification requirements for an ActivityContentNote object,
 * include string field formats and other logical validations. Note that this
 * function **does not** attempt to fetch any attachments to validate that their
 * hashes are correct.
 *
 * @param obj - The object to check
 * @returns true if valid, throws Error if invalid.
 */
export const requireValidActivityContentNote = (obj: unknown): void => {
  if (requireActivityContentNoteType(obj)) {
    if (obj["tag"]) requireIsActivityContentTag(obj["tag"]);

    if (obj["published"] && !isValidPublishedField(obj["published"]))
      throw new InvalidActivityContentError("ActivityContentNote published is invalid");
    if (obj["attachment"]) {
      const attachments = requireIsArray(obj["attachment"], "ActivityContentNote attachment");
      requireGetSupportedContentAttachments(attachments);
    }
    if (obj["location"]) requireIsActivityContentLocation(obj["location"]);
  } else {
    throw new InvalidActivityContentError("ActivityContentNote is invalid for an unknown reason");
  }
};

/**
 * requireValidActivityContentProfile() validates that a given object meets all
 * necessary specification requirements for an ActivityContentProfile object,
 * include string field formats and other logical validations. Note that this
 * function **does not** attempt to fetch any icons to validate that their
 * hashes are correct.
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is a valid ActivityContentProfile
 */
export const requireValidActivityContentProfile = (obj: unknown): void => {
  if (requireIsActivityContentProfileType(obj)) {
    if (obj["tag"] && !isArrayOfType(obj["tag"], requireIsActivityContentTag)) requireIsActivityContentTag(obj["tag"]);

    if (obj["published"] && !isValidPublishedField(obj["published"]))
      throw new InvalidActivityContentError("ActivityContentProfile published is invalid");
    if (obj["icon"]) {
      for (const icon of obj["icon"]) {
        requireIsActivityContentLink(icon);
      }
    }
    if (obj["location"]) requireIsActivityContentLocation(obj["location"]);
  } else {
    throw new InvalidActivityContentError("ActivityContentProfile is invalid for an unknown reason");
  }
};
