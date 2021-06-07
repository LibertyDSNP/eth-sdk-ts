import { QueueId, QueueInterface } from "./queue";
import { DSNPMessage, DSNPType } from "../messages/messages";

const InvalidId = new Error("The Queue Id provided is malformed.");
const IdDoesNotExist = new Error("No message matching the given ID exists.");

interface QueueItem {
  id: number;
  message: DSNPMessage;
}

/**
 * MemoryQueue provides a simple, in-memory store for DSNP messages to be
 * announced. This adapter is the default if no other is provided in
 * configuration.
 */
export default class MemoryQueue implements QueueInterface {
  queues: Record<string, QueueItem[]>;
  nextId: number;

  constructor() {
    this.queues = {};
    this.nextId = 0;
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
    const typeString = message.type.toString(16);
    const queueItem = this.createQueueItem(message);
    const queueId = `${typeString}:${queueItem.id.toString(16)}`;

    if (this.queues[typeString] === undefined) this.queues[typeString] = [];
    this.queues[typeString].push(queueItem);

    return queueId;
  }

  /**
   * dequeue() implements the dequeue function of the QueueInterface. It takes a
   * DSNP type, then removes and returns the first DSNP message of the matching
   * type added to the queue. If no messages of the type exist, null will be
   * returned to indicate the end of the queue.
   *
   * @param type The DSNP message type to dequeue
   * @returns    The dequeued DSNP message or null to indicate end of queue
   */
  async dequeue(type: DSNPType): Promise<DSNPMessage | null> {
    const typeString = type.toString(16);

    if (this.queues[typeString] === undefined) return null;

    const queueItem = this.queues[typeString].shift();

    if (queueItem === undefined) return null;
    return queueItem.message;
  }

  /**
   * remove() implements the remove function of the QueueInterface. It takes an
   * id, removes any message in the queue with matching ids and returns the
   * removed message.
   *
   * @throws {@link InvalidId}
   * Thrown if called with an invalid Queue Id.
   *
   * @throws {@link IdDoesNotExist}
   * Thrown if called with a Queue Id that does not match any existing message.
   *
   * @param id The id of the DSNP message to remove from the queue
   * @returns  The removed message
   */
  async remove(queueId: QueueId): Promise<DSNPMessage> {
    const queueIdParts = queueId.split(":");

    if (queueIdParts.length != 2) throw InvalidId;

    const typeString = queueIdParts[0];
    const id = parseInt(queueIdParts[1], 16);

    if (this.queues[typeString] === undefined) throw IdDoesNotExist;

    const index = this.queues[typeString].findIndex((queueItem) => queueItem.id === id);
    if (index === -1) throw IdDoesNotExist;

    const msg = this.queues[typeString][index].message;
    this.queues[typeString].splice(index, 1);
    return msg;
  }

  private createQueueItem(message: DSNPMessage): QueueItem {
    const item: QueueItem = {
      id: this.nextId,
      message,
    };
    this.nextId += 1;
    return item;
  }
}
