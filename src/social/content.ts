interface BroadcastOpts {}

/**
 * broadcast() creates a broadcast activity pub event and enqueues it for the
 * next batch. This method is not yet implemented.
 */
export const broadcast = (opts: BroadcastOpts) => {
  throw NotImplementedError();

  // const config = config.getConfig();
  //
  // const event = activityPub.create({
  //   ...opts,
  //   type: "Note"
  // });
  // const uri = config.storeMethod(event);
  // const hash = activityPub.hash(uri);
  //
  // config.batchEnqueueMethod(uri, hash);
};

interface ReplyOpts {}

/**
 * reply() creates a reply activity pub event and enqueues it for the next
 * batch. This method is not yet implemented.
 */
export const reply = (opts: ReplyOpts) => {
  throw NotImplementedError();
};

interface ReactOpts {}

/**
 * react() creates a reaction activity pub event and enqueues it for the next
 * batch. This method is not yet implemented.
 */
export const react = (opts: ReactOpts) => {
  throw NotImplementedError();
};

interface EventFilters {}

/**
 * fetchEvents() fetches the most recent activity pub events matching the given
 * search criteria. This method is not yet implemented.
 */
export const fetchEvents = (filter: EventFilters) => {
  throw NotImplementedError();
};
