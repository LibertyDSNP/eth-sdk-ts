import { ethers } from "ethers";

import * as config from "../config/config";
import * as content from "./content";
import { DSNPType } from "../messages/messages";
import MemoryQueue from "../queue/memoryQueue";
import TestStore from "../test/testStore";
import { MissingSigner, MissingStore } from "../utilities";

describe("content", () => {
  describe("broadcast", () => {
    describe("with a valid signer and storage adapter", () => {
      let queue: MemoryQueue;
      let store: TestStore;

      beforeEach(() => {
        queue = new MemoryQueue();
        store = new TestStore();

        config.setConfig({
          queue: queue,
          store: store,
          signer: ethers.Wallet.createRandom(),
        });
      });

      it("uploads an activity pub object matching the provided specifications", async () => {
        await content.broadcast({
          author: "John Doe <johndoe@sample.org>",
          body: "Lorem ipsum delor blah blah blah",
          title: "Lorem Ipsum",
        });

        const storeContents = store.getStore();
        const keys = Object.keys(storeContents);
        expect(keys.length).toEqual(1);

        expect(storeContents[keys[0]]).toEqual("");
      });

      it("enqueues a broadcast DSNP message linking to the activity pub object", async () => {
        await content.broadcast({
          author: "John Doe <johndoe@sample.org>",
          body: "Lorem ipsum delor blah blah blah",
          title: "Lorem Ipsum",
        });

        const storeContents = store.getStore();
        const keys = Object.keys(storeContents);
        expect(keys.length).toEqual(1);

        const messages = await queue.getAll();

        expect(messages.length).toEqual(1);
        expect(messages[0]).toMatchObject({
          type: DSNPType.Broadcast,
          uri: `http://fakestore.org/${keys[0]}`,
        });
      });
    });

    describe("without a valid signer", () => {
      it("throws MissingSigner", async () => {
        config.setConfig({
          queue: new MemoryQueue(),
          store: new TestStore(),
        });

        await expect(
          content.broadcast({
            author: "John Doe <johndoe@sample.org>",
            body: "Lorem ipsum delor blah blah blah",
            title: "Lorem Ipsum",
          })
        ).rejects.toThrow(MissingSigner);
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStore", async () => {
        config.setConfig({
          queue: new MemoryQueue(),
          signer: ethers.Wallet.createRandom(),
        });

        await expect(
          content.broadcast({
            author: "John Doe <johndoe@sample.org>",
            body: "Lorem ipsum delor blah blah blah",
            title: "Lorem Ipsum",
          })
        ).rejects.toThrow(MissingStore);
      });
    });
  });

  // describe("reply", () => {
  //   describe("with a valid signer and storage adapter", () => {
  //     beforeEach(() => {
  //       config.setConfig({
  //         queue: MemoryQueue(),
  //         store: new TestStore(),
  //         signer: ethers.Wallet.createRandom(),
  //       });
  //     });
  //
  //     it("uploads an activity pub object matching the provided specifications", async () => {});
  //
  //     it("enqueues a reply DSNP message linking to the activity pub object", async () => {});
  //   });
  //
  //   describe("without a valid signer", () => {
  //     beforeEach(() => {
  //       config.setConfig({
  //         queue: MemoryQueue(),
  //         store: new TestStore(),
  //       });
  //     });
  //
  //     it("throws MissingSigner", async () => {});
  //   });
  //
  //   describe("without a storage adapter", () => {
  //     beforeEach(() => {
  //       config.setConfig({
  //         queue: MemoryQueue(),
  //         signer: ethers.Wallet.createRandom(),
  //       });
  //     });
  //
  //     it("throws MissingStore", async () => {});
  //   });
  // });
  //
  // describe("react", () => {
  //   describe("with a valid signer", () => {
  //     beforeEach(() => {
  //       config.setConfig({
  //         queue: MemoryQueue(),
  //         signer: ethers.Wallet.createRandom(),
  //       });
  //     });
  //
  //     it("enqueues a react DSNP message linking to the activity pub object", async () => {});
  //   });
  //
  //   describe("without a valid signer", () => {
  //     beforeEach(() => {
  //       config.setConfig({
  //         queue: MemoryQueue(),
  //       });
  //     });
  //
  //     it("throws MissingSigner", async () => {});
  //   });
  // });
});
