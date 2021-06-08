import * as activityPub from "../activityPub/activityPub";
import * as config from "../config/config";
import * as messages from "../messages/messages";
import * as queue from "../queue/queue";
import * as store from "../store/store";
import { getRandomString, MissingUser } from "../utilities";

/**
 * broadcast() creates an activity pub file with the given content options,
 * uploads it with a random filename using the configured storage adapter,
 * creates a DSNP broadcast message for the hosted file and enqueues it in the
 * current batch for later announcement.
 *
 * @throws {@link MissingSigner}
 * Thrown if the signer is not configured.
 *
 * @param contentOptions Options for the activity pub content to generate
 * @param opts           Optional. Configuration overrides, such as from address, if any
 *
 */
export const broadcast = async (
  contentOptions: activityPub.ActivityPubOpts,
  opts?: config.ConfigOpts
): Promise<void> => {
  // Create the activity pub file and upload it
  const contentObj = activityPub.create(contentOptions);
  const filename = getRandomString();
  const content = activityPub.serialize(contentObj);
  const uri = await store.put(filename, content, opts);

  // Get current user id
  const { currentUserId } = await config.getConfig(opts);
  if (!currentUserId) throw MissingUser;

  // Create the DSNP Broadcast message
  const contentHash = activityPub.hash(contentObj);
  const message = messages.createBroadcastMessage(currentUserId, uri.toString(), contentHash);

  // Enqueue the message
  queue.enqueue(message, opts);
};

/**
 * reply() creates an activity pub file with the given content options,
 * uploads it with a random filename using the configured storage adapter,
 * creates a DSNP reply message for the hosted file and enqueues it in the
 * current batch for later announcement.
 *
 * @param contentOptions Options for the activity pub content to generate
 * @param opts           Optional. Configuration overrides, such as from address, if any
 */
export const reply = async (contentOptions: activityPub.ActivityPubOpts, opts: config.ConfigOpts): Promise<void> => {
  // Create the activity pub file and upload it
  const contentObj = activityPub.create(contentOptions);
  const filename = getRandomString();
  const content = activityPub.serialize(contentObj);
  const uri = await store.put(filename, content, opts);

  // Get current user id
  const { currentUserId } = await config.getConfig(opts);
  if (!currentUserId) throw MissingUser;

  // Create the DSNP Reply message
  const contentHash = activityPub.hash(contentObj);
  const message = messages.createReplyMessage(
    currentUserId,
    uri.toString(),
    contentHash,
    contentObj.inReplyTo as string
  );

  // Enqueue the message
  queue.enqueue(message, opts);
};

/**
 * react() creates a DSNP reaction message and enqueues it in the current batch
 * for later announcement.
 *
 * @param emoji     The emoji with which to react
 * @param inReplyTo The DSNP Id of the message to which to react
 * @param opts    Optional. Configuration overrides, such as from address, if any
 * @return The Batch Broadcast Message
 */
export const react = async (emoji: string, inReplyTo: string, opts: config.ConfigOpts): Promise<void> => {
  // Get current user id
  const { currentUserId } = await config.getConfig(opts);
  if (!currentUserId) throw MissingUser;

  // Create the DSNP Reaction message
  const message = messages.createReactionMessage(currentUserId, emoji, inReplyTo);

  // Enqueue the message
  queue.enqueue(message, opts);
};
