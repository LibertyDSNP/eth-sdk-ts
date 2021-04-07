import { QueueId } from "./queue";
import { DSNPMessage } from "../types/DSNP";
import { NotImplementedError } from "../utilities/errors";

/**
 * enqueue() implements the enqueue function of the StorageInterface. It takes
 * a DSNP event, adds it to an in-memory store and returns an id which can be
 * used to reverse this action, if needed. This method is not yet implemented.
 *
 * @param event The event to queue up for the next batch
 * @returns     A queue id to be used to remove the event if needed
 */
export const enqueue = async (event: DSNPMessage): Promise<QueueId> => {
  throw NotImplementedError();
};

/**
 * dequeue() implements the dequeue function of the StorageInterface. It takes
 * an id, removes any events in the queue with matching ids and returns the
 * removed event. This method is not yet implemented.
 *
 * @param id The id of the event to remove from the queue
 * @returns  The removed event
 */
export const dequeue = async (id: QueueId): Promise<DSNPMessage> => {
  throw NotImplementedError();
};

/**
 * getAll() implements the getAll function of the StorageInterface. It returns
 * an array of all items currently in the queue and clears the queue. This
 * method is not yet implemented.
 *
 * @returns An array of all events currently in the queue
 */
export const getAll = async (): Promise<DSNPMessage[]> => {
  throw NotImplementedError();
};
