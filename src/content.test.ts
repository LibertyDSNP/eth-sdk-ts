import { ethers } from "ethers";
import { keccak256 } from "js-sha3";

import * as config from "./config";
import * as content from "./content";
import { DSNPType } from "./core/messages/messages";
import TestStore from "./test/testStore";
import { MissingSigner, MissingStoreError, MissingUser } from "./core/utilities";

describe("content", () => {
  describe("broadcast", () => {
    describe("with a valid signer, storage adapter and user id", () => {
      let store: TestStore;

      beforeEach(() => {
        store = new TestStore();

        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: ethers.Wallet.createRandom(),
          store: store,
        });
      });

      describe("with valid activity pub options", () => {
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
            dsnpType: DSNPType.Broadcast,
            uri: `http://fakestore.org/${keys[0]}`,
            contentHash: keccak256(storeContents[keys[0]] as string),
          });
        });
      });

      describe("with invalid activity pub options", () => {
        it("throws InvalidActivityPubOpts", async () => {
          await expect(
            content.broadcast({
              attributedTo: "John Doe <johndoe@sample.org>",
              content: "Lorem ipsum delor blah blah blah",
              name: "Lorem Ipsum",
              published: "Yesterday",
            })
          ).rejects.toThrow(content.InvalidActivityPubOpts);
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingStoreError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          store: new TestStore(),
        });

        await expect(
          content.broadcast({
            attributedTo: "John Doe <johndoe@sample.org>",
            content: "Lorem ipsum delor blah blah blah",
            name: "Lorem Ipsum",
          })
        ).rejects.toThrow(MissingSigner);
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: ethers.Wallet.createRandom(),
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
          signer: ethers.Wallet.createRandom(),
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

  describe("reply", () => {
    describe("with a valid signer, storage adapter and user id", () => {
      let store: TestStore;

      beforeEach(() => {
        store = new TestStore();

        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: ethers.Wallet.createRandom(),
          store: store,
        });
      });

      describe("with valid activity pub options and a valid inReplyTo Id", () => {
        it("uploads an activity pub object matching the provided specifications", async () => {
          await content.reply(
            {
              attributedTo: "John Doe <johndoe@sample.org>",
              content: "Lorem ipsum delor blah blah blah",
              name: "Lorem Ipsum",
              inReplyTo: "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
            },
            "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
          );

          const storeContents = store.getStore();
          const keys = Object.keys(storeContents);
          expect(keys.length).toEqual(1);

          expect(storeContents[keys[0]]).toMatch(
            /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","attributedTo":"John Doe <johndoe@sample\.org>","content":"Lorem ipsum delor blah blah blah","inReplyTo":"dsnp:\/\/0123456789ABCDEF\/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF","name":"Lorem Ipsum","published":"[0-9TZ\-:.]+","type":"Note"\}/
          );
        });

        it("returns a reply DSNP message linking to the activity pub object", async () => {
          const message = await content.reply(
            {
              attributedTo: "John Doe <johndoe@sample.org>",
              content: "Lorem ipsum delor blah blah blah",
              name: "Lorem Ipsum",
              inReplyTo: "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
            },
            "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
          );

          const storeContents = store.getStore();
          const keys = Object.keys(storeContents);
          expect(keys.length).toEqual(1);

          expect(message).toMatchObject({
            fromId: "dsnp://0123456789ABCDEF",
            dsnpType: DSNPType.Reply,
            uri: `http://fakestore.org/${keys[0]}`,
            contentHash: keccak256(storeContents[keys[0]] as string),
            inReplyTo: "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
          });
        });
      });

      describe("with an invalid inReplyTo Id", () => {
        it("throws InvalidActivityPubOpts", async () => {
          await expect(
            content.reply(
              {
                attributedTo: "John Doe <johndoe@sample.org>",
                content: "Lorem ipsum delor blah blah blah",
                name: "Lorem Ipsum",
                inReplyTo: "dsnp://badbadbad/badbadbadk",
              },
              "dsnp://badbadbad/badbadbad"
            )
          ).rejects.toThrow(content.InvalidInReplyTo);
        });
      });

      describe("with invalid activity pub options", () => {
        it("throws InvalidActivityPubOpts", async () => {
          await expect(
            content.reply(
              {
                attributedTo: "John Doe <johndoe@sample.org>",
                content: "Lorem ipsum delor blah blah blah",
                name: "Lorem Ipsum",
              },
              "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
            )
          ).rejects.toThrow(content.InvalidActivityPubOpts);
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingStoreError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          store: new TestStore(),
        });

        await expect(
          content.reply(
            {
              attributedTo: "John Doe <johndoe@sample.org>",
              content: "Lorem ipsum delor blah blah blah",
              name: "Lorem Ipsum",
              inReplyTo: "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
            },
            "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
          )
        ).rejects.toThrow(MissingSigner);
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: ethers.Wallet.createRandom(),
        });

        await expect(
          content.reply(
            {
              attributedTo: "John Doe <johndoe@sample.org>",
              content: "Lorem ipsum delor blah blah blah",
              name: "Lorem Ipsum",
              inReplyTo: "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
            },
            "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
          )
        ).rejects.toThrow(MissingStoreError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          signer: ethers.Wallet.createRandom(),
          store: new TestStore(),
        });

        await expect(
          content.reply(
            {
              attributedTo: "John Doe <johndoe@sample.org>",
              content: "Lorem ipsum delor blah blah blah",
              name: "Lorem Ipsum",
              inReplyTo: "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
            },
            "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
          )
        ).rejects.toThrow(MissingUser);
      });
    });
  });

  describe("react", () => {
    describe("with a valid signer and user id", () => {
      beforeEach(() => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: ethers.Wallet.createRandom(),
        });
      });

      it("returns a reaction DSNP message", async () => {
        const message = await content.react(
          "🏳️‍🌈",
          "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
        );

        expect(message).toMatchObject({
          fromId: "dsnp://0123456789ABCDEF",
          dsnpType: DSNPType.Reaction,
          emoji: "🏳️‍🌈",
          inReplyTo: "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
        });

        await expect(
          content.react(
            "🏴‍☠️",
            "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
          )
        ).rejects.toThrow(MissingSigner);
      });
    });

    describe("without a user id", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          signer: ethers.Wallet.createRandom(),
        });

        await expect(
          content.react(
            "🏴‍☠️",
            "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
          )
        ).rejects.toThrow(MissingUser);
      });
    });
  });
});
