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
import { isDSNPUserURI } from "../identifiers";
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
const DURATION_REGEX = /^-?P(([0-9]+Y)?([0-9]+M)?([0-9]+D)?(T([0-9]+H)?([0-9]+M)?([0-9]+(\.[0-9]+)?S)?)?)+$/;
const HASH_REGEX = /^0x[0-9A-Fa-f]{64}$/;
const SUPPORTED_ALGORITHMS = ["keccak256"];
const SUPPORTED_AUDIO_MEDIA_TYPES = ["audio/mpeg", "audio/ogg", "audio/webm"];
const SUPPORTED_IMAGE_MEDIA_TYPES = ["image/jpeg", "image/png", "image/svg+xml", "image/webp", "image/gif"];
const SUPPORTED_VIDEO_MEDIA_TYPES = ["video/mpeg", "video/ogg", "video/webm", "video/H256", "video/mp4"];

const invalidRecordMessage = (extra?: string): string => {
  return `${extra || "object"} is not a record type`;
};
const requireToString = (obj: unknown, name: string): string => {
  if (!isString(obj)) throw new InvalidActivityContentError(`${name} is not a string`);
  return obj as string;
};

const requireToArray = (obj: unknown, name: string): Array<unknown> => {
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

const toActivityContentAttachment = (obj: unknown): ActivityContentAttachment | undefined => {
  try {
    return requireToActivityContentAttachment(obj);
  } catch (e) {
    if (e instanceof InvalidActivityContentError) {
      console.error(e.toString());
      return undefined;
    }
    throw e;
  }
};

const requireValidDimensions = (obj: Record<string, unknown>, name?: string): boolean => {
  if (obj["height"] && !isNumber(obj["height"])) throw new InvalidActivityContentError(`${name} height is invalid`);
  if (obj["width"] && !isNumber(obj["width"])) throw new InvalidActivityContentError(`${name} width is invalid`);
  return true;
};

const requireValidDuration = (obj: Record<string, unknown>, contentType: string): boolean => {
  const duration = requireToString(obj["duration"], `${contentType} duration`);
  if (duration.length < 3 || !isValidDurationField(duration))
    throw new InvalidActivityContentError(`${contentType} duration is invalid`);
  return true;
};

/**
 * requireActivityContentAttachment validates an unknown object and returns it
 * as an ActivityContentAttachment type if valid, and throws an error if not.
 *
 * @param obj - the object to convert
 */
export const requireToActivityContentAttachment = (obj: unknown): ActivityContentAttachment => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage("ActivityContentAttachment")); // this check is required for type checking to work
  if (!obj["type"]) throw new InvalidActivityContentError("ActivityContentAttachment type is invalid");
  switch (obj["type"]) {
    case "Image":
      return requireToActivityContentImage(obj);
    case "Audio":
      return requireToActivityContentAudio(obj);
    case "Link":
      return requireToActivityContentLink(obj);
    case "Video":
      return requireToActivityContentVideo(obj);
    default:
      throw new InvalidActivityContentError("unknown ActivityContentAttachment type: " + obj["type"]);
  }
};

const requireIsMediaContentLink = (obj: Record<string, unknown>, name: string): boolean => {
  if (obj["type"] !== "Link") throw new InvalidActivityContentError(`${name} type is not 'Link'`);
  requireToString(obj["mediaType"], `${name} mediaType`);
  requireToString(obj["href"], `${name} href`);
  if (!isArrayOfType(obj["hash"], requireIsActivityContentHash))
    throw new InvalidActivityContentError(`${name} hash is invalid`);

  if (!hasAtLeastOneSupportedHashAlgorithm(obj["hash"]))
    throw new InvalidActivityContentError(
      "ActivityContent hash algorithms must contain at least one of: " + SUPPORTED_ALGORITHMS.join(",")
    );

  return true;
};

const requireIsActivityContentAudioLink = (obj: unknown): obj is ActivityContentAudioLink => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage("ActivityContentAudioLink"));
  requireIsMediaContentLink(obj, "ActivityContentAudioLink");
  return true;
};

const requireIsActivityContentImageLink = (obj: unknown): obj is ActivityContentImageLink => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage("ActivityContentImageLink"));
  requireIsMediaContentLink(obj, "ActivityContentImageLink");
  requireValidDimensions(obj, "ActivityContentImageLink");
  return true;
};

const requireIsActivityContentVideoLink = (obj: unknown): obj is ActivityContentVideoLink => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage("ActivityContentVideoLink"));
  requireIsMediaContentLink(obj, "ActivityContentVideoLink");
  requireValidDimensions(obj, "ActivityContentVideoLink");
  return true;
};

const requireToActivityContentLink = (obj: unknown): ActivityContentLink => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage("ActivityContentVideoLink"));
  if (obj["type"] !== "Link") throw new InvalidActivityContentError("ActivityContentLink type is not 'Link'");

  const href = requireToString(obj["href"], "ActivityContentLink href");
  if (!isValidHrefField(href)) throw new InvalidActivityContentError("ActivityContentLink href is invalid");

  if (obj["name"]) requireToString(obj["name"], "ActivityContentLink name");

  return { type: "Link", href: "", ...obj };
};

const requireIsActivityContentHash = (obj: unknown): obj is ActivityContentHash => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage("ActivityContentHash"));
  const hashVal = requireToString(obj["value"], "ActivityContentHash value field");
  if (!hashVal.match(HASH_REGEX)) throw new InvalidActivityContentError("ActivityContentHash value is invalid");

  requireToString(obj["algorithm"], "ActivityContentHash algorithm");
  return true;
};

const requireIsActivityContentLocation = (obj: unknown): obj is ActivityContentLocation => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage("ActivityContentLocation"));
  if (obj["type"] !== "Place") throw new InvalidActivityContentError("ActivityContentLocation type is not 'Place'");

  if (obj["name"]) requireToString(obj["name"], "ActivityContentLocation name");
  if (obj["units"]) requireToString(obj["units"], "ActivityContentLocation units");

  ["accuracy", "altitude", "latitude", "longitude", "radius"].forEach((dimension) => {
    if (obj[dimension] && !isNumber(obj[dimension]))
      throw new InvalidActivityContentError(`ActivityContentLocation ${dimension} is not a number`);
  });

  return true;
};

const requireIsActivityContentTag = (obj: unknown): obj is ActivityContentTag => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage("ActivityContentTag"));
  if (obj["type"] === "Mention") {
    return requireIsActivityContentMention(obj);
  }
  return requireIsActivityContentHashtag(obj);
};

const requireIsActivityContentHashtag = (obj: unknown): obj is ActivityContentHashtag => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage("ActivityContentHashtag")); // this check is required for type checking to work
  requireToString(obj["name"], "ActivityContentHashtag name");
  return true;
};

const requireIsActivityContentMention = (obj: unknown): obj is ActivityContentMention => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage("ActivityContentMention")); // this check is required for type checking to work
  if (!isDSNPUserURI(obj["id"]))
    throw new InvalidActivityContentError("ActivityContentMention id is not a valid DSNPUserURI");
  if (obj["name"]) requireToString(obj["name"], "ActivityContentMention name");
  return true;
};

/**
 * requireToActivityContentAudio validates then converts an unknown object type to an ActivityContentAudio
 * in a type safe way.  It throws an error if the object is not valid.
 *
 * @param obj - the object to convert
 */
const requireToActivityContentAudio = (obj: unknown): ActivityContentAudio => {
  const objectName = "ActivityContentAudio";

  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage(objectName)); // this check is required for type checking to work
  if (obj["name"]) requireToString(obj["name"], objectName + " name");
  if (obj["duration"]) requireValidDuration(obj, objectName);

  if (obj["type"] !== "Audio") throw new InvalidActivityContentError(`${objectName} type is not "Audio"`);

  if (!isArrayOfType(obj["url"], requireIsActivityContentAudioLink))
    throw new InvalidActivityContentError(`invalid ${objectName}Link`);

  if (!hasAtLeastOneSupportedAudioMediaType(obj["url"]))
    throw new InvalidActivityContentError(objectName + " has no supported media types");

  return { type: "Audio", url: [], ...obj };
};

/**
 * requireToActivityContentImage validates then converts an unknown object type to an ActivityContentImage
 * in a type safe way. It throws an error if the object is not valid.
 *
 * @param obj - the object to convert
 */
const requireToActivityContentImage = (obj: unknown): ActivityContentImage => {
  const objectName = "ActivityContentImage";

  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage(objectName)); // this check is required for type checking to work
  if (obj["name"]) requireToString(obj["name"], objectName + " name");

  if (obj["type"] !== "Image") throw new InvalidActivityContentError(`${objectName} type is not "Image"`);

  if (!isArrayOfType(obj["url"], requireIsActivityContentImageLink))
    throw new InvalidActivityContentError(`invalid ${objectName}Link`);

  if (!hasAtLeastOneSupportedImageMediaType(obj["url"]))
    throw new InvalidActivityContentError(`${objectName} has no supported media types`);

  return { type: "Image", url: [], ...obj };
};

/**
 * requireToActivityContentVideo validates then converts an unknown object type to an ActivityContentVideo
 * in a type safe way.  It throws an error if the object is not valid.
 *
 * @param obj - the object to convert
 */
const requireToActivityContentVideo = (obj: unknown): ActivityContentVideo => {
  const objectName = "ActivityContentVideo";
  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage(objectName)); // this check is required for type checking to work
  if (obj["name"]) requireToString(obj["name"], objectName + " name");
  if (obj["duration"]) requireValidDuration(obj, objectName);

  if (obj["type"] !== "Video") throw new InvalidActivityContentError("type is not 'Video'");

  if (!isArrayOfType(obj["url"], requireIsActivityContentVideoLink))
    throw new InvalidActivityContentError(`invalid ${objectName}Link`);

  if (!hasAtLeastOneSupportedVideoMediaType(obj["url"]))
    throw new InvalidActivityContentError(`${objectName} has no supported media types`);

  return { type: "Video", url: [], ...obj };
};

const requireIsActivityContentBaseType = (obj: unknown, typeName: string): boolean => {
  if (!isRecord(obj)) throw new InvalidActivityContentError("ActivityContentNote"); // this check is required for type checking to work
  if (obj["@context"] !== "https://www.w3.org/ns/activitystreams")
    throw new InvalidActivityContentError(`invalid ActivityContent${typeName} @context`);
  if (obj["type"] !== typeName) throw new InvalidActivityContentError(`invalid ActivityContent${typeName} type`);
  if (obj["name"]) requireToString(obj["name"], `ActivityContent${typeName} name`);
  if (obj["published"]) requireToString(obj["published"], `ActivityContent${typeName} published`);
  if (obj["tag"] && !isRecord(obj["tag"])) requireToArray(obj["tag"], `ActivityContent${typeName} tag`);
  if (obj["location"] && !isRecord(obj["location"]))
    throw new InvalidActivityContentError(invalidRecordMessage(`ActivityContent${typeName} location`));
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
 * @throws InvalidActivityContentError if type checks fail.
 */
export const requireIsActivityContentNoteType = (obj: unknown): obj is ActivityContentNote => {
  if (!isRecord(obj)) throw new InvalidActivityContentError("ActivityContentNote"); // this check is required for type checking to work
  requireIsActivityContentBaseType(obj, "Note");
  if (obj["mediaType"] !== "text/plain") throw new InvalidActivityContentError("invalid ActivityContentNote mediaType");
  if (obj["attachment"]) requireToArray(obj["attachment"], "ActivityContentNote attachment");
  return true;
};

/**
 * isActivityContentNoteType is a non-throwing version of `requireIsActivityContentNoteType`
 * Performs the same checks but catches InvalidActivityContentError and returns false instead.
 *
 * @param obj - The object to check
 * @returns a boolean - indicating if the object is an ActivityContentNote
 */
export const isActivityContentNoteType = (obj: unknown): obj is ActivityContentNote => {
  if (!isRecord(obj)) return false;
  try {
    requireIsActivityContentNoteType(obj);
  } catch (e) {
    if (e instanceof InvalidActivityContentError) return false;
    throw e;
  }
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
 * @returns true if the object is an ActivityContentProfile,otherwise throws an Error
 * @throws InvalidActivityContentError if type checks fail.
 */
export const requireIsActivityContentProfileType = (obj: unknown): obj is ActivityContentProfile => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(invalidRecordMessage("ActivityContentProfile"));
  requireIsActivityContentBaseType(obj, "Profile");
  if (obj["summary"]) requireToString(obj["summary"], "ActivityContentProfile summary");
  if (obj["icon"] && !isArrayOfType(obj["icon"], requireIsActivityContentImageLink))
    throw new InvalidActivityContentError("ActivityContentProfile icon is invalid");
  if (obj["attachment"]) requireToArray(obj["attachment"], "ActivityContentProfile attachment");
  return true;
};

/**
 * isActivityContentProfileType is a non-throwing version of `requireIsActivityContentProfileType`.
 * Performs the same checks but catches InvalidActivityContentError and returns false instead.
 *
 * @param obj - The object to check
 * @returns a boolean - indicating if the object is an ActivityContentProfile
 */
export const isActivityContentProfileType = (obj: unknown): obj is ActivityContentProfile => {
  if (!isRecord(obj)) return false;
  try {
    requireIsActivityContentProfileType(obj);
  } catch (e) {
    if (e instanceof InvalidActivityContentError) return false;
    throw e;
  }
  return true;
};

/**
 * requireGetSupportedContentAttachments iterates over the provided list and returns
 * the valid+supported attachments. If the passed in obj is empty, returns an empty array.
 * If there are attachments but none of them are valid+supported, it throws an error.
 * Attachments MUST first pass a type check to be considered valid at all.
 *
 * @param obj - an array of unknown object types to check for validity
 * @returns an array of all valid ActivityContentAttachments
 * @throws InvalidActivityContentError if there are no valid attachments with
 * supported Link attachments.
 *
 * Examples:
 * 1. One Image attachment with one URL that points to a TIFF file throws an error.
 * 2. One Image attachment with two URLs, one that is a TIFF and the other is JPG,
 *    does not throw.
 * 3. One Image attachment with two URLs, both are JPG, but one has a malformed
 *    hash of 0xdeadbeef (it's too short), throws an error due to failing
 *    the type check.
 * 4. Two Image attachments, the one from #2 and the one from #3, does NOT throw and
 *    returns just #2.
 */
export const requireGetSupportedContentAttachments = (obj: Array<unknown>): Array<ActivityContentAttachment> => {
  if (!obj.length) return [];
  const validTypeAttachments = obj.filter((attachment) => {
    return !!toActivityContentAttachment(attachment);
  });
  if (!validTypeAttachments.length) {
    for (const attachment of obj) {
      requireToActivityContentAttachment(attachment);
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
 * @returns true if valid
 * @throws InvalidActivityContentError if not valid, with a message
 */
export const requireValidActivityContentNote = (obj: unknown): boolean => {
  if (requireIsActivityContentNoteType(obj)) {
    if (obj["tag"]) requireIsActivityContentTag(obj["tag"]);

    if (obj["published"] && !isValidPublishedField(obj["published"]))
      throw new InvalidActivityContentError("ActivityContentNote published is invalid");
    if (obj["attachment"]) {
      const attachments = requireToArray(obj["attachment"], "ActivityContentNote attachment");
      requireGetSupportedContentAttachments(attachments);
    }
    if (obj["location"]) requireIsActivityContentLocation(obj["location"]);
  } else {
    throw new InvalidActivityContentError("ActivityContentNote is invalid for an unknown reason");
  }
  return true;
};

/**
 * requireValidActivityContentProfile() validates that a given object meets all
 * necessary specification requirements for an ActivityContentProfile object,
 * include string field formats and other logical validations. Note that this
 * function **does not** attempt to fetch any icons to validate that their
 * hashes are correct.
 *
 * @param obj - The object to check
 * @returns true if valid.
 * @throws InvalidActivityContentError if not valid, with a message
 */
export const requireValidActivityContentProfile = (obj: unknown): boolean => {
  if (requireIsActivityContentProfileType(obj)) {
    if (obj["tag"] && !isArrayOfType(obj["tag"], requireIsActivityContentTag)) requireIsActivityContentTag(obj["tag"]);

    if (obj["published"] && !isValidPublishedField(obj["published"]))
      throw new InvalidActivityContentError("ActivityContentProfile published is invalid");
    if (obj["icon"]) {
      for (const icon of obj["icon"]) {
        requireToActivityContentLink(icon);
      }
    }
    if (obj["location"]) requireIsActivityContentLocation(obj["location"]);
  } else {
    throw new InvalidActivityContentError("ActivityContentProfile is invalid for an unknown reason");
  }
  return true;
};
