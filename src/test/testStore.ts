import { Content, StoreInterface, WriteStreamCallback } from "../core/store";

export default class TestStore implements StoreInterface {
  store: Record<string, Content>;

  constructor() {
    this.store = {};
  }

  async putStream(targetPath: string, callback: WriteStreamCallback): Promise<URL> {
    const buffers: Buffer[] = [];
    const writeStream = {
      write: (...args: unknown[]): boolean => {
        const [chunk, maybeCallback1, maybeCallback2] = args;
        if (typeof maybeCallback1 === "function") maybeCallback1(null);
        else if (typeof maybeCallback2 === "function") maybeCallback2(null);
        if (typeof chunk === "string") {
          buffers.push(Buffer.from(chunk));
        } else {
          buffers.push(chunk as Buffer);
        }

        return false;
      },
      end: (...args: unknown[]) => {
        const [chunkOrFunction, maybeCallback] = args;
        if (chunkOrFunction === undefined) return;

        if (typeof chunkOrFunction === "function") {
          chunkOrFunction(null);
        } else {
          if (typeof chunkOrFunction === "string") {
            buffers.push(Buffer.from(chunkOrFunction));
          } else {
            buffers.push(chunkOrFunction as Buffer);
          }
          if (typeof maybeCallback === "function") maybeCallback(null);
        }
      },
    };
    await callback(writeStream);
    this.store[targetPath] = Buffer.concat(buffers);
    return new URL(`http://fakestore.org/${targetPath}`);
  }

  getStore(): Record<string, Content> {
    return this.store;
  }
}
