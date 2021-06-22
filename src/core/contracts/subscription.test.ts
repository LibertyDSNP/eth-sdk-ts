import { keccak256 } from "js-sha3";

import { batch, Announcement, dsnpBatchFilter } from "./announcement";
import { subscribeToBatchAnnounceEvents } from "./subscription";
import { setupConfig } from "../../test/sdkTestConfig";
import { setupSnapshot } from "../../test/hardhatRPC";
import { requireGetProvider } from "../../config";
import { checkNumberOfFunctionCalls } from "../../test/utilities";
import { BatchAnnounceCallbackArgs } from "./subscription";

describe("subscription", () => {
  setupSnapshot();

  beforeEach(() => {
    setupConfig();
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  describe("subscribeToBatchAnnounceEvents", () => {
    jest.setTimeout(70000);
    const testUri = "http://www.testconst.com";
    const hash = "0x" + keccak256("test");

    it("listen and retrieve batch announce events", async () => {
      const provider = requireGetProvider();
      const mock = jest.fn();

      const removeListener = await subscribeToBatchAnnounceEvents(mock);
      const announcements: Announcement[] = [{ dsnpType: 2, uri: testUri, hash: hash }];
      await (await batch(announcements)).wait(1);
      const numberOfCalls = await checkNumberOfFunctionCalls(mock, 30, 1);

      const filter = await dsnpBatchFilter();
      expect(numberOfCalls).toBeTruthy();

      expect(mock.mock.calls[0][0].dsnpType).toEqual(2);
      expect(mock.mock.calls[0][0].dsnpUri).toEqual(testUri);
      expect(mock.mock.calls[0][0].dsnpHash).toEqual(hash);
      await removeListener();
      expect(provider.listeners(filter).length).toEqual(0);
    });

    it("calls the callback on each event", async () => {
      const provider = requireGetProvider();

      const testUri1 = "http://www.testconst111.com";
      const hash1 = "0x" + keccak256("test111");
      const testUri2 = "http://www.testconst222.com";
      const hash2 = "0x" + keccak256("test222");

      const mock = jest.fn();

      const removeListener = await subscribeToBatchAnnounceEvents(mock);
      const announcements: Announcement[] = [{ dsnpType: 2, uri: testUri1, hash: hash1 }];
      const announcements1: Announcement[] = [{ dsnpType: 2, uri: testUri2, hash: hash2 }];
      await (await batch(announcements)).wait(1);
      await (await batch(announcements1)).wait(1);
      const numberOfCalls = await checkNumberOfFunctionCalls(mock, 10, 2);
      expect(numberOfCalls).toBeTruthy();

      expect(mock).toHaveBeenCalledTimes(2);
      await removeListener();
      const filter = await dsnpBatchFilter();
      expect(provider.listeners(filter).length).toEqual(0);
    });

    describe("when listener is removed", () => {
      it("does not retrieve events", async () => {
        const provider = requireGetProvider();
        const filter = await dsnpBatchFilter();

        const mock1 = jest.fn();
        const removeListener = await subscribeToBatchAnnounceEvents(mock1);

        expect(provider.listeners(filter).length).toEqual(1);
        await removeListener();
        expect(provider.listeners(filter).length).toEqual(0);
      });
    });
  });

  describe("batchAnnounce events with custom filter", () => {
    it("returns events that matches filters", async () => {
      const provider = requireGetProvider();
      const mock = jest.fn((opts: BatchAnnounceCallbackArgs) => {
        return opts;
      });
      const testUri3 = "http://www.testconst333.com";
      const hash3 = "0x" + keccak256("test333");
      const testUri4 = "http://www.testconst333.com";
      const hash4 = "0x" + keccak256("test333");

      const removeListener = await subscribeToBatchAnnounceEvents(mock, { dsnpType: 2 });
      const announcements: Announcement[] = [{ dsnpType: 2, uri: testUri3, hash: hash3 }];
      const announcements1: Announcement[] = [{ dsnpType: 4, uri: testUri4, hash: hash4 }];
      await (await batch(announcements)).wait(1);
      await (await batch(announcements1)).wait(1);
      await checkNumberOfFunctionCalls(mock, 10, 1);
      const filter = await dsnpBatchFilter();
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock.mock.calls[0][0].dsnpType).toEqual(2);
      expect(mock.mock.calls[0][0].dsnpUri).toEqual(testUri3);
      expect(mock.mock.calls[0][0].dsnpHash).toEqual(hash3);
      await removeListener();
      expect(provider.listeners(filter).length).toEqual(0);
    });
  });

  describe("get past events from start block", () => {
    it("retrieves past events based on given start block", async () => {
      const provider = requireGetProvider();
      const mock = jest.fn();

      const testUri3 = "http://www.testconst333.com";
      const hash3 = "0x" + keccak256("test333");
      const testUri4 = "http://www.testconst444.com";
      const hash4 = "0x" + keccak256("test444");
      const testUri5 = "http://www.testconst555.com";
      const hash5 = "0x" + keccak256("test555");
      const testUri6 = "http://www.testconst666.com";
      const hash6 = "0x" + keccak256("test666");

      const announcements: Announcement[] = [{ dsnpType: 2, uri: testUri3, hash: hash3 }];
      const announcements1: Announcement[] = [{ dsnpType: 2, uri: testUri4, hash: hash4 }];
      const announcements2: Announcement[] = [{ dsnpType: 2, uri: testUri5, hash: hash5 }];
      const announcements3: Announcement[] = [{ dsnpType: 2, uri: testUri6, hash: hash6 }];

      await (await batch(announcements)).wait(1);

      const blockNumber = (await provider.getBlockNumber()) + 1;
      await (await batch(announcements1)).wait(1);

      const removeListener = await subscribeToBatchAnnounceEvents(mock, { dsnpType: 2, startBlock: blockNumber });

      await (await batch(announcements2)).wait(1);
      await (await batch(announcements3)).wait(1);

      await checkNumberOfFunctionCalls(mock, 10, 3);

      expect(mock).toHaveBeenCalledTimes(3);
      expect(mock.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          dsnpUri: announcements1[0].uri,
          dsnpHash: announcements1[0].hash,
          dsnpType: announcements1[0].dsnpType,
        })
      );
      expect(mock.mock.calls[1][0]).toEqual(
        expect.objectContaining({
          dsnpUri: announcements2[0].uri,
          dsnpHash: announcements2[0].hash,
          dsnpType: announcements2[0].dsnpType,
        })
      );
      expect(mock.mock.calls[2][0]).toEqual(
        expect.objectContaining({
          dsnpUri: announcements3[0].uri,
          dsnpHash: announcements3[0].hash,
          dsnpType: announcements3[0].dsnpType,
        })
      );

      const filter = await dsnpBatchFilter();
      await removeListener();
      expect(provider.listeners(filter).length).toEqual(0);
    });
  });
});
