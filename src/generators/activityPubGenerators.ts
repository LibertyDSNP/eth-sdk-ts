import { create, ActivityPub, ActivityPubAttachment } from "../core/activityPub/activityPub";
import { HexString } from "../types/Strings";

import { sample, sampleText } from "@dsnp/test-generators";

const PREFAB_FIRST_NAMES = sampleText.prefabFirstNames;
const PREFAB_LAST_NAMES = sampleText.prefabLastNames;
const PREFAB_URLS = sampleText.prefabURLs;
const PREFAB_VIDEOS = sampleText.prefabVideos;
/**
 * Generate a Note ActivityPub that is a reply to another Note
 *
 * @param address - the HexString socialAddress to associate with making this note
 * @param reply - The message string to display in the note
 * @param inReplyTo - the message ID of the original note.
 */
export const generateReply = (address: HexString, reply: string, inReplyTo: HexString): ActivityPub => {
  const note = generateNote(address, reply, true);
  note.inReplyTo = inReplyTo;
  return note;
};

/**
 * Generate a Note type ActivityPub
 *
 * @param address - the HexString socialAddress to associate with making this note
 * @param message - The message string to display in the note
 * @param hasAttachment - the NoteAttachments for pictures and videos in this Note.
 */
export const generateNote = (address: HexString, message: string, hasAttachment?: boolean): ActivityPub => {
  return create({
    attributedTo: address,
    "@context": "https://www.w3.org/ns/activitystreams",
    content: message,
    attachments: hasAttachment ? [generateImageAttachment()] : [],
    type: "Note",
  });
};

/**
 * Generate a Profile update. The type `Person` is not a `Profile`
 *
 * @param address - the HexString socialAddress to make this person update around
 * @param name - (optional) the new name of the profile update, or generate one.
 */
export const generatePerson = (address: HexString, name?: string): ActivityPub => {
  const newName = name ? name : [sample(PREFAB_FIRST_NAMES), sample(PREFAB_LAST_NAMES)].join(" ");
  return create({
    attributedTo: address,
    "@context": "https://www.w3.org/ns/activitystreams",
    name: newName,
    url: "",
    type: "Person",
  });
};

/**
 * Generate an image NoteAttachment from a given url, or use the random image URL.
 *
 * @param url - The url to generate the NoteAttachment around
 */
export const generateImageAttachment = (url?: string): ActivityPubAttachment => {
  const theURL = url ? url : sample(PREFAB_URLS);
  return {
    mediaType: theURL.replace(/(^\w+:|^)\/\//, ""), // Regex to scrub protocol from string
    type: "Image",
    url: theURL,
  };
};

/**
 * Generate a video NoteAttachment from a given url, or use a random one.
 *
 * @param url - The url to generate the NoteAttachment around
 */
export const generateVideoAttachment = (url?: string): ActivityPubAttachment => {
  const theURL = url ? url : sample(PREFAB_VIDEOS);
  return {
    mediaType: theURL.replace(/(^\w+:|^)\/\//, ""), // Regex to scrub protocol from string
    type: "Video",
    url: theURL,
  };
};
