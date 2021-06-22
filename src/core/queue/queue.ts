import { getConfig, ConfigOpts } from "../../config";
import { DSNPType } from "../messages";
import { DSNPBatchMessage } from "../batch/batchMessages";

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
 * dequeueBatch() takes a DSNP type and number of messages to dequeue and
 * returns an array for inclusion in a batch file. If the number provided is
 * zero, all messages in the queue with a matching type will be returned.
 *
 * @param dsnpType - The DSNP type of messages to dequeue
 * @param count - The number of messages to dequeue and return
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns An array of DSNP messages removed from the queue
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
