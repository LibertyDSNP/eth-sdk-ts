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
    this.name = "BatchError";
    this.fileHandle = fileHandle;
  }
}

/**
 * EmptyBatchError indicates that no messages were passed in attempting to
 * create a batch file which is not allowed.
 */
export class EmptyBatchError extends BatchError {
  constructor(fileHandle?: WriteStream) {
    super("Invalid message iterator for batch: iterator contains no messages");
    this.name = "EmptyBatchError";
    this.fileHandle = fileHandle;
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
