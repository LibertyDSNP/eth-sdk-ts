import { ethers } from "ethers";
import { keccak256 } from "js-sha3";

import * as config from "./config";
import * as content from "./content";
import { createNote, createProfile, InvalidActivityContentError } from "./core/activityContent";
import { AnnouncementType } from "./core/announcements";
import { InvalidAnnouncementIdentifierError } from "./core/identifiers";
import { MissingSignerConfigError, MissingStoreConfigError, MissingFromIdConfigError } from "./core/config";
import TestStore from "./test/testStore";

describe("content", () => {
  const noteObject = createNote("Hello world!");

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

      describe("with valid activity content options", () => {
        it("uploads an activity content object matching the provided specifications", async () => {
          await content.broadcast(noteObject);

          const storeContents = store.getStore();
          const keys = Object.keys(storeContents);
          expect(keys.length).toEqual(1);

          expect(storeContents[keys[0]].toString()).toMatch(
            /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","content":"Hello world!","published":"[0-9TZ\-:.]+","type":"Note"\}/
          );
        });

        it("returns a broadcast announcement linking to the activity content object", async () => {
          const announcement = await content.broadcast(noteObject);

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

      describe("with invalid activity content options", () => {
        it("throws InvalidActivityContentError", async () => {
          await expect(
            content.broadcast({
              ...noteObject,
              published: "Yesterday",
            })
          ).rejects.toThrow(InvalidActivityContentError);
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

        await expect(content.broadcast(noteObject)).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreConfigError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: ethers.Wallet.createRandom(),
          store: undefined,
        });

        await expect(content.broadcast(noteObject)).rejects.toThrow(MissingStoreConfigError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingFromIdConfigError", async () => {
        config.setConfig({
          currentFromId: undefined,
          signer: ethers.Wallet.createRandom(),
          store: new TestStore(),
        });

        await expect(content.broadcast(noteObject)).rejects.toThrow(MissingFromIdConfigError);
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

      describe("with valid activity content options and a valid inReplyTo Id", () => {
        it("uploads an activity content object matching the provided specifications", async () => {
          await content.reply(
            noteObject,
            "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
          );

          const storeContents = store.getStore();
          const keys = Object.keys(storeContents);
          expect(keys.length).toEqual(1);

          expect(storeContents[keys[0]].toString()).toMatch(
            /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","content":"Hello world!","published":"[0-9TZ\-:.]+","type":"Note"\}/
          );
        });

        it("returns a reply announcement linking to the activity content object", async () => {
          const announcement = await content.reply(
            noteObject,
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
          await expect(content.reply(noteObject, "dsnp://badbadbad/badbadbad")).rejects.toThrow(
            InvalidAnnouncementIdentifierError
          );
        });
      });

      describe("with invalid activity content options", () => {
        it("throws InvalidActivityContentError", async () => {
          await expect(
            content.reply(
              {
                ...noteObject,
                published: "Tomorrow",
              },
              "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
            )
          ).rejects.toThrow(InvalidActivityContentError);
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
            noteObject,
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
            noteObject,
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
            noteObject,
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
    const profileObject = createProfile("🌹🚗");

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

      describe("with valid activity content options", () => {
        it("uploads an activity content object matching the provided specifications", async () => {
          await content.profile(profileObject);

          const storeContents = store.getStore();
          const keys = Object.keys(storeContents);
          expect(keys.length).toEqual(1);

          expect(storeContents[keys[0]].toString()).toMatch(
            /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","describes":{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","name":"🌹🚗","published":"[0-9TZ\-:.]+","type":"Person"},"published":"[0-9TZ\-:.]+","type":"Profile"}/
          );
        });

        it("returns a profile announcement linking to the activity content object", async () => {
          const announcement = await content.profile(profileObject);

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

      describe("with invalid activity content options", () => {
        it("throws InvalidActivityContentError", async () => {
          await expect(
            content.profile({
              ...profileObject,
              published: "Someday",
            })
          ).rejects.toThrow(InvalidActivityContentError);
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

        await expect(content.profile(profileObject)).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreConfigError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0123456789ABCDEF",
          signer: ethers.Wallet.createRandom(),
          store: undefined,
        });

        await expect(content.profile(profileObject)).rejects.toThrow(MissingStoreConfigError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingFromIdConfigError", async () => {
        config.setConfig({
          currentFromId: undefined,
          signer: ethers.Wallet.createRandom(),
          store: new TestStore(),
        });

        await expect(content.profile(profileObject)).rejects.toThrow(MissingFromIdConfigError);
      });
    });
  });
});
