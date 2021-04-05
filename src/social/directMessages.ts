interface InboxOpts {}

/**
 * inbox() creates an inbox activity pub event and enqueues it for the next
 * batch. This method is not yet implemented.
 */
export const inbox = (opts: InboxOpts) => {
  throw NotImplementedError();
};

interface DropOpts {}

/**
 * drop() creates a dead drop activity pub event and enqueues it for the next
 * batch. This method is not yet implemented.
 */
export const drop = (opts: DropOpts) => {
  throw NotImplementedError();
};
