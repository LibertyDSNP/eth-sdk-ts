import {
  ActivityContent,
  ActivityContentLink,
  ActivityContentNote,
  ActivityContentPerson,
  ActivityContentAudio,
  ActivityContentImage,
  ActivityContentProfile,
  ActivityContentVideo,
  ActivtyContentHash,
} from "./factories";
import { isRecord, isString, isNumber } from "../utilities/validation";

const ISO8601_REGEX = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-](\d{2}):(\d{2}))?/;
const URL_REGEX = /^https:\/\/.+/;

const isValidURLField = (obj: unknown): boolean => {
  if (isString(obj)) {
    return !!obj.match(URL_REGEX);
  }
  return isActivityContentLink(obj);
};

const isValidHashField = (obj: unknown): boolean => {
  if (Array.isArray(obj)) {
    for (const subobj in obj) {
      if (!isActivityContentHash(subobj)) return false;
    }
    return true;
  }
  return isActivityContentHash(obj);
};

/**
 * isActivityContentHash is a type check function for ActivityContentHash objects
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is an ActivityContentHash
 */
export const isActivityContentHash = (obj: unknown): obj is ActivtyContentHash => {
  if (!isRecord(obj)) return false;
  if (!isString(obj["algorithm"])) return false;

  return true;
};

/**
 * isActivityContentLink is a type check function for ActivityContentLink objects
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is an ActivityContentLink
 */
export const isActivityContentLink = (obj: unknown): obj is ActivityContentLink => {
  if (!isRecord(obj)) return false;
  if (obj["@context"] != "https://www.w3.org/ns/activitystreams") return false;
  if (!isString(obj["type"])) return false;
  if (!isString(obj["published"]) || !obj["published"].match(ISO8601_REGEX)) return false;
  if (!obj["href"] || typeof obj["href"] != "string" || !obj["href"].match(URL_REGEX)) return false;

  return true;
};

/**
 * isActivityContentNote is a type check function for ActivityContentNote objects
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is an ActivityContentNote
 */
export const isActivityContentNote = (obj: unknown): obj is ActivityContentNote => {
  if (!isRecord(obj)) return false;
  if (obj["@context"] != "https://www.w3.org/ns/activitystreams") return false;
  if (!isString(obj["type"])) return false;
  if (!isString(obj["published"]) || !obj["published"].match(ISO8601_REGEX)) return false;
  if (!isString(obj["content"])) return false;

  return true;
};

/**
 * isActivityContentPerson is a type check function for ActivityContentPerson objects
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is an ActivityContentPerson
 */
export const isActivityContentPerson = (obj: unknown): obj is ActivityContentPerson => {
  if (!isRecord(obj)) return false;
  if (obj["@context"] != "https://www.w3.org/ns/activitystreams") return false;
  if (!isString(obj["type"])) return false;
  if (!isString(obj["published"]) || !obj["published"].match(ISO8601_REGEX)) return false;
  if (!isString(obj["name"])) return false;

  return true;
};

/**
 * isActivityContentAudio is a type check function for ActivityContentAudio objects
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is an ActivityContentAudio
 */
export const isActivityContentAudio = (obj: unknown): obj is ActivityContentAudio => {
  if (!isRecord(obj)) return false;
  if (obj["@context"] != "https://www.w3.org/ns/activitystreams") return false;
  if (!isString(obj["type"])) return false;
  if (!isString(obj["published"]) || !obj["published"].match(ISO8601_REGEX)) return false;
  if (!isValidURLField(obj["url"])) return false;
  if (!isString(obj["mediaType"])) return false;
  if (!isValidHashField(obj["hash"])) return false;

  return true;
};

/**
 * isActivityContentImage is a type check function for ActivityContentImage objects
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is an ActivityContentImage
 */
export const isActivityContentImage = (obj: unknown): obj is ActivityContentImage => {
  if (!isRecord(obj)) return false;
  if (obj["@context"] != "https://www.w3.org/ns/activitystreams") return false;
  if (!isString(obj["type"])) return false;
  if (!isString(obj["published"]) || !obj["published"].match(ISO8601_REGEX)) return false;
  if (!isValidURLField(obj["url"])) return false;
  if (!isString(obj["mediaType"])) return false;
  if (!isValidHashField(obj["hash"])) return false;
  if (!isNumber(obj["height"])) return false;
  if (!isNumber(obj["width"])) return false;

  return true;
};

/**
 * isActivityContentProfile is a type check function for ActivityContentProfile objects
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is an ActivityContentProfile
 */
export const isActivityContentProfile = (obj: unknown): obj is ActivityContentProfile => {
  if (!isRecord(obj)) return false;
  if (obj["@context"] != "https://www.w3.org/ns/activitystreams") return false;
  if (!isString(obj["type"])) return false;
  if (!isString(obj["published"]) || !obj["published"].match(ISO8601_REGEX)) return false;
  if (!isRecord(obj["describes"])) return false;
  if (!isActivityContentPerson(obj["describes"])) return false;

  return true;
};

/**
 * isActivityContentVideo is a type check function for ActivityContentVideo objects
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is an ActivityContentVideo
 */
export const isActivityContentVideo = (obj: unknown): obj is ActivityContentVideo => {
  if (!isRecord(obj)) return false;
  if (obj["@context"] != "https://www.w3.org/ns/activitystreams") return false;
  if (!isString(obj["type"])) return false;
  if (!isString(obj["published"]) || !obj["published"].match(ISO8601_REGEX)) return false;
  if (!isValidURLField(obj["url"])) return false;
  if (!isString(obj["mediaType"])) return false;
  if (!isValidHashField(obj["hash"])) return false;
  if (!isNumber(obj["height"])) return false;
  if (!isNumber(obj["width"])) return false;

  return true;
};

/**
 * isActivityContent is a type check function for ActivityContent objects
 *
 * @param obj - The object to check
 * @returns A boolean indicating whether or not the object is an ActivityContent
 */
export const isActivityContent = (obj: unknown): obj is ActivityContent => {
  if (!isRecord(obj)) return false;
  if (obj["@context"] != "https://www.w3.org/ns/activitystreams") return false;
  if (!isString(obj["type"])) return false;
  if (!isString(obj["published"]) || !obj["published"].match(ISO8601_REGEX)) return false;

  return true;
};

/**
 * isValid() returns true if the object provided is a valid activity content
 * object. Otherwise, it returns false.
 *
 * @param obj - An obj to be validated
 * @returns True or false depending on whether the given obj is a valid
 */
export const isValidActivityContent = (obj: unknown): obj is ActivityContent => {
  if (!isActivityContent(obj)) return false;

  const validator = {
    Link: isActivityContentLink,
    Note: isActivityContentNote,
    Person: isActivityContentPerson,
    Audio: isActivityContentAudio,
    Image: isActivityContentImage,
    Profile: isActivityContentProfile,
    Video: isActivityContentVideo,
  }[obj["type"]];

  if (validator) return validator(obj);

  return true;
};
