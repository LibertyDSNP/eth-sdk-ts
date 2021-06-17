import { getConfig, ConfigOpts } from "../../config";
import { DSNPType } from "../messages/messages";
import { DSNPBatchMessage } from "../batch/batchMesssages";

/**
 * QueueId is an representation of an identifier used by a queuing adapter for
 * referencing specific items in the queue which may need to be removed in the
 * future.
 */
export type QueueId = string;

/**
 * QueueInterface is the interface a queue adapter is expected to implement to
 * be used with high-level methods in this SDK. The require methods consist of
 * an enqueue function, a dequeue function and a remove function.
 */
export interface QueueInterface {
  enqueue(dsnpMessage: DSNPBatchMessage): Promise<QueueId>;
  dequeue(dsnpType: DSNPType): Promise<DSNPBatchMessage | null>;
  remove(id: QueueId): Promise<DSNPBatchMessage>;
}

/**
 * enqueue() adds a DSNP message to the queue for later publishing to the
 * blockchain as a batch file.
 *
 * @param message - The DSNP message to queue up for batching
 * @param opts -    Optional. Configuration overrides, such as from address, if any
 * @returns       A Queue ID for the queued message
 */
export const enqueue = async (message: DSNPBatchMessage, opts?: ConfigOpts): Promise<QueueId> => {
  const config = getConfig(opts);
  return await config.queue.enqueue(message);
};

/**
 * remove() removes a DSNP message from the queue for later publishing
 * to the blockchain.
 *
 * @param id -   The Queue ID of the message to remove from the queue
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns    The DSNP message removed from the queue
 */
export const remove = async (id: QueueId, opts?: ConfigOpts): Promise<DSNPBatchMessage> => {
  const config = getConfig(opts);
  return await config.queue.remove(id);
};

/**
 * dequeueBatch() takes a DSNP type and number of messages to dequeue and
 * returns an array for inclusion in a batch file. If the number provided is
 * zero, all messages in the queue with a matching type will be returned.
 *
 * @param dsnpType -  The DSNP type of messages to dequeue
 * @param count - The number of messages to dequeue and return
 * @param opts -  Optional. Configuration overrides, such as from address, if any
 * @returns     An array of DSNP messages removed from the queue
 */
export const dequeueBatch = async (
  dsnpType: DSNPType,
  count: number,
  opts?: ConfigOpts
): Promise<DSNPBatchMessage[]> => {
  const config = getConfig(opts);
  const results: DSNPBatchMessage[] = [];

  for (let i = 0; i < count || count == 0; i++) {
    const msg = await config.queue.dequeue(dsnpType);
    if (msg === null) break;
    results.push(msg);
  }

  return results;
};
