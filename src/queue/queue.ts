import { getConfig, Config } from "../config/config";
import { DSNPMessage, DSNPType } from "../messages/messages";

export type QueueId = string;

export interface QueueInterface {
  enqueue(dsnpType: DSNPType, dsnpMessage: DSNPMessage): Promise<QueueId>;
  dequeue(dsnpType: DSNPType): Promise<DSNPMessage | null>;
  remove(id: QueueId): Promise<DSNPMessage>;
}

/**
 * enqueue() adds a DSNP message to the queue for later publishing to the
 * blockchain as a batch file.
 *
 * @param message The DSNP message to queue up for batching
 * @param opts    Optional. Configuration overrides, such as from address, if any
 * @returns       A Queue ID for the queued message
 */
export const enqueue = async (message: DSNPMessage, opts?: Config): Promise<QueueId> => {
  const config = getConfig(opts);
  return await config.queue.enqueue(message.type, message);
};

/**
 * remove() removes a DSNP message from the queue for later publishing
 * to the blockchain.
 *
 * @param id   The Queue ID of the message to remove from the queue
 * @param opts Optional. Configuration overrides, such as from address, if any
 * @returns    The DSNP message removed from the queue
 */
export const remove = async (id: QueueId, opts?: Config): Promise<DSNPMessage> => {
  const config = getConfig(opts);
  return await config.queue.remove(id);
};

/**
 * dequeueBatch() takes a DSNP type and number of messages to dequeue and
 * returns an array for inclusion in a batch file. If the number provided is
 * zero, all messages in the queue with a matching type will be returned.
 *
 * @param type  The DSNP type of messages to dequeue
 * @param count The number of messages to dequeue and return
 * @param opts  Optional. Configuration overrides, such as from address, if any
 * @returns     An array of DSNP messages removed from the queue
 */
export const dequeueBatch = async (dsnpType: DSNPType, count: number, opts?: Config): Promise<DSNPMessage[]> => {
  const config = getConfig(opts);
  const results: DSNPMessage[] = [];

  for (let i = 0; i < count || count == 0; i++) {
    const msg = await config.queue.dequeue(dsnpType);
    if (msg === null) break;
    results.push(msg);
  }

  return results;
};
