import { keccak256 } from "js-sha3";

import * as activityPub from "./core/activityPub/activityPub";
import * as batchMessages from "./core/batch/batchMesssages";
import * as config from "./config";
import * as messages from "./core/messages/messages";
import * as store from "./core/store/interface";
import { validateDSNPId } from "./core/utilities";

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
 * @param contentOptions - Options for the activity pub content to generate
 * @param opts -           Optional. Configuration overrides, such as from address, if any
 * @returns              A Signed DSNP Broadcast message ready for inclusion in a batch
 */
export const broadcast = async (
  contentOptions: activityPub.ActivityPubOpts,
  opts?: config.ConfigOpts
): Promise<batchMessages.BatchBroadcastMessage> => {
  const contentObj = activityPub.create(contentOptions);
  if (!activityPub.isValid(contentObj)) throw InvalidActivityPubOpts;
  const content = activityPub.serialize(contentObj);

  const currentFromId = config.requireGetCurrentFromId(opts);

  const contentHash = keccak256(content);
  const uri = await store.put(contentHash, content, opts);

  const message = messages.createBroadcastMessage(currentFromId, uri.toString(), contentHash);

  const signedMessage = await messages.sign(message, opts);
  return signedMessage;
};

/**
 * reply() creates an activity pub file with the given content options,
 * uploads it with a random filename using the configured storage adapter and
 * creates a DSNP reply message for the hosted file for later announcement.
 *
 * @param contentOptions - Options for the activity pub content to generate
 * @param inReplyTo -      The DSNP Id of the message that this message is in reply to
 * @param opts -           Optional. Configuration overrides, such as from address, if any
 * @returns              A Signed DSNP Reply message ready for inclusion in a batch
 */
export const reply = async (
  contentOptions: activityPub.ActivityPubOpts,
  inReplyTo: string,
  opts?: config.ConfigOpts
): Promise<batchMessages.BatchReplyMessage> => {
  if (!validateDSNPId(inReplyTo)) throw InvalidInReplyTo;

  const contentObj = activityPub.create(contentOptions);
  if (!activityPub.isValidReply(contentObj)) throw InvalidActivityPubOpts;
  const content = activityPub.serialize(contentObj);

  const currentFromId = config.requireGetCurrentFromId(opts);

  const contentHash = keccak256(content);
  const uri = await store.put(contentHash, content, opts);

  const message = messages.createReplyMessage(currentFromId, uri.toString(), contentHash, inReplyTo);

  const signedMessage = await messages.sign(message, opts);
  return signedMessage;
};

/**
 * react() creates a DSNP reaction message for later announcement.
 *
 * @param emoji -     The emoji with which to react
 * @param inReplyTo - The DSNP Id of the message to which to react
 * @param opts -      Optional. Configuration overrides, such as from address, if any
 * @returns         A Signed DSNP Reaction message ready for inclusion in a batch
 */
export const react = async (
  emoji: string,
  inReplyTo: string,
  opts?: config.ConfigOpts
): Promise<batchMessages.BatchReactionMessage> => {
  const currentFromId = config.requireGetCurrentFromId(opts);

  const message = messages.createReactionMessage(currentFromId, emoji, inReplyTo);

  const signedMessage = await messages.sign(message, opts);
  return signedMessage;
};

/**
 * profile() creates an activity pub file with the given content options,
 * uploads it with a random filename using the configured storage adapter and
 * creates a DSNP profile message for the hosted file for later announcement.
 *
 * @throws {@link MissingSigner}
 * Thrown if the signer is not configured.
 *
 * @param contentOptions - Options for the activity pub content to generate
 * @param opts -           Optional. Configuration overrides, such as from address, if any
 * @returns              A Signed DSNP Profile message ready for inclusion in a batch
 */
export const profile = async (
  contentOptions: activityPub.ActivityPubOpts,
  opts?: config.ConfigOpts
): Promise<batchMessages.BatchProfileMessage> => {
  const contentObj = activityPub.create(contentOptions);
  if (!activityPub.isValidProfile(contentObj)) throw InvalidActivityPubOpts;
  const content = activityPub.serialize(contentObj);

  const currentFromId = config.requireGetCurrentFromId(opts);

  const contentHash = keccak256(content);
  const uri = await store.put(contentHash, content, opts);

  const message = messages.createProfileMessage(currentFromId, uri.toString(), contentHash);

  const signedMessage = await messages.sign(message, opts);
  return signedMessage;
};
