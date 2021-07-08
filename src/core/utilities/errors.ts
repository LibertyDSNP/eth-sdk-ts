import { WriteStream } from "../store";

/**
 * NotImplementedError indicates that a particular feature is not available for
 * use in the current version of the SDK
 */
export const NotImplementedError = new Error("This method is not yet implemented.");

/**
 * BatchError indicates that something went wrong in generating a batch file.
 * This error object will include a fileHandle field containing the un-closed
 * write stream of the batch.
 */
export class BatchError extends Error {
  fileHandle: WriteStream;

  constructor(message: string, fileHandle: WriteStream) {
    super(message);
    this.name = "BatchError";
    this.fileHandle = fileHandle;
  }
}

/**
 * EmptyBatchError indicates that no messages were passed in attempting to
 * create a batch file which is not allowed.
 */
export class EmptyBatchError extends BatchError {
  constructor(fileHandle: WriteStream) {
    super("Invalid message iterator for batch: iterator contains no messages", fileHandle);
    this.name = "EmptyBatchError";
  }
}

/**
 * MixedDSNPTypeError indicates that more than one type of DSNP message was
 * passed in attempting to create batch file which is not allowed.
 */
export class MixedTypeBatchError extends BatchError {
  constructor(fileHandle: WriteStream) {
    super("Invalid message iterator for batch: iterator contains multiple DSNP types", fileHandle);
    this.name = "MixedTypeBatchError";
  }
}
