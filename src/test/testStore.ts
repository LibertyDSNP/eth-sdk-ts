import { Content, File, StorageInterface } from "../core/storage/storage";

export default class TestStore implements StorageInterface {
  store: Record<string, Content>;

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

  getStore(): Record<string, Content> {
    return this.store;
  }
}
