import { ethers } from "ethers";

import * as config from "./config";
import { createBroadcast, createReply, createReaction, sign, SignedAnnouncement } from "./core/announcements";
import { EmptyBatchError } from "./core/batch";
import { createPublication, createPublications } from "./createPublication";
import TestStore from "./test/testStore";

describe("createPublication", () => {
  let store: TestStore;
  const messages = [
    createBroadcast(
      "dsnp://0123456789ABCDEF",
      "https://dsnp.org",
      "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
    ),
  ];

  beforeEach(() => {
    jest.setTimeout(12000);

    store = new TestStore();

    config.setConfig({
      currentFromId: "dsnp://0123456789ABCDEF",
      signer: new ethers.Wallet("0xd98d551044eb9ef4c9a2afd1d9c95646e22b710da55c8dc95431038d5544d804"),
      store: store,
    });
  });

  describe("when passed a valid message iterator", () => {
    it("returns an publications for the passed in messages", async () => {
      const signedMessages = await Promise.all(messages.map(async (msg) => await sign(msg)));
      const publications = await createPublication(signedMessages);

      expect(publications).toMatchObject({
        announcementType: 2,
        fileHash: expect.stringMatching(/[a-z0-9]{64}/),
        fileUrl: expect.stringMatching(/http:\/\/fakestore\.org\/[a-z0-9]{32}/),
      });
    });

    it("stores the messages provided at the returned URL", async () => {
      const signedMessages = await Promise.all(messages.map(async (msg) => await sign(msg)));
      const publication = await createPublication(signedMessages);
      const filename = publication.fileUrl.split(".org/")[1];
      const files = store.getStore();

      expect(files[filename].toString()).toMatchSnapshot();
    });
  });

  describe("when passed a message iterator containing no messages", () => {
    const badMessages: Array<SignedAnnouncement> = [];

    it("throws EmptyBatchError", async () => {
      await expect(createPublication(badMessages)).rejects.toThrow(EmptyBatchError);
    });
  });
});

describe("createPublications", () => {
  let store: TestStore;
  const messages = [
    createBroadcast(
      "dsnp://0123456789ABCDEF",
      "https://dsnp.org",
      "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
    ),
    createBroadcast(
      "dsnp://0123456789ABCDE0",
      "https://dsnp.org",
      "0x1123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
    ),
    createReply(
      "dsnp://0123456789ABCDEF",
      "https://dsnp.org",
      "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
      "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
    ),
    createReaction(
      "dsnp://0123456789ABCDEF",
      "🏳️‍🌈",
      "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
    ),
    createReaction(
      "dsnp://0123456789ABCDEF",
      "🏳️‍🌈",
      "dsnp://0123456789ABCDE0/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
    ),
  ];

  beforeEach(() => {
    jest.setTimeout(12000);

    store = new TestStore();

    config.setConfig({
      currentFromId: "dsnp://0123456789ABCDEF",
      signer: new ethers.Wallet("0xd98d551044eb9ef4c9a2afd1d9c95646e22b710da55c8dc95431038d5544d804"),
      store: store,
    });
  });

  it("returns an array of valid publications for each message type", async () => {
    const signedMessages = await Promise.all(messages.map(async (msg) => await sign(msg)));
    const publications = await createPublications(signedMessages);

    expect(publications).toMatchObject([
      {
        announcementType: 2,
        fileHash: expect.stringMatching(/[a-z0-9]{64}/),
        fileUrl: expect.stringMatching(/http:\/\/fakestore\.org\/[a-z0-9]{32}/),
      },
      {
        announcementType: 3,
        fileHash: expect.stringMatching(/[a-z0-9]{64}/),
        fileUrl: expect.stringMatching(/http:\/\/fakestore\.org\/[a-z0-9]{32}/),
      },
      {
        announcementType: 4,
        fileHash: expect.stringMatching(/[a-z0-9]{64}/),
        fileUrl: expect.stringMatching(/http:\/\/fakestore\.org\/[a-z0-9]{32}/),
      },
    ]);
  });

  it("stores the messages provided at the returned URL", async () => {
    const signedMessages = await Promise.all(messages.map(async (msg) => await sign(msg)));
    const publications = await createPublications(signedMessages);

    for (const publication of publications) {
      const filename = publication.fileUrl.split(".org/")[1];
      const files = store.getStore();

      expect(files[filename].toString()).toMatchSnapshot();
    }
  });
});
