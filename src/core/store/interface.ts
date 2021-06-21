export type Content = string | Buffer;

/**
 * WriteStream: a write stream intended writing a batch file
 */
export interface WriteStream {
  write(chunk: unknown, encoding?: string, callback?: (error: Error | null | undefined) => void): boolean;
  write(chunk: unknown, cb?: (error: Error | null | undefined) => void): boolean;
  end(chunk: unknown, cb?: () => void): void;
  end(chunk: unknown, encoding?: string, cb?: () => void): void;
}

/**
 * ReadStream: a read stream intended reading a batch file
 */
export interface ReadStream {
  read(chunk: unknown, size: number): void;
  end(chunk: unknown, cb?: () => void): void;
  end(chunk: unknown, encoding?: string, cb?: () => void): void;
}

/**
 * PassThroughCallback: a callback intended for receiving a write stream to create a batch file
 */
export interface WriteStreamCallback {
  (stream: WriteStream): Promise<void>;
}

/**
 * StoreInterface is the interface a storage adapter is expected to implement to
 * be used with high-level methods in this SDK. The require methods consist of
 * an put function, a dequeue function and a get function.
 */
export interface StoreInterface {
  /**
   * put() takes a batch file to store with the chosen hosting solution and
   * returns the URL of the file once stored.
   *
   * @param targetPath - The path to and name of file
   * @param content - The file object to store on the chosen hosting solution
   * @returns The URI of the hosted file
   */
  put: (targetPath: string, content: Content) => Promise<URL>;

  /**
   * putStream() takes a pass-through stream to upload data to chosen hosting solution and
   * returns the URL of the file once stored.
   *
   * @param targetPath - The path to and name of file
   * @param doWriteToStream - A callback function that receives a writable to stream data to the chosen hosting solution
   * @returns The URI of the hosted file
   */
  putStream: (targetPath: string, doWriteToStream: WriteStreamCallback) => Promise<URL>;
}
