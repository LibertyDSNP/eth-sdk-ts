interface SubscribeFilters {}

type SubscriptionCallbackFn = (event: ActivityPub) => void;
type SubscriptionId = string;

/**
 * subscribe() takes a callback to invoke upon receiving new activity pub events
 * matching the given criteria. This method only works if the web3 provider set
 * in the configuration is a websocket provider. This method is not yet
 * implemented.
 */
export const subscribe = (filter: SubscribeFilters, callback: SubscriptionCallbackFn): SubscriptionId => {
  throw NotImplementedError();
};

/**
 * unsubscribe() removes a subscription callback created with the subscribe
 * method. This method only works if the web3 provider set in the configuration
 * is a websocket provider. This method is not yet implemented.
 */
export const unsubscribe = (subscription: SubscriptionId): void => {
  throw NotImplementedError();
};
