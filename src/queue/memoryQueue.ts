import { QueueId, QueueInterface } from "./queue";
import { DSNPMessage } from "../messages/messages";

let queue: (DSNPMessage | undefined)[] = [];

const IdDoesNotExist = new Error("No message matching the given ID exists.");

/**
 * enqueue() implements the enqueue function of the QueueInterface. It takes a
 * DSNP message, adds it to an in-memory store and returns an id which can be
 * used to reverse this action, if needed.
 *
 * @param message The DSNP message to queue up for the next batch
 * @returns       A queue id to be used to remove the message if needed
 */
export const enqueue = async (message: DSNPMessage): Promise<QueueId> => {
  const index = queue.push(message);
  return index.toString(16);
};

/**
 * dequeue() implements the dequeue function of the QueueInterface. It takes an
 * id, removes any message in the queue with matching ids and returns the
 * removed message.
 *
 * @throws {@link IdDoesNotExist}
 * Thrown if called with a Queue Id that does not match any existing message.
 *
 * @param id The id of the DSNP message to remove from the queue
 * @returns  The removed message
 */
export const dequeue = async (id: QueueId): Promise<DSNPMessage> => {
  const index = parseInt(id, 16);
  const msg = queue[index];

  if (msg === undefined) throw IdDoesNotExist;
  queue[index] = undefined;

  return msg;
};

/**
 * getAll() implements the getAll function of the QueueInterface. It returns an
 * array of all items currently in the queue and clears the queue.
 *
 * @returns An array of all messages currently in the queue
 */
export const getAll = async (): Promise<DSNPMessage[]> => {
  const messages = queue.filter((msg) => msg !== undefined) as DSNPMessage[];

  queue = [];

  return messages;
};

const initializer = (): QueueInterface => {
  return {
    enqueue,
    dequeue,
    getAll,
  };
};

export default initializer;
