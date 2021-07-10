import { keccak256 } from "js-sha3";

import {
  create,
  isValid,
  isValidProfile,
  isValidReply,
  serialize,
  ActivityPubOpts,
  InvalidActivityPubError,
} from "./core/activityPub";
import * as batchMessages from "./core/batch/batchMessages";
import * as config from "./config";
import * as messages from "./core/messages/messages";
import { validateDSNPMessageId, InvalidMessageIdentifierError } from "./core/identifiers";
import { requireGetStore } from "./config";

/**
 * broadcast() creates an activity pub file with the given content options,
 * uploads it with a random filename using the configured storage adapter and
 * creates a DSNP broadcast message for the hosted file for later announcement.
 *
 * @throws {@link MissingSigner}
 * Thrown if the signer is not configured.
 * @param contentOptions - Options for the activity pub content to generate
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed DSNP Broadcast message ready for inclusion in a batch
 */
export const broadcast = async (
  contentOptions: ActivityPubOpts,
  opts?: config.ConfigOpts
): Promise<batchMessages.BatchBroadcastMessage> => {
  const contentObj = create(contentOptions);
  if (!isValid(contentObj)) throw new InvalidActivityPubError();
  const content = serialize(contentObj);

  const currentFromId = config.requireGetCurrentFromId(opts);

  const contentHash = keccak256(content);
  const store = requireGetStore(opts);
  const url = await store.put(contentHash, content);

  const message = messages.createBroadcastMessage(currentFromId, url.toString(), contentHash);

  const signedMessage = await messages.sign(message, opts);
  return signedMessage;
};

/**
 * reply() creates an activity pub file with the given content options,
 * uploads it with a random filename using the configured storage adapter and
 * creates a DSNP reply message for the hosted file for later announcement.
 *
 * @param contentOptions - Options for the activity pub content to generate
 * @param inReplyTo - The DSNP Message Id of the message that this message is in reply to
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed DSNP Reply message ready for inclusion in a batch
 */
export const reply = async (
  contentOptions: ActivityPubOpts,
  inReplyTo: string,
  opts?: config.ConfigOpts
): Promise<batchMessages.BatchReplyMessage> => {
  if (!validateDSNPMessageId(inReplyTo)) throw new InvalidMessageIdentifierError(inReplyTo);

  const contentObj = create(contentOptions);
  if (!isValidReply(contentObj)) throw new InvalidActivityPubError();
  const content = serialize(contentObj);

  const currentFromId = config.requireGetCurrentFromId(opts);

  const contentHash = keccak256(content);
  const store = requireGetStore(opts);
  const url = await store.put(contentHash, content);

  const message = messages.createReplyMessage(currentFromId, url.toString(), contentHash, inReplyTo);

  const signedMessage = await messages.sign(message, opts);
  return signedMessage;
};

/**
 * react() creates a DSNP reaction message for later announcement.
 *
 * @param emoji - The emoji with which to react
 * @param inReplyTo - The DSNP Message Id of the message to which to react
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed DSNP Reaction message ready for inclusion in a batch
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
 * @param contentOptions - Options for the activity pub content to generate
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed DSNP Profile message ready for inclusion in a batch
 */
export const profile = async (
  contentOptions: ActivityPubOpts,
  opts?: config.ConfigOpts
): Promise<batchMessages.BatchProfileMessage> => {
  const contentObj = create(contentOptions);
  if (!isValidProfile(contentObj)) throw new InvalidActivityPubError();
  const content = serialize(contentObj);

  const currentFromId = config.requireGetCurrentFromId(opts);

  const contentHash = keccak256(content);
  const store = requireGetStore(opts);
  const url = await store.put(contentHash, content);

  const message = messages.createProfileMessage(currentFromId, url.toString(), contentHash);

  const signedMessage = await messages.sign(message, opts);
  return signedMessage;
};
