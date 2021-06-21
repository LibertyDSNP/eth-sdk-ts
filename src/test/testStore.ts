import { Content, StoreInterface, WriteStreamCallback } from "../core/store";
import { ParquetReader } from "@dsnp/parquetjs";

type ParquetContent = { type: string; rowCount: number };

export default class TestStore implements StoreInterface {
  store: Record<string, Content | ParquetContent>;

  constructor() {
    this.store = {};
  }

  async put(targetPath: string, content: Content): Promise<URL> {
    this.store[targetPath] = content;
    return new URL(`http://fakestore.org/${targetPath}`);
  }

  async putStream(targetPath: string, callback: WriteStreamCallback): Promise<URL> {
    const buffers: Buffer[] = [];
    const writeStream = {
      write: (...args: unknown[]): boolean => {
        const [chunk, maybeCallback1, maybeCallback2] = args;
        if (typeof maybeCallback1 === "function") maybeCallback1(null);
        else if (typeof maybeCallback2 === "function") maybeCallback2(null);
        buffers.push(chunk as Buffer);
        return false;
      },
      end: (...args: unknown[]) => {
        const [chunkOrFunction, maybeCallback] = args;
        if (typeof chunkOrFunction === "function") {
          chunkOrFunction(null);
        } else {
          buffers.push(chunkOrFunction as Buffer);
          if (typeof maybeCallback === "function") maybeCallback(null);
        }
      },
    };
    await callback(writeStream);
    const read = await ParquetReader.openBuffer(Buffer.concat(buffers));
    this.store[targetPath] = {
      type: "parquet",
      rowCount: parseInt(read.metadata.num_rows.buffer.toString("hex"), 16),
    };
    return new URL(`http://fakestore.org/${targetPath}`);
  }

  getStore(): Record<string, Content | ParquetContent> {
    return this.store;
  }
}
