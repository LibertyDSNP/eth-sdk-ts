// import * as batch from "./batch";
// import * as config from "../config/config";
import { Config } from "../config/config";
// import * as announcement from "../contracts/announcement";
// import * as storage from "../storage/storage";
import { MessageType } from "../types/DSNP";
import { NotImplementedError } from "../utilities/errors";
import { KeccakHash } from "../utilities/hash";

export type QueueId = KeccakHash;

export interface QueueInterface {
  enqueue(dsnpEvent: MessageType): Promise<QueueId>;
  dequeue(id: QueueId): Promise<MessageType>;
  getAll(): Promise<MessageType[]>;
}

/**
 * enqueue() adds an activity pub event to the queue for later publishing to the
 * blockchain as a batch file. This method is not yet implemented.
 *
 * @param   dsnpEvent  The DSNP event to queue up for batching
 * @returns            An ID for the queued event
 */
export const enqueue = async (_event: MessageType, _opts?: Config): Promise<QueueId> => {
  throw NotImplementedError;

  // const config = config.getConfig(opts);
  // return await config.queue.enqueue(event);
};

/**
 * dequeue() removes an activity pub event from the queue for later publishing
 * to the blockchain. This method is not yet implemented.
 *
 * @param   id  The ID of the event to remove from the queue
 * @returns     The DSNP event event removed from the queue
 */
export const dequeue = async (_id: QueueId, _opts?: Config): Promise<MessageType> => {
  throw NotImplementedError;

  // const config = config.getConfig(opts);
  // return await config.queue.dequeue(id);
};

/**
 * commit() creates a batch file from the current activity pub events in the
 * queue then clears the queue. This method is not yet implemented.
 */
export const commit = async (_opts?: Config): Promise<void> => {
  throw NotImplementedError;

  // const config = config.getConfig(opts);
  // const events = await config.queue.getAll();
  // const batchFile = batch.createFile(events);
  //
  // const hash = batch.hash(batchFile);
  // const uri = await storage.store(batchFile, opts);
  // await announcement.batch(uri, hash);
};
