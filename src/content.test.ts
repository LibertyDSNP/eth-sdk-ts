import * as config from "../config/config";
import * as content from "./content";
import { DSNPType } from "../messages/messages";
import MemoryQueue from "../queue/memoryQueue";
import TestStore from "../test/testStore";
import { MissingStoreError, MissingUser } from "../utilities";

describe("content", () => {
  describe("broadcast", () => {
    describe("with a valid storage adapter and user id", () => {
      let queue: MemoryQueue;
      let store: TestStore;

      beforeEach(() => {
        queue = new MemoryQueue();
        store = new TestStore();

        config.setConfig({
          queue: queue,
          store: store,
          currentUserId: "dsnp://0123456789ABCDEF",
        });
      });

      it("uploads an activity pub object matching the provided specifications", async () => {
        await content.broadcast({
          attributedTo: "John Doe <johndoe@sample.org>",
          content: "Lorem ipsum delor blah blah blah",
          name: "Lorem Ipsum",
        });

        const storeContents = store.getStore();
        const keys = Object.keys(storeContents);
        expect(keys.length).toEqual(1);

        expect(storeContents[keys[0]]).toMatch(
          /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","attributedTo":"John Doe <johndoe@sample\.org>","content":"Lorem ipsum delor blah blah blah","name":"Lorem Ipsum","published":"[0-9TZ\-:.]+","type":"Note"\}/
        );
      });

      it("enqueues a broadcast DSNP message linking to the activity pub object", async () => {
        await content.broadcast({
          attributedTo: "John Doe <johndoe@sample.org>",
          content: "Lorem ipsum delor blah blah blah",
          name: "Lorem Ipsum",
        });

        const storeContents = store.getStore();
        const keys = Object.keys(storeContents);
        expect(keys.length).toEqual(1);

        const message = await queue.dequeue(DSNPType.Broadcast);

        expect(message).toMatchObject({
          type: DSNPType.Broadcast,
          uri: `http://fakestore.org/${keys[0]}`,
        });
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStore", async () => {
        config.setConfig({
          queue: new MemoryQueue(),
          currentUserId: "dsnp://0123456789ABCDEF",
        });

        await expect(
          content.broadcast({
            attributedTo: "John Doe <johndoe@sample.org>",
            content: "Lorem ipsum delor blah blah blah",
            name: "Lorem Ipsum",
          })
        ).rejects.toThrow(MissingStoreError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingStore", async () => {
        config.setConfig({
          queue: new MemoryQueue(),
          store: new TestStore(),
        });

        await expect(
          content.broadcast({
            attributedTo: "John Doe <johndoe@sample.org>",
            content: "Lorem ipsum delor blah blah blah",
            name: "Lorem Ipsum",
          })
        ).rejects.toThrow(MissingUser);
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
