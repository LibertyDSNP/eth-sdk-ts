/**
 * subscribe() takes a callback to invoke upon receiving new activity pub events
 * matching the given criteria. This method only works if the web3 provider set
 * in the configuration is a websocket provider. This method is not yet
 * implemented.
 */
export const subscribe = () => {
  throw NotImplementedError();
};

/**
 * unsubscribe() removes a subscription callback created with the subscribe
 * method. This method only works if the web3 provider set in the configuration
 * is a websocket provider. This method is not yet implemented.
 */
export const unsubscribe = () => {
  throw NotImplementedError();
};
