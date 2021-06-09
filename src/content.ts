import * as activityPub from "./core/activityPub/activityPub";
import * as batchMessages from "./core/batch/batchMesssages";
import * as config from "./config";
import * as messages from "./core/messages/messages";
import * as store from "./core/store/store";
import { getRandomString, validateDSNPId, MissingUser } from "./core/utilities";

/**
 * InvalidActivityPubOpts represents an error in the activity pub options
 * provided to a method.
 */
export const InvalidActivityPubOpts = new Error("Invalid activity pub options.");

/**
 * InvalidInReplyTo represents an error in the DSNP Id provided for the
 * inReplyTo parameter.
 */
export const InvalidInReplyTo = new Error("Invalid DSNP Id for inReplyTo");

/**
 * broadcast() creates an activity pub file with the given content options,
 * uploads it with a random filename using the configured storage adapter and
 * creates a DSNP broadcast message for the hosted file for later announcement.
 *
 * @throws {@link MissingSigner}
 * Thrown if the signer is not configured.
 *
 * @param contentOptions Options for the activity pub content to generate
 * @param opts           Optional. Configuration overrides, such as from address, if any
 * @returns              A Signed DSNP Broadcast message ready for inclusion in a batch
 */
export const broadcast = async (
  contentOptions: activityPub.ActivityPubOpts,
  opts?: config.ConfigOpts
): Promise<batchMessages.BatchBroadcastMessage> => {
  // Create the activity pub file
  const contentObj = activityPub.create(contentOptions);
  if (!activityPub.validate(contentObj)) throw InvalidActivityPubOpts;
  const content = activityPub.serialize(contentObj);

  // Upload the content file
  const filename = getRandomString();
  const uri = await store.put(filename, content, opts);

  // Get current user id
  const { currentFromId } = await config.getConfig(opts);
  if (!currentFromId) throw MissingUser;

  // Creates and returns the DSNP Broadcast message
  const contentHash = activityPub.hash(contentObj);
  const message = messages.createBroadcastMessage(currentFromId, uri.toString(), contentHash);

  // Sign and return the message
  const signedMessage = await messages.sign(message, opts);
  return signedMessage as batchMessages.BatchBroadcastMessage;
};

/**
 * reply() creates an activity pub file with the given content options,
 * uploads it with a random filename using the configured storage adapter and
 * creates a DSNP reply message for the hosted file for later announcement.
 *
 * @param contentOptions Options for the activity pub content to generate
 * @param inReplyTo      The DSNP Id of the message that this message is in reply to
 * @param opts           Optional. Configuration overrides, such as from address, if any
 * @returns              A Signed DSNP Reply message ready for inclusion in a batch
 */
export const reply = async (
  contentOptions: activityPub.ActivityPubOpts,
  inReplyTo: string,
  opts?: config.ConfigOpts
): Promise<batchMessages.BatchReplyMessage> => {
  // Validate inReplyTo
  if (!validateDSNPId(inReplyTo)) throw InvalidInReplyTo;

  // Create the activity pub file
  const contentObj = activityPub.create(contentOptions);
  if (!activityPub.validateReply(contentObj)) throw InvalidActivityPubOpts;
  const content = activityPub.serialize(contentObj);

  // Upload the content file
  const filename = getRandomString();
  const uri = await store.put(filename, content, opts);

  // Get current user id
  const { currentFromId } = await config.getConfig(opts);
  if (!currentFromId) throw MissingUser;

  // Create and returns the DSNP Reply message
  const contentHash = activityPub.hash(contentObj);
  const message = messages.createReplyMessage(currentFromId, uri.toString(), contentHash, inReplyTo);

  // Sign and return the message
  const signedMessage = await messages.sign(message, opts);
  return signedMessage as batchMessages.BatchReplyMessage;
};

/**
 * react() creates a DSNP reaction message for later announcement.
 *
 * @param emoji     The emoji with which to react
 * @param inReplyTo The DSNP Id of the message to which to react
 * @param opts      Optional. Configuration overrides, such as from address, if any
 * @returns         A Signed DSNP Reaction message ready for inclusion in a batch
 */
export const react = async (
  emoji: string,
  inReplyTo: string,
  opts?: config.ConfigOpts
): Promise<batchMessages.BatchReactionMessage> => {
  // Get current user id
  const { currentFromId } = await config.getConfig(opts);
  if (!currentFromId) throw MissingUser;

  // Creates and returns the DSNP Reaction message
  const message = messages.createReactionMessage(currentFromId, emoji, inReplyTo);

  // Sign and return the message
  const signedMessage = await messages.sign(message, opts);
  return signedMessage as batchMessages.BatchReactionMessage;
};
