// import * as activityPub from "../activityPub/activityPub";
// import * as config from "../config/config";
// import * as storage from "../storage/storage";
import { BroadcastOptions, ReactionOptions, ReplyOptions } from "../activityPub/activityPub";
import { Config } from "../config/config";
import { NotImplementedError } from "../utilities/errors";

/**
 * broadcast() creates a broadcast DSNP event and enqueues it for the next
 * batch. This method is not yet implemented.
 *
 * @param content The content for the note to broadcast
 * @param opts    Optional. Configuration overrides, such as from address, if any
 *
 */
export const broadcast = async (_content: BroadcastOptions, _opts?: Config): Promise<void> => {
  throw NotImplementedError;

  // const config = config.getConfig(opts);
  //
  // const activityPubObject = activityPub.create(activityPubOpts);
  // const activityPubHash = activityPub.hash(activityPubObject);
  // const uri = storage.store(activityPubObject, opts);
  //
  // const event = events.createBroadcastEvent(uri, activityPubHash);
  // config.batchEnqueueMethod(event, opts);
};

/**
 * reply() creates a reply activity pub event and enqueues it for the next
 * batch. This method is not yet implemented.
 *
 * @param content The content for the reply to broadcast
 * @param opts    Optional. Configuration overrides, such as from address, if any
 */
export const reply = async (_content: ReplyOptions, _opts: Config): Promise<void> => {
  throw NotImplementedError;

  // const config = config.getConfig(opts);
  //
  // const inReplyTo = activityPubOpts.inReplyTo;
  // const activityPubObject = activityPub.create(activityPubOpts);
  // const activityPubHash = activityPub.hash(activityPubObject);
  // const uri = storage.store(activityPubObject, opts);
  //
  // const event = events.createReplyEvent(uri, inReplyTo, activityPubHash);
  // config.batchEnqueueMethod(event, opts);
};

/**
 * react() creates a reaction activity pub event and enqueues it for the next
 * batch. This method is not yet implemented.
 *
 * @param content The content for the reaction to broadcast
 * @param opts    Optional. Configuration overrides, such as from address, if any
 */
export const react = async (_content: ReactionOptions, _opts: Config): Promise<void> => {
  throw NotImplementedError;

  // const config = config.getConfig(opts);
  //
  // const inReplyTo = activityPubOpts.inReplyTo;
  // const activityPubObject = activityPub.create(activityPubOpts);
  // const activityPubHash = activityPub.hash(activityPubObject);
  // const uri = storage.store(activityPubObject, opts);
  //
  // const event = events.createReactionEvent(uri, inReplyTo, activityPubHash);
  // config.batchEnqueueMethod(event, opts);
};
