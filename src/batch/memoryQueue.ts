import { QueueId, QueueInterface } from "./queue";
import { DSNPType } from "../messages/messages";
import { NotImplementedError } from "../utilities/errors";

/**
 * enqueue() implements the enqueue function of the QueueInterface. It takes a
 * DSNP event, adds it to an in-memory store and returns an id which can be used
 * to reverse this action, if needed. This method is not yet implemented.
 *
 * @param event The event to queue up for the next batch
 * @returns     A queue id to be used to remove the event if needed
 */
export const enqueue = async (_event: DSNPType): Promise<QueueId> => {
  throw NotImplementedError;
};

/**
 * dequeue() implements the dequeue function of the QueueInterface. It takes an
 * id, removes any events in the queue with matching ids and returns the removed
 * event. This method is not yet implemented.
 *
 * @param id The id of the event to remove from the queue
 * @returns  The removed event
 */
export const dequeue = async (_id: QueueId): Promise<DSNPType> => {
  throw NotImplementedError;
};

/**
 * getAll() implements the getAll function of the QueueInterface. It returns an
 * array of all items currently in the queue and clears the queue. This method
 * is not yet implemented.
 *
 * @returns An array of all events currently in the queue
 */
export const getAll = async (): Promise<DSNPType[]> => {
  throw NotImplementedError;
};

const initializer = (): QueueInterface => {
  return {
    enqueue,
    dequeue,
    getAll,
  };
};

export default initializer;
