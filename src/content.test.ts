import { ethers } from "ethers";
import { keccak256 } from "js-sha3";

import * as config from "./config";
import * as content from "./content";
import { InvalidActivityPubError } from "./core/activityPub";
import { InvalidAnnouncementIdentifierError } from "./core/identifiers";
import { MissingSignerConfigError, MissingStoreConfigError, MissingFromIdConfigError } from "./core/config";
import { AnnouncementType } from "./core/announcements";
import TestStore from "./test/testStore";

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

          expect(storeContents[keys[0]].toString()).toMatch(
            /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","attributedTo":"John Doe <johndoe@sample\.org>","content":"Lorem ipsum delor blah blah blah","name":"Lorem Ipsum","published":"[0-9TZ\-:.]+","type":"Note"\}/
          );
        });

        it("returns a broadcast announcement linking to the activity pub object", async () => {
          const announcement = await content.broadcast({
            attributedTo: "John Doe <johndoe@sample.org>",
            content: "Lorem ipsum delor blah blah blah",
            name: "Lorem Ipsum",
          });

          const storeContents = store.getStore();
          const keys = Object.keys(storeContents);
          expect(keys.length).toEqual(1);

          expect(announcement).toMatchObject({
            fromId: "dsnp://0123456789ABCDEF",
            announcementType: AnnouncementType.Broadcast,
            url: `http://fakestore.org/${keys[0]}`,
            contentHash: keccak256(storeContents[keys[0]] as string),
          });
        });
      });

      describe("with invalid activity pub options", () => {
        it("throws InvalidActivityPubError", async () => {
          await expect(
            content.broadcast({
              attributedTo: "John Doe <johndoe@sample.org>",
              content: "Lorem ipsum delor blah blah blah",
              name: "Lorem Ipsum",
              published: "Yesterday",
            })
          ).rejects.toThrow(InvalidActivityPubError);
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingSignerConfigError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: undefined,
          store: new TestStore(),
        });

        await expect(
          content.broadcast({
            attributedTo: "John Doe <johndoe@sample.org>",
            content: "Lorem ipsum delor blah blah blah",
            name: "Lorem Ipsum",
          })
        ).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreConfigError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: ethers.Wallet.createRandom(),
          store: undefined,
        });

        await expect(
          content.broadcast({
            attributedTo: "John Doe <johndoe@sample.org>",
            content: "Lorem ipsum delor blah blah blah",
            name: "Lorem Ipsum",
          })
        ).rejects.toThrow(MissingStoreConfigError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingFromIdConfigError", async () => {
        config.setConfig({
          currentFromId: undefined,
          signer: ethers.Wallet.createRandom(),
          store: new TestStore(),
        });

        await expect(
          content.broadcast({
            attributedTo: "John Doe <johndoe@sample.org>",
            content: "Lorem ipsum delor blah blah blah",
            name: "Lorem Ipsum",
          })
        ).rejects.toThrow(MissingFromIdConfigError);
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

          expect(storeContents[keys[0]].toString()).toMatch(
            /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","attributedTo":"John Doe <johndoe@sample\.org>","content":"Lorem ipsum delor blah blah blah","inReplyTo":"dsnp:\/\/0123456789ABCDEF\/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF","name":"Lorem Ipsum","published":"[0-9TZ\-:.]+","type":"Note"\}/
          );
        });

        it("returns a reply announcement linking to the activity pub object", async () => {
          const announcement = await content.reply(
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

          expect(announcement).toMatchObject({
            fromId: "dsnp://0123456789ABCDEF",
            announcementType: AnnouncementType.Reply,
            url: `http://fakestore.org/${keys[0]}`,
            contentHash: keccak256(storeContents[keys[0]] as string),
            inReplyTo: "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
          });
        });
      });

      describe("with an invalid inReplyTo Id", () => {
        it("throws InvalidAnnouncementIdentifierError", async () => {
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
          ).rejects.toThrow(InvalidAnnouncementIdentifierError);
        });
      });

      describe("with invalid activity pub options", () => {
        it("throws InvalidActivityPubError", async () => {
          await expect(
            content.reply(
              {
                attributedTo: "John Doe <johndoe@sample.org>",
                content: "Lorem ipsum delor blah blah blah",
                name: "Lorem Ipsum",
              },
              "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
            )
          ).rejects.toThrow(InvalidActivityPubError);
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingSignerConfigError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: undefined,
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
        ).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreConfigError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: ethers.Wallet.createRandom(),
          store: undefined,
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
        ).rejects.toThrow(MissingStoreConfigError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingFromIdConfigError", async () => {
        config.setConfig({
          currentFromId: undefined,
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
        ).rejects.toThrow(MissingFromIdConfigError);
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

      it("returns a reaction announcement", async () => {
        const announcement = await content.react(
          "🏳️‍🌈",
          "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
        );

        expect(announcement).toMatchObject({
          fromId: "dsnp://0123456789ABCDEF",
          announcementType: AnnouncementType.Reaction,
          emoji: "🏳️‍🌈",
          inReplyTo: "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingSignerConfigError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: undefined,
        });

        await expect(
          content.react(
            "🏴‍☠️",
            "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
          )
        ).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingFromIdConfigError", async () => {
        config.setConfig({
          currentFromId: undefined,
          signer: ethers.Wallet.createRandom(),
        });

        await expect(
          content.react(
            "🏴‍☠️",
            "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
          )
        ).rejects.toThrow(MissingFromIdConfigError);
      });
    });
  });

  describe("profile", () => {
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
          await content.profile({
            type: "Person",
            name: "Rose Karr",
            preferredUsername: "rosalinekarr",
          });

          const storeContents = store.getStore();
          const keys = Object.keys(storeContents);
          expect(keys.length).toEqual(1);

          expect(storeContents[keys[0]].toString()).toMatch(
            /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","name":"Rose Karr","preferredUsername":"rosalinekarr","published":"[0-9TZ\-:.]+","type":"Person"\}/
          );
        });

        it("returns a profile announcement linking to the activity pub object", async () => {
          const announcement = await content.profile({
            type: "Person",
            name: "Rose Karr",
            preferredUsername: "rosalinekarr",
          });

          const storeContents = store.getStore();
          const keys = Object.keys(storeContents);
          expect(keys.length).toEqual(1);

          expect(announcement).toMatchObject({
            fromId: "dsnp://0123456789ABCDEF",
            announcementType: AnnouncementType.Profile,
            url: `http://fakestore.org/${keys[0]}`,
            contentHash: keccak256(storeContents[keys[0]] as string),
          });
        });
      });

      describe("with invalid activity pub options", () => {
        it("throws InvalidActivityPubError", async () => {
          await expect(
            content.profile({
              type: "Note",
              name: "Rose Karr",
              preferredUsername: "rosalinekarr",
            })
          ).rejects.toThrow(InvalidActivityPubError);
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingSignerConfigError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: undefined,
          store: new TestStore(),
        });

        await expect(
          content.profile({
            type: "Person",
            name: "Rose Karr",
            preferredUsername: "rosalinekarr",
          })
        ).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreConfigError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: ethers.Wallet.createRandom(),
          store: undefined,
        });

        await expect(
          content.profile({
            type: "Person",
            name: "Rose Karr",
            preferredUsername: "rosalinekarr",
          })
        ).rejects.toThrow(MissingStoreConfigError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingFromIdConfigError", async () => {
        config.setConfig({
          currentFromId: undefined,
          signer: ethers.Wallet.createRandom(),
          store: new TestStore(),
        });

        await expect(
          content.profile({
            type: "Person",
            name: "Rose Karr",
            preferredUsername: "rosalinekarr",
          })
        ).rejects.toThrow(MissingFromIdConfigError);
      });
    });
  });
});
