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

const ISO8601_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-](\d{2}):(\d{2}))?$/;
const HREF_REGEX = /^https?:\/\/.+/;
const DURATION_REGEX = /^-?P[0-9]+Y?([0-9]+M)?([0-9]+D)?(T([0-9]+H)?([0-9]+M)?([0-9]+(\.[0-9]+)?S)?)?$/;
const HASH_REGEX = /^0x[0-9A-Fa-f]{64}$/;
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

const isActivityContentAttachment = (obj: unknown): obj is ActivityContentAttachment =>
  isActivityContentAudio(obj) ||
  isActivityContentImage(obj) ||
  isActivityContentVideo(obj) ||
  isActivityContentLink(obj);

const isActivityContentAudioLink = (obj: unknown): obj is ActivityContentAudioLink => {
  if (!isRecord(obj)) return false;
  if (obj["type"] !== "Link") return false;
  if (!isString(obj["href"])) return false;
  if (!isString(obj["mediaType"])) return false;
  if (!isArrayOfType(obj["hash"], isActivityContentHash)) return false;

  return true;
};

const isActivityContentImageLink = (obj: unknown): obj is ActivityContentImageLink => {
  if (!isRecord(obj)) return false;
  if (obj["type"] !== "Link") return false;
  if (!isString(obj["href"])) return false;
  if (!isString(obj["mediaType"])) return false;
  if (!isArrayOfType(obj["hash"], isActivityContentHash)) return false;

  if (obj["height"] && !isNumber(obj["height"])) return false;
  if (obj["width"] && !isNumber(obj["width"])) return false;

  return true;
};

const isActivityContentVideoLink = (obj: unknown): obj is ActivityContentVideoLink => {
  if (!isRecord(obj)) return false;
  if (obj["type"] !== "Link") return false;
  if (!isString(obj["href"])) return false;
  if (!isString(obj["mediaType"])) return false;
  if (!isArrayOfType(obj["hash"], isActivityContentHash)) return false;

  if (obj["height"] && !isNumber(obj["height"])) return false;
  if (obj["width"] && !isNumber(obj["width"])) return false;

  return true;
};

const isActivityContentHash = (obj: unknown): obj is ActivityContentHash => {
  if (!isRecord(obj)) return false;
  if (!isString(obj["algorithm"])) return false;

  return true;
};

const isActivityContentLocation = (obj: unknown): obj is ActivityContentLocation => {
  if (!isRecord(obj)) return false;
  if (obj["type"] !== "Place") return false;

  if (obj["name"] && !isString(obj["name"])) return false;
  if (obj["accuracy"] && !isNumber(obj["accuracy"])) return false;
  if (obj["altitude"] && !isNumber(obj["altitude"])) return false;
  if (obj["latitude"] && !isNumber(obj["latitude"])) return false;
  if (obj["longitude"] && !isNumber(obj["longitude"])) return false;
  if (obj["radius"] && !isNumber(obj["radius"])) return false;
  if (obj["units"] && !isString(obj["units"])) return false;

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

const isActivityContentAudio = (obj: unknown): obj is ActivityContentAudio => {
  if (!isRecord(obj)) return false;
  if (obj["type"] !== "Audio") return false;
  if (!isArrayOfType(obj["url"], isActivityContentAudioLink)) return false;

  if (obj["name"] && !isString(obj["name"])) return false;
  if (obj["duration"] && !isString(obj["duration"])) return false;

  return true;
};

const isActivityContentImage = (obj: unknown): obj is ActivityContentImage => {
  if (!isRecord(obj)) return false;
  if (obj["type"] !== "Image") return false;
  if (!isArrayOfType(obj["url"], isActivityContentImageLink)) return false;

  if (obj["name"] && !isString(obj["name"])) return false;

  return true;
};

const isActivityContentVideo = (obj: unknown): obj is ActivityContentVideo => {
  if (!isRecord(obj)) return false;
  if (obj["type"] !== "Video") return false;
  if (!isArrayOfType(obj["url"], isActivityContentVideoLink)) return false;

  if (obj["name"] && !isString(obj["name"])) return false;
  if (obj["duration"] && !isString(obj["duration"])) return false;

  return true;
};

const isActivityContentLink = (obj: unknown): obj is ActivityContentLink => {
  if (!isRecord(obj)) return false;
  if (obj["type"] !== "Link") return false;
  if (!isString(obj["href"])) return false;

  if (obj["name"] && !isString(obj["name"])) return false;

  return true;
};

/**
 * isActivityContentNote() is a type check function for ActivityContentNote
 * objects. Note that this function only checks that the given object meets the
 * type definition of an ActivityContentNote. It **does not** perform any logic
 * validations, such as checking the format of string fields or checking that
 * required attachments each include at least one supported format.
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is an ActivityContentNote
 */
export const isActivityContentNote = (obj: unknown): obj is ActivityContentNote => {
  if (!isRecord(obj)) return false;
  if (obj["@context"] !== "https://www.w3.org/ns/activitystreams") return false;
  if (obj["type"] !== "Note") return false;
  if (!isString(obj["content"])) return false;
  if (obj["mediaType"] !== "text/plain") return false;

  if (obj["name"] && !isString(obj["name"])) return false;
  if (obj["published"] && !isString(obj["published"])) return false;
  if (obj["attachment"] && !isArrayOfType(obj["attachment"], isActivityContentAttachment)) return false;
  if (obj["tag"] && !isArrayOfType(obj["tag"], isActivityContentTag)) return false;
  if (obj["location"] && !isArrayOfType(obj["location"], isActivityContentLocation)) return false;

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
  if (obj["icon"] && !isArrayOfType(obj["icon"], isActivityContentImageLink)) return false;
  if (obj["published"] && !isString(obj["published"])) return false;
  if (obj["tag"] && !isArrayOfType(obj["tag"], isActivityContentTag)) return false;
  if (obj["location"] && !isArrayOfType(obj["location"], isActivityContentLocation)) return false;

  return true;
};

const isValidHrefField = (obj: unknown): obj is string => {
  if (!isString(obj)) return false;
  if (!obj.match(HREF_REGEX)) return false;

  return true;
};

const isValidPublishedField = (obj: unknown): obj is string => {
  if (!isString(obj)) return false;
  if (!obj.match(ISO8601_REGEX)) return false;

  return true;
};

const isValidDurationField = (obj: unknown): obj is string => {
  if (!isString(obj)) return false;
  if (!obj.match(DURATION_REGEX)) return false;

  return true;
};

const isValidAttachmentField = (obj: unknown): obj is Array<ActivityContentAttachment> => {
  const attachmentValidators: Record<string, (obj: unknown) => boolean> = {
    Audio: isValidActivityContentAudio,
    Image: isValidActivityContentImage,
    Link: isValidActivityContentLink,
    Video: isValidActivityContentVideo,
  };
  if (!isArrayOfType(obj, isActivityContentAttachment)) return false;

  for (const attachment of obj) {
    if (!isRecord(attachment)) return false;
    if (!isString(attachment["type"])) return false;
    if (!attachmentValidators[attachment["type"]]) return false;
    if (!attachmentValidators[attachment["type"]](attachment)) return false;
  }

  return true;
};

const isValidActivityContentAudio = (obj: unknown): obj is ActivityContentAudio => {
  if (!isActivityContentAudio(obj)) return false;
  if (!isValidAudioLinkField(obj["url"])) return false;

  if (obj["duration"] && !isValidDurationField(obj["duration"])) return false;

  return true;
};

const isValidActivityContentImage = (obj: unknown): obj is ActivityContentImage => {
  if (!isActivityContentImage(obj)) return false;
  if (!isValidImageLinkField(obj["url"])) return false;

  return true;
};

const isValidActivityContentVideo = (obj: unknown): obj is ActivityContentVideo => {
  if (!isActivityContentVideo(obj)) return false;
  if (!isValidVideoLinkField(obj["url"])) return false;

  return true;
};

const isValidActivityContentLink = (obj: unknown): obj is ActivityContentLink => {
  if (!isActivityContentLink(obj)) return false;
  if (!isValidHrefField(obj["href"])) return false;

  return true;
};

const isValidAudioLinkField = (obj: unknown): obj is Array<ActivityContentAudioLink> => {
  if (!isArrayOfType(obj, isValidActivityContentAudioLink)) return false;

  for (const audioLink of obj) {
    if (SUPPORTED_AUDIO_MEDIA_TYPES.includes(audioLink["mediaType"])) return true;
  }

  return false;
};

const isValidImageLinkField = (obj: unknown): obj is Array<ActivityContentImageLink> => {
  if (!isArrayOfType(obj, isValidActivityContentImageLink)) return false;

  for (const imageLink of obj) {
    if (SUPPORTED_IMAGE_MEDIA_TYPES.includes(imageLink["mediaType"])) return true;
  }

  return false;
};

const isValidVideoLinkField = (obj: unknown): obj is Array<ActivityContentVideoLink> => {
  if (!isArrayOfType(obj, isValidActivityContentVideoLink)) return false;

  for (const videoLink of obj) {
    if (SUPPORTED_VIDEO_MEDIA_TYPES.includes(videoLink["mediaType"])) return true;
  }

  return false;
};

const isValidActivityContentAudioLink = (obj: unknown): obj is ActivityContentAudioLink => {
  if (!isActivityContentAudioLink(obj)) return false;
  if (!isValidHrefField(obj["href"])) return false;
  if (!isValidHashField(obj["hash"])) return false;

  return true;
};

const isValidActivityContentImageLink = (obj: unknown): obj is ActivityContentImageLink => {
  if (!isActivityContentImageLink(obj)) return false;
  if (!isValidHrefField(obj["href"])) return false;
  if (!isValidHashField(obj["hash"])) return false;

  if (obj["height"] && obj["height"] < 1) return false;
  if (obj["width"] && obj["width"] < 1) return false;

  return true;
};

const isValidActivityContentVideoLink = (obj: unknown): obj is ActivityContentVideoLink => {
  if (!isActivityContentVideoLink(obj)) return false;
  if (!isValidHrefField(obj["href"])) return false;
  if (!isValidHashField(obj["hash"])) return false;

  if (obj["height"] && obj["height"] < 1) return false;
  if (obj["width"] && obj["width"] < 1) return false;

  return true;
};

const isValidHashField = (obj: unknown): obj is Array<ActivityContentHash> => {
  if (!isArrayOfType(obj, isActivityContentHash)) return false;

  for (const hash of obj) {
    if (hash["algorithm"] === "keccak256" && isString(hash["value"]) && hash["value"].match(HASH_REGEX)) return true;
  }

  return false;
};

const isValidLocationField = (obj: unknown): obj is Array<ActivityContentLocation> => {
  if (!isArrayOfType(obj, isActivityContentLocation)) return false;

  for (const location of obj) {
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
  }

  return true;
};

/**
 * isValidActivityContentNote() validates that a given object meets all
 * necessary specification requirements for an ActivityContentNote object,
 * include string field formats and other logical validations. Note that this
 * function **does not** attempt to fetch any attachments to validate that their
 * hashes are correct.
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is a valid ActivityContentNote
 */
export const isValidActivityContentNote = (obj: unknown): obj is ActivityContentNote => {
  if (!isActivityContentNote(obj)) return false;

  if (obj["published"] && !isValidPublishedField(obj["published"])) return false;
  if (obj["attachment"] && !isValidAttachmentField(obj["attachment"])) return false;
  if (obj["location"] && !isValidLocationField(obj["location"])) return false;

  return true;
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
export const isValidActivityContentProfile = (obj: unknown): obj is ActivityContentProfile => {
  if (!isActivityContentProfile(obj)) return false;

  if (obj["published"] && !isValidPublishedField(obj["published"])) return false;
  if (obj["icon"] && !isValidImageLinkField(obj["icon"])) return false;
  if (obj["location"] && !isValidLocationField(obj["location"])) return false;

  return true;
};
