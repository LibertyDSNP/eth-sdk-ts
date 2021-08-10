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

const requireActivityContentAttachment = (obj: unknown): obj is ActivityContentAttachment => {
  if (!isRecord(obj)) throw new Error("not a record: " + obj); // this check is required for type checking to work
  switch (obj["type"]) {
    case "Image":
      return requireActivityContentImage(obj);
    case "Audio":
      return requireActivityContentAudio(obj);
    case "Link":
      return requireActivityContentLink(obj);
    case "Video":
      return requireActivityContentVideo(obj);
    default:
      throw new Error("unknown activity content type: " + obj["type"]);
  }
};

const requireIsContentLink = (obj: Record<string, unknown>, name: string): boolean => {
  if (obj["type"] !== "Link") throw new Error(`${name} type is not 'Link'`);
  requireIsString(obj["href"], `${name} href`);
  requireIsString(obj["mediaType"], `${name} mediaType`);
  if (!isArrayOfType(obj["hash"], requireValidActivityContentHash)) throw new Error(`${name} hash is invalid`);
  return true;
};

const requireValidDimensions = (obj: Record<string, unknown>, name?: string): boolean => {
  if (obj["height"] && !isNumber(obj["height"])) throw new Error(`${name} height is invalid`);
  if (obj["width"] && !isNumber(obj["width"])) throw new Error(`${name} width is invalid`);
  return true;
};

const requireIsActivityContentAudioLink = (obj: unknown): obj is ActivityContentAudioLink => {
  if (!isRecord(obj)) throw new Error("ActivityContentAudioLink is not a record");
  requireIsContentLink(obj, "ActivityContentAudioLink");
  return true;
};

const requireIsActivityContentImageLink = (obj: unknown): obj is ActivityContentImageLink => {
  if (!isRecord(obj)) throw new Error("ActivityContentImageLink is not a record");
  requireIsContentLink(obj, "ActivityContentImageLink");
  requireValidDimensions(obj, "ActivityContentImageLink");
  return true;
};

const requireIsActivityContentVideoLink = (obj: unknown): obj is ActivityContentVideoLink => {
  if (!isRecord(obj)) throw new Error("ActivityContentVideoLink is not a record");
  requireIsContentLink(obj, "ActivityContentVideoLink");
  requireValidDimensions(obj, "ActivityContentVideoLink");
  return true;
};

const requireActivityContentLink = (obj: unknown): obj is ActivityContentLink => {
  if (!isRecord(obj)) throw new Error("ActivityContentVideoLink is not a record");
  if (obj["type"] !== "Link") throw new Error("ActivityContentLink type is not 'Link'");
  requireIsString(obj["href"], "ActivityContentLink href");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentLink name");

  return true;
};

const requireValidActivityContentHash = (obj: unknown): obj is ActivityContentHash => {
  if (!isRecord(obj)) throw new Error("ActivityContentHash is not a record");
  const hashVal = requireIsString(obj["value"], "ActivityContentHash value field");
  if (!hashVal.match(HASH_REGEX)) throw new Error("ActivityContentHash value is invalid");

  const algo = requireIsString(obj["algorithm"], "ActivityContentHash algorithm");
  if (!SUPPORTED_ALGORITHMS.includes(algo)) throw new Error("ActivityContentHash has unsupported algorithm");
  return true;
};

const requireIsActivityContentLocation = (obj: unknown): obj is ActivityContentLocation => {
  if (!isRecord(obj)) throw new Error("ActivityContentLocation is not a record");
  if (obj["type"] !== "Place") throw new Error("ActivityContentLocation type is not 'Place'");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentLocation name");
  if (obj["units"]) requireIsString(obj["units"], "ActivityContentLocation units");

  if (obj["accuracy"] && !isNumber(obj["accuracy"])) return false;
  if (obj["altitude"] && !isNumber(obj["altitude"])) return false;
  if (obj["latitude"] && !isNumber(obj["latitude"])) return false;
  if (obj["longitude"] && !isNumber(obj["longitude"])) return false;
  if (obj["radius"] && !isNumber(obj["radius"])) return false;

  return true;
};

const isActivityContentTag = (obj: unknown): obj is ActivityContentTag =>
  isActivityContentHashtag(obj) || isActivityContentMention(obj);

const isActivityContentHashtag = (obj: unknown): obj is ActivityContentHashtag => {
  if (!isRecord(obj)) return false;
  if (obj["type"] !== undefined) return false;
  if (!isString(obj["name"])) return false;

  return true;
};

const isActivityContentMention = (obj: unknown): obj is ActivityContentMention => {
  if (!isRecord(obj)) return false;
  if (obj["type"] !== "Mention") return false;
  if (!isDSNPUserId(obj["id"])) return false;

  if (obj["name"] && !isString(obj["name"])) return false;

  return true;
};

const requireActivityContentAudio = (obj: unknown): obj is ActivityContentAudio => {
  if (!isRecord(obj)) throw new Error("not a record"); // this check is required for type checking to work
  if (obj["type"] !== "Audio") throw new Error('type is not "Audio"');
  if (!isArrayOfType(obj["url"], requireIsActivityContentAudioLink))
    throw new Error("invalid ActivityContentAudioLink");

  if (obj["name"]) requireIsString(obj["name"]);
  if (obj["duration"]) requireIsString(obj["duration"]);

  return true;
};

const requireActivityContentImage = (obj: unknown): obj is ActivityContentImage => {
  if (!isRecord(obj)) return false; // this check is required for type checking to work
  if (obj["type"] !== "Image") throw new Error('"type" is not "Image"');
  if (!isArrayOfType(obj["url"], requireIsActivityContentImageLink))
    throw new Error("invalid ActivityContentImageLink");
  if (obj["name"]) requireIsString(obj["name"]);
  return true;
};

const requireActivityContentVideo = (obj: unknown): obj is ActivityContentVideo => {
  if (!isRecord(obj)) throw new Error("not a record"); // this check is required for type checking to work
  if (obj["type"] !== "Video") throw new Error("invalid video type");
  if (!isArrayOfType(obj["url"], requireIsActivityContentVideoLink))
    throw new Error("invalid ActivityContentVideoLink");

  if (obj["name"]) requireIsString(obj["name"]);
  if (obj["duration"]) requireIsString(obj["duration"]);

  return true;
};

const requireIsString = (obj: unknown, name?: string): string => {
  if (!isString(obj)) throw new Error(`${name} is not a string`);
  return obj as string;
};

/**
 * requireActivityContentNoteType() is a type check function for ActivityContentNote
 * objects. Note that this function only checks that the given object meets the
 * type definition of an ActivityContentNote. It **does not** perform any logic
 * validations, such as checking the format of string fields or checking that
 * required attachments each include at least one supported format.
 *
 * @param obj - The object to check
 * @returns true if the object is an ActivityContentNote, otherwise throws an Error.
 */
export const requireActivityContentNoteType = (obj: unknown): obj is ActivityContentNote => {
  if (!isRecord(obj)) throw new Error("ActivityContentNote is not a record"); // this check is required for type checking to work
  requireIsString(obj["content"]);

  if (obj["@context"] !== "https://www.w3.org/ns/activitystreams") throw new Error("invalid @context");
  if (obj["type"] !== "Note") throw new Error("invalid type");
  if (obj["mediaType"] !== "text/plain") throw new Error("invalid mediaType");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentNote name");
  if (obj["published"]) requireIsString(obj["published"], "ActivityContentNote published");

  if (obj["attachment"] && !isArrayOfType(obj["attachment"], requireActivityContentAttachment))
    throw new Error("invalid ActivityContentAttachment");
  if (obj["tag"] && !isArrayOfType(obj["tag"], isActivityContentTag))
    throw new Error("invalid ActivityContentNote tag");
  if (obj["location"]) requireIsActivityContentLocation(obj["location"]);

  return true;
};

/**
 * isActivityContentProfile() is a type check function for
 * ActivityContentProfile objects. Note that this function only checks that the
 * given object meets the type definition of an ActivityContentProfile. It
 * does not** perform any logic validations, such as checking the format of
 * string fields or checking that the icon field includes at least one supported
 * image format.
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is an ActivityContentProfile
 */
export const isActivityContentProfile = (obj: unknown): obj is ActivityContentProfile => {
  if (!isRecord(obj)) return false;
  if (obj["@context"] != "https://www.w3.org/ns/activitystreams") return false;
  if (obj["type"] !== "Profile") return false;

  if (obj["name"] && !isString(obj["name"])) return false;
  if (obj["summary"] && !isString(obj["name"])) return false;
  if (obj["icon"] && !isArrayOfType(obj["icon"], requireIsActivityContentImageLink)) return false;
  if (obj["published"] && !isString(obj["published"])) return false;
  if (obj["tag"] && !isArrayOfType(obj["tag"], isActivityContentTag)) return false;
  if (obj["location"]) requireIsActivityContentLocation(obj["location"]);

  return true;
};

const isValidHrefField = (obj: string): boolean => obj.match(HREF_REGEX) !== null;

const isValidPublishedField = (obj: string): boolean => obj.match(ISO8601_REGEX) !== null;

const isValidDurationField = (obj: string): boolean => obj.match(DURATION_REGEX) !== null;

const requireIsActivityContentAttachment = (obj: ActivityContentAttachment): boolean =>
  (({
    Audio: isValidActivityContentAudio,
    Image: isValidActivityContentImage,
    Video: isValidActivityContentVideo,
    Link: isValidActivityContentLink,
  }[obj["type"]] as (o: ActivityContentAttachment) => boolean)(obj));

const isValidActivityContentAudio = (obj: ActivityContentAudio): boolean => {
  if (obj["duration"] && !isValidDurationField(obj["duration"])) return false;
  if (!hasAtLeastOneSupportedAudioMediaType(obj["url"])) return false;

  for (const link of obj["url"]) {
    if (!isValidActivityContentAudioLink(link)) return false;
  }

  return true;
};

const isValidActivityContentImage = (obj: ActivityContentImage): boolean => {
  if (!hasAtLeastOneSupportedImageMediaType(obj["url"])) return false;

  for (const link of obj["url"]) {
    if (!isValidActivityContentImageLink(link)) return false;
  }

  return true;
};

const isValidActivityContentVideo = (obj: ActivityContentVideo): boolean => {
  if (!hasAtLeastOneSupportedVideoMediaType(obj["url"])) return false;

  for (const link of obj["url"]) {
    if (!isValidActivityContentVideoLink(link)) return false;
  }

  return true;
};

const isValidActivityContentLink = (obj: ActivityContentLink): boolean => isValidHrefField(obj["href"]);

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

const isValidActivityContentAudioLink = (obj: ActivityContentAudioLink): boolean => {
  if (!isValidHrefField(obj["href"])) return false;
  if (!hasAtLeastOneSupportedHashAlgorithm(obj["hash"])) return false;

  return true;
};

const isValidActivityContentImageLink = (obj: ActivityContentImageLink): boolean => {
  if (!isValidHrefField(obj["href"])) return false;
  if (!hasAtLeastOneSupportedHashAlgorithm(obj["hash"])) return false;

  if (obj["height"] && obj["height"] < 1) return false;
  if (obj["width"] && obj["width"] < 1) return false;

  return true;
};

const isValidActivityContentVideoLink = (obj: ActivityContentVideoLink): boolean => {
  if (!isValidHrefField(obj["href"])) return false;
  if (!hasAtLeastOneSupportedHashAlgorithm(obj["hash"])) return false;

  if (obj["height"] && obj["height"] < 1) return false;
  if (obj["width"] && obj["width"] < 1) return false;

  return true;
};

const hasAtLeastOneSupportedHashAlgorithm = (obj: Array<ActivityContentHash>): boolean => {
  for (const hash of obj) {
    requireValidActivityContentHash(hash);
  }

  return false;
};

const isValidActivityContentLocation = (location: ActivityContentLocation): boolean => {
  if (location["accuracy"]) {
    if (!isNumber(location["accuracy"])) return false;
    if (location["accuracy"] < 0) return false;
    if (location["accuracy"] > 100) return false;
  }
  if (location["latitude"]) {
    if (!isNumber(location["latitude"])) return false;
    if (location["latitude"] < -90) return false;
    if (location["latitude"] > 90) return false;
  }
  if (location["longitude"]) {
    if (!isNumber(location["longitude"])) return false;
    if (location["longitude"] < -180) return false;
    if (location["longitude"] > 180) return false;
  }
  if (location["units"]) {
    if (!isString(location["units"])) return false;
    if (
      location["units"] !== "cm" &&
      location["units"] !== "feet" &&
      location["units"] !== "inches" &&
      location["units"] !== "km" &&
      location["units"] !== "m" &&
      location["units"] !== "miles"
    )
      return false;
  }

  return true;
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
    if (obj["published"]) {
      requireIsString(obj["published"], "ActivityContentNote published");
      if (!isValidPublishedField(obj["published"] as string)) throw new Error("published is not a valid value");
    }

    if (obj["attachment"]) {
      for (const attachment of obj["attachment"]) {
        requireIsActivityContentAttachment(attachment);
      }
    }
    if (obj["location"]) {
      if (!isValidActivityContentLocation(obj["location"])) throw new Error("location is not valid");
    }
  }
};

/**
 * isValidActivityContentProfile() validates that a given object meets all
 * necessary specification requirements for an ActivityContentProfile object,
 * include string field formats and other logical validations. Note that this
 * function **does not** attempt to fetch any icons to validate that their
 * hashes are correct.
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is a valid ActivityContentProfile
 */
export const isValidActivityContentProfile = (obj: unknown): boolean => {
  if (!isActivityContentProfile(obj)) return false;

  if (obj["published"] && !isValidPublishedField(obj["published"])) return false;
  if (obj["icon"]) {
    for (const icon of obj["icon"]) {
      if (!isValidActivityContentImageLink(icon)) return false;
    }
  }
  if (obj["location"]) {
    if (Array.isArray(obj["location"])) {
      for (const location of obj["location"]) {
        if (!isValidActivityContentLocation(location)) return false;
      }
    } else {
      if (!isValidActivityContentLocation(obj["location"])) return false;
    }
  }

  return true;
};
