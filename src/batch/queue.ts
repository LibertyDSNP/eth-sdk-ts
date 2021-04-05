import { ActivityPub } from "../activityPub/activityPub";

/**
 * enqueue() adds an activity pub event to the queue for later publishing to the
 * blockchain as a batch file. This method is not yet implemented.
 *
 * @param   activityPub  The activity pub event to queue up for batching
 * @returns              An ID for the queued event
 */
export const enqueue = (activityPub: ActivityPub): string => {
  throw NotImplementedError();
};

/**
 * dequeue() removes an activity pub event from the queue for later publishing
 * to the blockchain. This method is not yet implemented.
 *
 * @param   id  The ID of the event to remove from the queue
 * @returns     The activity pub event removed from the queue
 */
export const dequeue = (id: string): ActivityPub => {
  throw NotImplementedError();
};

/**
 * commit() creates a batch file from the current activity pub events in the
 * queue then clears the queue. This method is not yet implemented.
 */
export const commit = async () => {
  throw NotImplementedError();
};
