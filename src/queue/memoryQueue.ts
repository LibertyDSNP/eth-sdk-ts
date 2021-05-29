import { QueueId, QueueInterface } from "./queue";
import { DSNPMessage } from "../messages/messages";

export const IdDoesNotExist = new Error("No message matching the given ID exists.");

export default class MemoryQueue implements QueueInterface {
  queue: (DSNPMessage | undefined)[];

  constructor() {
    this.queue = [];
  }

  /**
   * enqueue() implements the enqueue function of the QueueInterface. It takes a
   * DSNP message, adds it to an in-memory store and returns an id which can be
   * used to reverse this action, if needed.
   *
   * @param message The DSNP message to queue up for the next batch
   * @returns       A queue id to be used to remove the message if needed
   */
  async enqueue(message: DSNPMessage): Promise<QueueId> {
    const index = this.queue.push(message) - 1;
    return index.toString(16);
  }

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
  async dequeue(id: QueueId): Promise<DSNPMessage> {
    const index = parseInt(id, 16);
    const msg = this.queue[index];

    if (msg === undefined) throw IdDoesNotExist;
    this.queue[index] = undefined;

    return msg;
  }

  /**
   * getAll() implements the getAll function of the QueueInterface. It returns an
   * array of all items currently in the queue and clears the queue.
   *
   * @returns An array of all messages currently in the queue
   */
  async getAll(): Promise<DSNPMessage[]> {
    const messages = this.queue.filter((msg) => msg !== undefined) as DSNPMessage[];

    this.queue = [];

    return messages;
  }
}
