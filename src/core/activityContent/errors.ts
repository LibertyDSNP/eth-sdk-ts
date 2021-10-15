import { DSNPError } from "../errors";

/**
 * ActivityContentError indicates that an error occurred in the activity content
 * module.
 */
export class ActivityContentError extends DSNPError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * InvalidActivityContentError indicates that an activity content object failed
 * to pass validation.
 */
export class InvalidActivityContentError extends ActivityContentError {
  constructor(message?: string) {
    super("Invalid ActivityContent: " + (message || "unknown error"));
  }
}
