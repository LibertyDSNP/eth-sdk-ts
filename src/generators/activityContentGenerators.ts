import { sample, sampleText } from "@dsnp/test-generators";

import {
  createNote,
  createPerson,
  ActivityContentNote,
  ActivityContentPerson,
  ActivityContentImage,
  ActivityContentVideo,
} from "../core/activityContent";
import { getRandomHex } from "../core/utilities/random";

const PREFAB_FIRST_NAMES = sampleText.prefabFirstNames;
const PREFAB_LAST_NAMES = sampleText.prefabLastNames;
const PREFAB_URLS = sampleText.prefabURLs;
const PREFAB_VIDEOS = sampleText.prefabVideos;

/**
 * Generate an ActivityContentNote object
 *
 * @param content - The message string to display in the note
 * @param hasAttachment - the NoteAttachments for pictures and videos in this Note.
 */
export const generateNote = (content: string, hasAttachment?: boolean): ActivityContentNote => {
  if (hasAttachment) return createNote(content, { attachment: [generateImageAttachment()] });
  return createNote(content);
};

/**
 * Generate an ActivityContentPerson object
 *
 * @param name - The new display name of the person or generate one.
 */
export const generatePerson = (name?: string): ActivityContentPerson => {
  const newName = name ? name : [sample(PREFAB_FIRST_NAMES), sample(PREFAB_LAST_NAMES)].join(" ");
  return createPerson(newName);
};

/**
 * Generate an image NoteAttachment from a given url, or use the random image URL.
 *
 * @param url - The url to generate the NoteAttachment around
 */
export const generateImageAttachment = (url?: string): ActivityContentImage => {
  const theURL = url ? url : sample(PREFAB_URLS);
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Image",
    published: new Date().toISOString(),
    url: theURL,
    hash: {
      algorithm: "keccak256",
      value: getRandomHex(),
    },
    mediaType: theURL.replace(/(^\w+:|^)\/\//, ""),
    height: 1024,
    width: 768,
  };
};

/**
 * Generate a video NoteAttachment from a given url, or use a random one.
 *
 * @param url - The url to generate the NoteAttachment around
 */
export const generateVideoAttachment = (url?: string): ActivityContentVideo => {
  const theURL = url ? url : sample(PREFAB_VIDEOS);
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Video",
    published: new Date().toISOString(),
    url: theURL,
    hash: {
      algorithm: "keccak256",
      value: getRandomHex(),
    },
    mediaType: theURL.replace(/(^\w+:|^)\/\//, ""),
    height: 1024,
    width: 768,
  };
};
