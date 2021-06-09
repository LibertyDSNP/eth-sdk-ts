// import * as config from "../config/config";
// import * as store from "../store";
import { ActivityPubOpts } from "./core/activityPub/activityPub";
import { ConfigOpts } from "./config";
import { NotImplementedError } from "./core/utilities/errors";
import { BatchBroadcastMessage, BatchReactionMessage, BatchReplyMessage } from "./core/batch/batchMesssages";

/**
 * broadcast() creates a broadcast DSNP event and enqueues it for the next
 * batch. This method is not yet implemented.
 *
 * @param content The content for the note to broadcast
 * @param opts    Optional. Configuration overrides, such as from address, if any
 * @return The Batch Broadcast Message
 */
export const broadcast = async (_content: ActivityPubOpts, _opts?: ConfigOpts): Promise<BatchBroadcastMessage> => {
  throw NotImplementedError;

  // const config = config.getConfig(opts);
  //
  // const activityPubObject = activityPub.create(activityPubOpts);
  // const activityPubHash = activityPub.hash(activityPubObject);
  // const uri = store.put(activityPubObject, opts);
  //
  // return events.createBroadcastEvent(uri, activityPubHash);
};

/**
 * reply() creates a reply activity pub event and enqueues it for the next
 * batch. This method is not yet implemented.
 *
 * @param content The content for the reply to broadcast
 * @param opts    Optional. Configuration overrides, such as from address, if any
 * @return The Batch Broadcast Message
 */
export const reply = async (_content: ActivityPubOpts, _opts?: ConfigOpts): Promise<BatchReplyMessage> => {
  throw NotImplementedError;

  // const config = config.getConfig(opts);
  //
  // const inReplyTo = activityPubOpts.inReplyTo;
  // const activityPubObject = activityPub.create(activityPubOpts);
  // const activityPubHash = activityPub.hash(activityPubObject);
  // const uri = store.put(activityPubObject, opts);
  //
  // return events.createReplyEvent(uri, inReplyTo, activityPubHash);
};

/**
 * react() creates a reaction activity pub event and enqueues it for the next
 * batch. This method is not yet implemented.
 *
 * @param emoji     The emoji with which to react
 * @param inReplyTo The DSNP Id of the message to which to react
 * @param opts    Optional. Configuration overrides, such as from address, if any
 * @return The Batch Broadcast Message
 */
export const react = async (_emoji: string, _inReplyTo: string, _opts?: ConfigOpts): Promise<BatchReactionMessage> => {
  throw NotImplementedError;

  // const config = config.getConfig(opts);
  //
  // const inReplyTo = activityPubOpts.inReplyTo;
  // const activityPubObject = activityPub.create(activityPubOpts);
  // const activityPubHash = activityPub.hash(activityPubObject);
  // const uri = store.put(activityPubObject, opts);
  //
  // return events.createReactionEvent(uri, inReplyTo, activityPubHash);
};
