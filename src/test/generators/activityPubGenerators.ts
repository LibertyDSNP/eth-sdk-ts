import { ActivityPub, ActivityPubAttachment } from "../../activityPub/activityPub";
import { HexString } from "../../types/Strings";
import {
  prefabFirstNames,
  prefabLastNames,
  prefabURLs,
  prefabVideos,
} from "@dsnp/test-generators/dist/types/sampleText";
import { sample } from "@dsnp/test-generators";

/**
 * Generate a Note ActivityPub that is a reply to another Note
 * @param address the HexString socialAddress to associate with making this note
 * @param reply The message string to display in the note
 * @param inReplyTo the message ID of the original note.
 */
export const generateReply = (address: HexString, reply: string, inReplyTo: HexString): ActivityPub => {
  const note = generateNote(address, reply, true);
  note.inReplyTo = inReplyTo;
  return note;
};

/**
 * Generate a Note type ActivityPub
 * @param address the HexString socialAddress to associate with making this note
 * @param message The message string to display in the note
 * @param attachment the NoteAttachments for pictures and videos in this Note.
 */
export const generateNote = (address: HexString, message: string, attachment?: boolean): ActivityPub => {
  return {
    attributedTo: address,
    "@context": "https://www.w3.org/ns/activitystreams",
    content: message,
    attachments: attachment ? JSON.stringify(generateImageAttachment()) : "",
    type: "Note",
  };
};

/**
 * Generate a Profile update. The type `Person` is not a `Profile`
 * @param address the HexString socialAddress to make this person update around
 * @param name (optional) the new name of the profile update, or generate one.
 * @param username (optional) the new username of the profile update TODO
 */
export const generatePerson = (address: HexString, name?: string): ActivityPub => {
  const newName = name ? name : [sample(prefabFirstNames), sample(prefabLastNames)].join(" ");
  return {
    attributedTo: address,
    "@context": "https://www.w3.org/ns/activitystreams",
    name: newName,
    // preferredUsername: username || "",
    url: "",
    type: "Person",
  };
};

/**
 * Generate an image NoteAttachment from a given url, or use the random image URL.
 * @param url The url to generate the NoteAttachment around
 */
export const generateImageAttachment = (url?: string): ActivityPubAttachment => {
  const theURL = url ? url : sample(prefabURLs);
  return {
    mediaType: theURL.replace(/(^\w+:|^)\/\//, ""), // Regex to scrub protocol from string
    type: "Image",
    url: theURL,
  };
};

/**
 * Generate a video NoteAttachment from a given url, or use a random one.
 * @param url The url to generate the NoteAttachment around
 */
export const generateVideoAttachment = (url?: string): ActivityPubAttachment => {
  const theURL = url ? url : sample(prefabVideos);
  return {
    mediaType: theURL.replace(/(^\w+:|^)\/\//, ""), // Regex to scrub protocol from string
    type: "Video",
    url: theURL,
  };
};
