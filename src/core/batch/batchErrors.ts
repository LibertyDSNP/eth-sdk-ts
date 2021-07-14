import { WriteStream } from "../store";
import { DSNPError } from "../errors";

/**
 * BatchError indicates that something went wrong in generating a batch file.
 * This error object may include a fileHandle field containing the un-closed
 * write stream of the batch.
 */
export class BatchError extends DSNPError {
  fileHandle?: WriteStream;

  constructor(message: string, fileHandle?: WriteStream) {
    super(message);
    this.fileHandle = fileHandle;
  }
}

/**
 * EmptyBatchError indicates that no announcements were passed in attempting to
 * create a batch file which is not allowed.
 */
export class EmptyBatchError extends BatchError {
  constructor(fileHandle?: WriteStream) {
    super("Invalid announcement iterator for batch: iterator contains no announcements");
    this.fileHandle = fileHandle;
  }
}

/**
 * MixedTypeBatchError indicates that more than one type of announcement was
 * passed in attempting to create batch file which is not allowed.
 */
export class MixedTypeBatchError extends BatchError {
  constructor(fileHandle: WriteStream) {
    super("Invalid signed announcement iterator for batch: iterator contains multiple announcement types", fileHandle);
    this.fileHandle = fileHandle;
  }
}
