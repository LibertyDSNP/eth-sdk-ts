import { keccak256 } from "js-sha3";

import * as config from "../config/config";
import * as content from "./content";
import { DSNPType } from "../messages/messages";
import TestStore from "../test/testStore";
import { MissingStoreError, MissingUser } from "../utilities";

describe("content", () => {
  describe("broadcast", () => {
    describe("with a valid storage adapter and user id", () => {
      let store: TestStore;

      beforeEach(() => {
        store = new TestStore();

        config.setConfig({
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

      it("returns a broadcast DSNP message linking to the activity pub object", async () => {
        const message = await content.broadcast({
          attributedTo: "John Doe <johndoe@sample.org>",
          content: "Lorem ipsum delor blah blah blah",
          name: "Lorem Ipsum",
        });

        const storeContents = store.getStore();
        const keys = Object.keys(storeContents);
        expect(keys.length).toEqual(1);

        expect(message).toMatchObject({
          fromId: "dsnp://0123456789ABCDEF",
          type: DSNPType.Broadcast,
          uri: `http://fakestore.org/${keys[0]}`,
          contentHash: keccak256(storeContents[keys[0]] as string),
        });
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreError", async () => {
        config.setConfig({
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
      it("throws MissingUser", async () => {
        config.setConfig({
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
