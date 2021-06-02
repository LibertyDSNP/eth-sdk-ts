// import * as batch from "../batch/batch";
import { getConfig, Config } from "../config/config";
// import * as announcement from "../contracts/announcement";
// import * as storage from "../storage/storage";
import { DSNPMessage } from "../messages/messages";
import { HexString } from "../types/Strings";
import { NotImplementedError } from "../utilities";

export type QueueId = HexString;

export interface QueueInterface {
  enqueue(dsnpMessage: DSNPMessage): Promise<QueueId>;
  dequeue(id: QueueId): Promise<DSNPMessage>;
  getAll(): Promise<DSNPMessage[]>;
}

/**
 * enqueue() adds a DSNP message to the queue for later publishing to the
 * blockchain as a batch file.
 *
 * @param message The DSNP message to queue up for batching
 * @param opts    Optional. Configuration overrides, such as from address, if any
 * @returns       An ID for the queued message
 */
export const enqueue = async (message: DSNPMessage, opts?: Config): Promise<QueueId> => {
  const config = getConfig(opts);
  return await config.queue.enqueue(message);
};

/**
 * remove() removes a DSNP message from the queue for later publishing
 * to the blockchain.
 *
 * @param id   The ID of the message to remove from the queue
 * @param opts Optional. Configuration overrides, such as from address, if any
 * @returns    The DSNP message removed from the queue
 */
export const remove = async (id: QueueId, opts?: Config): Promise<DSNPMessage> => {
  const config = getConfig(opts);
  return await config.queue.dequeue(id);
};

/**
 * commit() creates a batch file from the current activity pub messages in the
 * queue then clears the queue. This method is not yet implemented.
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
