// import * as activityPub from "../activityPub/activityPub";
// import * as config from "../config/config";
// import * as storage from "../storage/storage";
import { ActivityPubCreateOpts } from "../activityPub/activityPub";
import { Config } from "../config/config";
import { Handle } from "./handles";

/**
 * broadcast() creates a broadcast DSNP event and enqueues it for the next
 * batch. This method is not yet implemented.
 *
 * @param activityPubOpts  Any options for the activity pub event to create
 * @param opts             Optional. Configuration overrides, such as from address, if any
 *
 */
export const broadcast = async (activityPubOpts: ActivityPubCreateOpts, opts?: Config) => {
  throw NotImplementedError();

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
 * @param activityPubOpts  Any options for the activity pub event to create
 * @param opts             Optional. Configuration overrides, such as from address, if any
 */
export const reply = async (activityPubOpts: ActivityPubCreateOpts, opts: Config) => {
  throw NotImplementedError();

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
 * @param activityPubOpts  Any options for the activity pub event to create
 * @param opts             Optional. Configuration overrides, such as from address, if any
 */
export const react = async (activityPubOpts: ActivityPubCreateOpts, opts: Config) => {
  throw NotImplementedError();

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
