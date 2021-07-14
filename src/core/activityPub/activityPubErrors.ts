import { DSNPError } from "../errors";

/**
 * ActivityPubError indicates that an error occurred in the activity pub module.
 */
export class ActivityPubError extends DSNPError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * InvalidActivityPubError indicates that an activity pub object failed to pass
 * validation.
 */
export class InvalidActivityPubError extends ActivityPubError {
  constructor() {
    super("The activity pub object provided is invalid.");
  }
}
