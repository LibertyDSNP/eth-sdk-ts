import { ethers } from "ethers";

import * as config from "./config";
import { createBroadcastMessage, sign } from "./core/messages";
import { createAnnouncements } from "./createAnnouncements";
import { generateDSNPStream } from "./generators/dsnpGenerators";
import TestStore from "./test/testStore";

describe("createAnnouncements", () => {
  let store: TestStore;

  beforeEach(() => {
    jest.setTimeout(12000);

    store = new TestStore();

    config.setConfig({
      currentFromId: "dsnp://0123456789ABCDEF",
      signer: new ethers.Wallet("0xd98d551044eb9ef4c9a2afd1d9c95646e22b710da55c8dc95431038d5544d804"),
      store: store,
    });
  });

  it("returns an array of valid announcements for each message type", async () => {
    const messages = await generateDSNPStream(100);
    const signedMessages = await Promise.all(messages.map(async (msg) => await sign(msg)));
    const messageIterator = signedMessages[Symbol.iterator]();

    const announcements = await createAnnouncements(messageIterator);

    expect(announcements).toMatchObject([
      {
        dsnpType: 2,
        hash: expect.stringMatching(/[a-z0-9]{64}/),
        uri: expect.stringMatching(/http:\/\/fakestore\.org\/[a-z0-9]{32}/),
      },
      {
        dsnpType: 3,
        hash: expect.stringMatching(/[a-z0-9]{64}/),
        uri: expect.stringMatching(/http:\/\/fakestore\.org\/[a-z0-9]{32}/),
      },
      {
        dsnpType: 4,
        hash: expect.stringMatching(/[a-z0-9]{64}/),
        uri: expect.stringMatching(/http:\/\/fakestore\.org\/[a-z0-9]{32}/),
      },
    ]);
  });

  it("stores the messages provided at the returned URL", async () => {
    const messages = [
      createBroadcastMessage(
        "dsnp://0123456789ABCDEF",
        "https://dsnp.org",
        "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      ),
    ];
    const signedMessages = await Promise.all(messages.map(async (msg) => await sign(msg)));
    const messageIterator = signedMessages[Symbol.iterator]();

    const announcements = await createAnnouncements(messageIterator);
    const url = announcements[0].uri;
    const filename = url.split(".org/")[1];

    const files = store.getStore();
    expect(files[filename].toString()).toMatchSnapshot();
  });
});
