import { ethers, Signer } from "ethers";

import { setConfig } from "./config";
import * as content from "./content";
import { follow } from "./network";
import { createNote, createProfile, InvalidActivityContentError } from "./core/activityContent";
import {
  AnnouncementType,
  SignedBroadcastAnnouncement,
  InvalidEmojiStringError,
  InvalidTombstoneAnnouncementTypeError,
  InvalidTombstoneAnnouncementSignatureError,
} from "./core/announcements";
import { MissingSignerConfigError, MissingStoreConfigError, MissingFromIdConfigError } from "./core/config";
import { createCloneProxy } from "./core/contracts/identity";
import * as registry from "./core/contracts/registry";
import { InvalidAnnouncementUriError } from "./core/identifiers";
import { hash } from "./core/utilities";
import { revertHardhat, snapshotHardhat, setupSnapshot } from "./test/hardhatRPC";
import { setupConfig } from "./test/sdkTestConfig";
import TestStore from "./test/testStore";

describe("content", () => {
  setupSnapshot();

  const noteObject = createNote("Hello world!");

  let provider: ethers.providers.JsonRpcProvider;
  let signer: Signer;

  beforeAll(async () => {
    ({ provider, signer } = setupConfig());
    await snapshotHardhat(provider);
    const receipt = await (await createCloneProxy()).wait();
    const proxyContractEvent = receipt.events?.find((event) => event.event === "ProxyCreated");
    const address = proxyContractEvent?.args?.[0];
    await (await registry.register(address, "BigBilly")).wait();
  });

  afterAll(async () => {
    await revertHardhat(provider);
  });

  describe("broadcast", () => {
    describe("with a valid signer, storage adapter and user URI", () => {
      let store: TestStore;

      beforeEach(() => {
        store = new TestStore();

        setConfig({
          currentFromURI: "dsnp://0x123456789abcdef",
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
            /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","content":"Hello world!","mediaType":"text\/plain","type":"Note"\}/
          );
        });

        it("returns a broadcast announcement linking to the activity content object", async () => {
          const announcement = await content.broadcast(noteObject);

          const storeContents = store.getStore();
          const keys = Object.keys(storeContents);
          expect(keys.length).toEqual(1);

          expect(announcement).toMatchObject({
            fromId: "0x123456789abcdef",
            announcementType: AnnouncementType.Broadcast,
            url: `http://fakestore.org/${keys[0]}`,
            contentHash: hash(storeContents[keys[0]] as string),
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
        setConfig({
          currentFromURI: "dsnp://0x123456789abcdef",
          signer: undefined,
          store: new TestStore(),
        });

        await expect(content.broadcast(noteObject)).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreConfigError", async () => {
        setConfig({
          currentFromURI: "dsnp://0x123456789abcdef",
          signer: ethers.Wallet.createRandom(),
          store: undefined,
        });

        await expect(content.broadcast(noteObject)).rejects.toThrow(MissingStoreConfigError);
      });
    });

    describe("without a user URI", () => {
      it("throws MissingFromIdConfigError", async () => {
        setConfig({
          currentFromURI: undefined,
          signer,
          store: new TestStore(),
        });

        await expect(content.broadcast(noteObject)).rejects.toThrow(MissingFromIdConfigError);
      });
    });
  });

  describe("reply", () => {
    describe("with a valid signer, storage adapter and user URI", () => {
      let store: TestStore;

      beforeEach(() => {
        store = new TestStore();

        setConfig({
          currentFromURI: "dsnp://0x123456789abcdef",
          signer: ethers.Wallet.createRandom(),
          store: store,
        });
      });

      describe("with valid activity content options and a valid inReplyTo Id", () => {
        it("uploads an activity content object matching the provided specifications", async () => {
          await content.reply(
            noteObject,
            "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
          );

          const storeContents = store.getStore();
          const keys = Object.keys(storeContents);
          expect(keys.length).toEqual(1);

          expect(storeContents[keys[0]].toString()).toMatch(
            /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","content":"Hello world!","mediaType":"text\/plain","type":"Note"\}/
          );
        });

        it("returns a reply announcement linking to the activity content object", async () => {
          const announcement = await content.reply(
            noteObject,
            "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
          );

          const storeContents = store.getStore();
          const keys = Object.keys(storeContents);
          expect(keys.length).toEqual(1);

          expect(announcement).toMatchObject({
            fromId: "0x123456789abcdef",
            announcementType: AnnouncementType.Reply,
            url: `http://fakestore.org/${keys[0]}`,
            contentHash: hash(storeContents[keys[0]] as string),
            inReplyTo: "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
          });
        });
      });

      describe("with an invalid inReplyTo Id", () => {
        it("throws InvalidAnnouncementUriError", async () => {
          await expect(content.reply(noteObject, "dsnp://badbadbad/badbadbad")).rejects.toThrow(
            InvalidAnnouncementUriError
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
              "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
            )
          ).rejects.toThrow(InvalidActivityContentError);
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingSignerConfigError", async () => {
        setConfig({
          currentFromURI: "dsnp://0x123456789abcdef",
          signer: undefined,
          store: new TestStore(),
        });

        await expect(
          content.reply(
            noteObject,
            "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
          )
        ).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreConfigError", async () => {
        setConfig({
          currentFromURI: "dsnp://0x123456789abcdef",
          signer: ethers.Wallet.createRandom(),
          store: undefined,
        });

        await expect(
          content.reply(
            noteObject,
            "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
          )
        ).rejects.toThrow(MissingStoreConfigError);
      });
    });

    describe("without a user URI", () => {
      it("throws MissingFromIdConfigError", async () => {
        setConfig({
          currentFromURI: undefined,
          signer,
          store: new TestStore(),
        });

        await expect(
          content.reply(
            noteObject,
            "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
          )
        ).rejects.toThrow(MissingFromIdConfigError);
      });
    });
  });

  describe("react", () => {
    describe("with a valid signer and user URI", () => {
      beforeEach(() => {
        setConfig({
          currentFromURI: "dsnp://0x123456789abcdef",
          signer: ethers.Wallet.createRandom(),
        });
      });

      it("returns a reaction announcement", async () => {
        const announcement = await content.react(
          "🏳️‍🌈",
          "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );

        expect(announcement).toMatchObject({
          fromId: "0x123456789abcdef",
          announcementType: AnnouncementType.Reaction,
          emoji: "🏳️‍🌈",
          inReplyTo: "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingSignerConfigError", async () => {
        setConfig({
          currentFromURI: "dsnp://0x123456789abcdef",
          signer: undefined,
        });

        await expect(
          content.react(
            "🏴‍☠️",
            "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
          )
        ).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a user URI", () => {
      it("throws MissingFromIdConfigError", async () => {
        setConfig({
          currentFromURI: undefined,
          signer,
        });

        await expect(
          content.react(
            "🏴‍☠️",
            "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
          )
        ).rejects.toThrow(MissingFromIdConfigError);
      });
    });

    describe("with an invalid emoji string", () => {
      it("throws InvalidEmojiStringError", async () => {
        setConfig({
          currentFromURI: undefined,
          signer,
        });

        await expect(
          content.react(
            "not emoji",
            "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
          )
        ).rejects.toThrow(InvalidEmojiStringError);
      });
    });
  });

  describe("profile", () => {
    const profileObject = createProfile({ name: "🌹🚗" });

    describe("with a valid signer, storage adapter and user URI", () => {
      let store: TestStore;

      beforeEach(() => {
        store = new TestStore();

        setConfig({
          currentFromURI: "dsnp://0x123456789abcdef",
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
            /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","name":"🌹🚗","type":"Profile"}/
          );
        });

        it("returns a profile announcement linking to the activity content object", async () => {
          const announcement = await content.profile(profileObject);

          const storeContents = store.getStore();
          const keys = Object.keys(storeContents);
          expect(keys.length).toEqual(1);

          expect(announcement).toMatchObject({
            fromId: "0x123456789abcdef",
            announcementType: AnnouncementType.Profile,
            url: `http://fakestore.org/${keys[0]}`,
            contentHash: hash(storeContents[keys[0]] as string),
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
        setConfig({
          currentFromURI: "dsnp://0x123456789abcdef",
          signer: undefined,
          store: new TestStore(),
        });

        await expect(content.profile(profileObject)).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreConfigError", async () => {
        setConfig({
          currentFromURI: "dsnp://0x123456789abcdef",
          signer: ethers.Wallet.createRandom(),
          store: undefined,
        });

        await expect(content.profile(profileObject)).rejects.toThrow(MissingStoreConfigError);
      });
    });

    describe("without a user URI", () => {
      it("throws MissingFromIdConfigError", async () => {
        setConfig({
          currentFromURI: undefined,
          signer,
          store: new TestStore(),
        });

        await expect(content.profile(profileObject)).rejects.toThrow(MissingFromIdConfigError);
      });
    });
  });

  describe("tombstone", () => {
    describe("with a valid signer and user URI", () => {
      beforeEach(() => {
        setConfig({
          currentFromURI: "dsnp://0x00000000000003e8",
          signer,
          provider,
        });
      });

      it("returns a reaction announcement", async () => {
        const broadcastAnnouncement = await content.broadcast(noteObject);
        const announcement = await content.tombstone(broadcastAnnouncement);

        expect(announcement).toMatchObject({
          fromId: "0x3e8",
          announcementType: AnnouncementType.Tombstone,
          targetAnnouncementType: AnnouncementType.Broadcast,
          targetSignature: broadcastAnnouncement.signature,
        });
      });
    });

    describe("without a user URI", () => {
      it("throws MissingFromIdConfigError", async () => {
        setConfig({
          currentFromURI: "dsnp://0x00000000000003e8",
          signer,
          provider,
        });
        const broadcastAnnouncement = await content.broadcast(noteObject);

        setConfig({
          currentFromURI: undefined,
          signer,
          provider,
        });

        await expect(content.tombstone(broadcastAnnouncement)).rejects.toThrow(MissingFromIdConfigError);
      });
    });

    describe("with an invalid target type", () => {
      it("throws InvalidTombstoneAnnouncementTypeError", async () => {
        setConfig({
          currentFromURI: "dsnp://0x00000000000003e8",
          signer,
          provider,
        });
        const followAnnouncement = await follow("dsnp://0x0");

        await expect(content.tombstone(followAnnouncement as unknown as SignedBroadcastAnnouncement)).rejects.toThrow(
          InvalidTombstoneAnnouncementTypeError
        );
      });
    });

    describe("with an invalid target signature", () => {
      it("throws InvalidTombstoneAnnouncementSignatureError", async () => {
        setConfig({
          currentFromURI: "dsnp://0x00000000000003e8",
          signer,
          provider,
        });
        const broadcastAnnouncement = await content.broadcast(noteObject);
        broadcastAnnouncement.signature = "0x0";

        await expect(content.tombstone(broadcastAnnouncement)).rejects.toThrow(
          InvalidTombstoneAnnouncementSignatureError
        );
      });
    });
  });
});
