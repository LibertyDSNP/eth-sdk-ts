import { Content, File, StoreInterface, PassThroughCallback } from "../core/store/interface";
import { PassThrough } from "stream";

export default class TestStore implements StoreInterface {
  store: Record<string, Content | PassThrough>;

  constructor() {
    this.store = {};
  }

  async get(targetPath: string): Promise<File> {
    return this.store[targetPath] as File;
  }

  async put(targetPath: string, content: Content): Promise<URL> {
    this.store[targetPath] = content;
    return new URL(`http://fakestore.org/${targetPath}`);
  }

  async putStream(targetPath: string, callback: PassThroughCallback): Promise<URL> {
    const readWriteStream = new PassThrough();
    callback(readWriteStream);
    this.store[targetPath] = readWriteStream;
    return new URL(`http://fakestore.org/${targetPath}`);
  }

  getStore(): Record<string, Content | PassThrough> {
    return this.store;
  }
}
