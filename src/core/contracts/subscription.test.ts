import { keccak256 } from "js-sha3";

import { publish, Publication, dsnpBatchFilter } from "./publisher";
import { subscribeToBatchPublications } from "./subscription";
import { setupConfig } from "../../test/sdkTestConfig";
import { setupSnapshot } from "../../test/hardhatRPC";
import { requireGetProvider } from "../../config";
import { checkNumberOfFunctionCalls } from "../../test/utilities";
import { BatchPublicationCallbackArgs } from "./subscription";

describe("subscription", () => {
  setupSnapshot();

  beforeEach(() => {
    setupConfig();
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  describe("subscribeToBatchPublications", () => {
    jest.setTimeout(70000);
    const testUrl = "http://www.testconst.com";
    const hash = "0x" + keccak256("test");

    it("listen and retrieve batch publication events", async () => {
      const provider = requireGetProvider();
      const mock = jest.fn();

      const removeListener = await subscribeToBatchPublications(mock);
      const publications: Publication[] = [{ dsnpType: 2, url: testUrl, hash: hash }];
      await (await publish(publications)).wait(1);
      const numberOfCalls = await checkNumberOfFunctionCalls(mock, 30, 1);

      const filter = await dsnpBatchFilter();
      expect(numberOfCalls).toBeTruthy();

      expect(mock.mock.calls[0][0].dsnpType).toEqual(2);
      expect(mock.mock.calls[0][0].dsnpUrl).toEqual(testUrl);
      expect(mock.mock.calls[0][0].dsnpHash).toEqual(hash);
      await removeListener();
      expect(provider.listeners(filter).length).toEqual(0);
    });

    it("calls the callback on each event", async () => {
      const provider = requireGetProvider();

      const testUrl1 = "http://www.testconst111.com";
      const hash1 = "0x" + keccak256("test111");
      const testUrl2 = "http://www.testconst222.com";
      const hash2 = "0x" + keccak256("test222");

      const mock = jest.fn();

      const removeListener = await subscribeToBatchPublications(mock);
      const publications: Publication[] = [{ dsnpType: 2, url: testUrl1, hash: hash1 }];
      const publications1: Publication[] = [{ dsnpType: 2, url: testUrl2, hash: hash2 }];
      await (await publish(publications)).wait(1);
      await (await publish(publications1)).wait(1);
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
        const removeListener = await subscribeToBatchPublications(mock1);

        expect(provider.listeners(filter).length).toEqual(1);
        await removeListener();
        expect(provider.listeners(filter).length).toEqual(0);
      });
    });
  });

  describe("BatchPublication events with custom filter", () => {
    it("returns events that matches filters", async () => {
      const provider = requireGetProvider();
      const mock = jest.fn((opts: BatchPublicationCallbackArgs) => {
        return opts;
      });
      const testUrl3 = "http://www.testconst333.com";
      const hash3 = "0x" + keccak256("test333");
      const testUrl4 = "http://www.testconst333.com";
      const hash4 = "0x" + keccak256("test333");

      const removeListener = await subscribeToBatchPublications(mock, { dsnpType: 2 });
      const publications: Publication[] = [{ dsnpType: 2, url: testUrl3, hash: hash3 }];
      const publications1: Publication[] = [{ dsnpType: 4, url: testUrl4, hash: hash4 }];
      await (await publish(publications)).wait(1);
      await (await publish(publications1)).wait(1);
      await checkNumberOfFunctionCalls(mock, 10, 1);
      const filter = await dsnpBatchFilter();
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock.mock.calls[0][0].dsnpType).toEqual(2);
      expect(mock.mock.calls[0][0].dsnpUrl).toEqual(testUrl3);
      expect(mock.mock.calls[0][0].dsnpHash).toEqual(hash3);
      await removeListener();
      expect(provider.listeners(filter).length).toEqual(0);
    });
  });

  describe("get past events from start block", () => {
    it("retrieves past events based on given start block", async () => {
      const provider = requireGetProvider();
      const mock = jest.fn();

      const testUrl3 = "http://www.testconst333.com";
      const hash3 = "0x" + keccak256("test333");
      const testUrl4 = "http://www.testconst444.com";
      const hash4 = "0x" + keccak256("test444");
      const testUrl5 = "http://www.testconst555.com";
      const hash5 = "0x" + keccak256("test555");
      const testUrl6 = "http://www.testconst666.com";
      const hash6 = "0x" + keccak256("test666");

      const publications: Publication[] = [{ dsnpType: 2, url: testUrl3, hash: hash3 }];
      const publications1: Publication[] = [{ dsnpType: 2, url: testUrl4, hash: hash4 }];
      const publications2: Publication[] = [{ dsnpType: 2, url: testUrl5, hash: hash5 }];
      const publications3: Publication[] = [{ dsnpType: 2, url: testUrl6, hash: hash6 }];

      await (await publish(publications)).wait(1);

      const blockNumber = (await provider.getBlockNumber()) + 1;
      await (await publish(publications1)).wait(1);

      const removeListener = await subscribeToBatchPublications(mock, { dsnpType: 2, fromBlock: blockNumber });

      await (await publish(publications2)).wait(1);
      await (await publish(publications3)).wait(1);

      await checkNumberOfFunctionCalls(mock, 10, 3);

      expect(mock).toHaveBeenCalledTimes(3);
      expect(mock.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          dsnpUrl: publications1[0].url,
          dsnpHash: publications1[0].hash,
          dsnpType: publications1[0].dsnpType,
        })
      );
      expect(mock.mock.calls[1][0]).toEqual(
        expect.objectContaining({
          dsnpUrl: publications2[0].url,
          dsnpHash: publications2[0].hash,
          dsnpType: publications2[0].dsnpType,
        })
      );
      expect(mock.mock.calls[2][0]).toEqual(
        expect.objectContaining({
          dsnpUrl: publications3[0].url,
          dsnpHash: publications3[0].hash,
          dsnpType: publications3[0].dsnpType,
        })
      );

      const filter = await dsnpBatchFilter();
      await removeListener();
      expect(provider.listeners(filter).length).toEqual(0);
    });
  });
});
