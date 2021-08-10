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
const SUPPORTED_URL_PROTOCOL = ["http:", "https:"];

const UNSUPPORTED_PROTOCOL_MESSAGE =
  "ActivityContentLink href protocol must be one of: " + SUPPORTED_URL_PROTOCOL.join(", ");

const InvalidRecordMessage = (extra?: string): string => {
  return `${extra || "object"} is not a record type`;
};

const requireActivityContentAttachment = (obj: unknown): obj is ActivityContentAttachment => {
  if (!isRecord(obj)) throw new InvalidActivityContentError("not a record: " + obj); // this check is required for type checking to work
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
  const href = requireIsString(obj["href"], `${name} href`);
  if (!isSupportedHrefProtocol(href)) {
    console.error("bad href:  ", href);
    throw new InvalidActivityContentError();
  }
  if (!isArrayOfType(obj["hash"], requireIsActivityContentHash))
    throw new InvalidActivityContentError(`${name} hash is invalid`);
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

const requireIsActivityContentLink = (obj: unknown): obj is ActivityContentLink => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentVideoLink"));
  if (obj["type"] !== "Link") throw new InvalidActivityContentError("ActivityContentLink type is not 'Link'");
  const href = requireIsString(obj["href"], "ActivityContentLink href");
  if (!isSupportedHrefProtocol(href)) throw new InvalidActivityContentError(UNSUPPORTED_PROTOCOL_MESSAGE);
  if (obj["name"]) requireIsString(obj["name"], "ActivityContentLink name");
  return true;
};

const requireIsActivityContentHash = (obj: unknown): obj is ActivityContentHash => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentHash"));
  const hashVal = requireIsString(obj["value"], "ActivityContentHash value field");
  if (!hashVal.match(HASH_REGEX)) throw new InvalidActivityContentError("ActivityContentHash value is invalid");

  const algo = requireIsString(obj["algorithm"], "ActivityContentHash algorithm");
  if (!SUPPORTED_ALGORITHMS.includes(algo))
    throw new InvalidActivityContentError("ActivityContentHash has unsupported algorithm");
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
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentAudio")); // this check is required for type checking to work
  if (obj["type"] !== "Audio") throw new InvalidActivityContentError('type is not "Audio"');

  if (!isArrayOfType(obj["url"], requireIsActivityContentAudioLink))
    throw new InvalidActivityContentError("invalid ActivityContentAudioLink");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentAudio name");
  if (obj["duration"]) requireIsString(obj["duration"], "ActivityContentAudio duration");

  return true;
};

const requireActivityContentImage = (obj: unknown): obj is ActivityContentImage => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentImage")); // this check is required for type checking to work
  if (obj["type"] !== "Image") throw new InvalidActivityContentError('"type" is not "Image"');

  if (!isArrayOfType(obj["url"], requireIsActivityContentImageLink))
    throw new InvalidActivityContentError("invalid ActivityContentImageLink");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentImage name");

  return true;
};

const requireActivityContentVideo = (obj: unknown): obj is ActivityContentVideo => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("")); // this check is required for type checking to work
  if (obj["type"] !== "Video") throw new InvalidActivityContentError("type is not 'Video'");

  if (!isArrayOfType(obj["url"], requireIsActivityContentVideoLink))
    throw new InvalidActivityContentError("invalid ActivityContentVideoLink");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentVideo name");
  if (obj["duration"]) requireIsString(obj["duration"], "ActivityContentVideo duration");

  return true;
};

const requireIsString = (obj: unknown, name: string): string => {
  if (!isString(obj)) throw new InvalidActivityContentError(`${name} is not a string`);
  return obj as string;
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
    if (requireIsActivityContentAudioLink(link)) return false;
  }

  return true;
};

const isValidActivityContentImage = (obj: ActivityContentImage): boolean => {
  if (!hasAtLeastOneSupportedImageMediaType(obj["url"])) return false;

  for (const link of obj["url"]) {
    if (!requireIsActivityContentImageLink(link)) return false;
  }

  return true;
};

const isValidActivityContentVideo = (obj: ActivityContentVideo): boolean => {
  if (!hasAtLeastOneSupportedVideoMediaType(obj["url"]))
    throw new InvalidActivityContentError("ActivityContentVideo url mediaType is unsupported");

  for (const link of obj["url"]) {
    if (!requireIsActivityContentVideoLink(link)) return false;
  }

  return true;
};

const isValidActivityContentLink = (obj: ActivityContentLink): boolean => isValidHrefField(obj["href"]);

const isSupportedHrefProtocol = (href: string): boolean => {
  const protocol = new URL(href).protocol;
  return SUPPORTED_URL_PROTOCOL.includes(protocol);
};

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

// const isValidActivityContentAudioLink = (obj: ActivityContentAudioLink): boolean => {
//   if (!isValidHrefField(obj["href"])) return false;
//   if (!hasAtLeastOneSupportedHashAlgorithm(obj["hash"])) return false;
//
//   return true;
// };
//
// const isValidActivityContentImageLink = (obj: ActivityContentImageLink): boolean => {
//   if (!isValidHrefField(obj["href"])) return false;
//   if (!hasAtLeastOneSupportedHashAlgorithm(obj["hash"])) return false;
//   requireValidDimensions(obj);
//   return true;
// };
//
// const isValidActivityContentVideoLink = (obj: ActivityContentVideoLink): boolean => {
//   if (!isValidHrefField(obj["href"])) return false;
//   if (!hasAtLeastOneSupportedHashAlgorithm(obj["hash"])) return false;
//   requireValidDimensions(obj);
//   return true;
// };
//
// const hasAtLeastOneSupportedHashAlgorithm = (obj: Array<ActivityContentHash>): boolean => {
//   for (const hash of obj) {
//     requireIsActivityContentHash(hash);
//   }
//   return true;
// };

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
  if (!isRecord(obj)) throw new InvalidActivityContentError("ActivityContentNote"); // this check is required for type checking to work

  if (obj["@context"] !== "https://www.w3.org/ns/activitystreams")
    throw new InvalidActivityContentError("invalid ActivityContentNote @context");
  if (obj["type"] !== "Note") throw new InvalidActivityContentError("invalid ActivityContentNote type");
  if (obj["mediaType"] !== "text/plain") throw new InvalidActivityContentError("invalid ActivityContentNote mediaType");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentNote name");
  if (obj["published"]) requireIsString(obj["published"], "ActivityContentNote published");

  if (obj["attachment"] && !isArrayOfType(obj["attachment"], requireActivityContentAttachment))
    throw new InvalidActivityContentError("ActivityContentNote has invalid ActivityContentAttachment");
  if (obj["tag"] && !isArrayOfType(obj["tag"], isActivityContentTag))
    throw new InvalidActivityContentError("invalid ActivityContentNote tag");
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
export const requireIsActivityContentProfile = (obj: unknown): obj is ActivityContentProfile => {
  if (!isRecord(obj)) throw new InvalidActivityContentError(InvalidRecordMessage("ActivityContentProfile"));
  if (obj["@context"] != "https://www.w3.org/ns/activitystreams")
    throw new InvalidActivityContentError("invalid ActivityContentProfile @context");
  if (obj["type"] !== "Profile") throw new InvalidActivityContentError("invalid ActivityContentProfile type");

  if (obj["name"]) requireIsString(obj["name"], "ActivityContentProfile name");
  if (obj["summary"]) requireIsString(obj["summary"], "ActivityContentProfile summary");

  if (obj["icon"] && !isArrayOfType(obj["icon"], requireIsActivityContentImageLink))
    throw new InvalidActivityContentError("ActivityContentProfile icon is invalid");

  if (obj["published"]) requireIsString(obj["published"], "ActivityContentProfile published");

  if (obj["tag"] && !isArrayOfType(obj["tag"], isActivityContentTag))
    throw new InvalidActivityContentError("ActivityContentProfile tag is invalid");

  if (obj["location"]) requireIsActivityContentLocation(obj["location"]);

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
      if (!isValidPublishedField(obj["published"] as string))
        throw new InvalidActivityContentError("ActivityContentNote published is invalid");
    }

    if (obj["attachment"]) {
      for (const attachment of obj["attachment"]) {
        requireIsActivityContentAttachment(attachment);
      }
    }
    if (obj["location"]) {
      if (!isValidActivityContentLocation(obj["location"]))
        throw new InvalidActivityContentError("location is not valid");
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
export const requireValidActivityContentProfile = (obj: unknown): void => {
  if (requireIsActivityContentProfile(obj)) {
    if (obj["published"] && !isValidPublishedField(obj["published"]))
      throw new InvalidActivityContentError("ActivityContentProfile published is invalid");
    if (obj["icon"]) {
      for (const icon of obj["icon"]) {
        requireIsActivityContentLink(icon);
      }
    }
    if (obj["location"]) {
      const locations = Array.isArray(obj["location"]) ? obj["location"] : [obj["location"]];
      for (const loc of locations) {
        if (!isValidActivityContentLocation(loc))
          throw new InvalidActivityContentError("ActivityContentProfile 1 or more locations are invalid");
      }
    }
  }
};
