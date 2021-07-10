import { ethers } from "ethers";

import * as config from "./config";
import { EmptyBatchError } from "./core/batch";
import { DSNPBatchMessage } from "./core/batch/batchMessages";
import { createBroadcastMessage, createReplyMessage, createReactionMessage, sign } from "./core/messages";
import { createPublication, createPublications } from "./createPublication";
import TestStore from "./test/testStore";

describe("createPublication", () => {
  let store: TestStore;
  const messages = [
    createBroadcastMessage(
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
        dsnpType: 2,
        hash: expect.stringMatching(/[a-z0-9]{64}/),
        url: expect.stringMatching(/http:\/\/fakestore\.org\/[a-z0-9]{32}/),
      });
    });

    it("stores the messages provided at the returned URL", async () => {
      const signedMessages = await Promise.all(messages.map(async (msg) => await sign(msg)));
      const publication = await createPublication(signedMessages);
      const filename = publication.url.split(".org/")[1];
      const files = store.getStore();

      expect(files[filename].toString()).toMatchSnapshot();
    });
  });

  describe("when passed a message iterator containing no messages", () => {
    const badMessages: Array<DSNPBatchMessage> = [];

    it("throws EmptyBatchError", async () => {
      await expect(createPublication(badMessages)).rejects.toThrow(EmptyBatchError);
    });
  });
});

describe("createPublications", () => {
  let store: TestStore;
  const messages = [
    createBroadcastMessage(
      "dsnp://0123456789ABCDEF",
      "https://dsnp.org",
      "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
    ),
    createBroadcastMessage(
      "dsnp://0123456789ABCDE0",
      "https://dsnp.org",
      "0x1123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
    ),
    createReplyMessage(
      "dsnp://0123456789ABCDEF",
      "https://dsnp.org",
      "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
      "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
    ),
    createReactionMessage(
      "dsnp://0123456789ABCDEF",
      "🏳️‍🌈",
      "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
    ),
    createReactionMessage(
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
        dsnpType: 2,
        hash: expect.stringMatching(/[a-z0-9]{64}/),
        url: expect.stringMatching(/http:\/\/fakestore\.org\/[a-z0-9]{32}/),
      },
      {
        dsnpType: 3,
        hash: expect.stringMatching(/[a-z0-9]{64}/),
        url: expect.stringMatching(/http:\/\/fakestore\.org\/[a-z0-9]{32}/),
      },
      {
        dsnpType: 4,
        hash: expect.stringMatching(/[a-z0-9]{64}/),
        url: expect.stringMatching(/http:\/\/fakestore\.org\/[a-z0-9]{32}/),
      },
    ]);
  });

  it("stores the messages provided at the returned URL", async () => {
    const signedMessages = await Promise.all(messages.map(async (msg) => await sign(msg)));
    const publications = await createPublications(signedMessages);

    for (const publication of publications) {
      const filename = publication.url.split(".org/")[1];
      const files = store.getStore();

      expect(files[filename].toString()).toMatchSnapshot();
    }
  });
});
