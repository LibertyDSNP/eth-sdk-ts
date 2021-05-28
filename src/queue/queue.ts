// import * as batch from "../batch/batch";
import { getConfig, Config } from "../config/config";
// import * as announcement from "../contracts/announcement";
// import * as storage from "../storage/storage";
import { DSNPMessage } from "../messages/messages";
import { HexString } from "../types/Strings";
import { NotImplementedError } from "../utilities";

export type QueueId = HexString;

export interface QueueInterface {
  enqueue(dsnpEvent: DSNPMessage): Promise<QueueId>;
  dequeue(id: QueueId): Promise<DSNPMessage>;
  getAll(): Promise<DSNPMessage[]>;
}

/**
 * enqueue() adds an activity pub event to the queue for later publishing to the
 * blockchain as a batch file.
 *
 * @param   dsnpEvent  The DSNP event to queue up for batching
 * @returns            An ID for the queued event
 */
export const enqueue = async (event: DSNPMessage, opts?: Config): Promise<QueueId> => {
  const config = getConfig(opts);
  return await config.queue.enqueue(event);
};

/**
 * dequeue() removes an activity pub event from the queue for later publishing
 * to the blockchain.
 *
 * @param   id  The ID of the event to remove from the queue
 * @returns     The DSNP event event removed from the queue
 */
export const dequeue = async (id: QueueId, opts?: Config): Promise<DSNPMessage> => {
  const config = getConfig(opts);
  return await config.queue.dequeue(id);
};

/**
 * commit() creates a batch file from the current activity pub events in the
 * queue then clears the queue.
 */
export const commit = async (_opts?: Config): Promise<void> => {
  throw NotImplementedError;

  // const config = getConfig(opts);
  // const events = await config.queue.getAll();
  // const batchFile = batch.createFile(events);
  //
  // const hash = batch.hash(batchFile);
  // const uri = await storage.put(batchFile, opts);
  // await announcement.batch(uri, hash);
};
