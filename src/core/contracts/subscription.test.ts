import { requireGetProvider } from "../config";
import { publish, Publication, dsnpBatchFilter } from "./publisher";
import { subscribeToBatchPublications, BatchPublicationLogData, BatchFilterOptions } from "./subscription";
import { setupSnapshot } from "../../test/hardhatRPC";
import { setupConfig } from "../../test/sdkTestConfig";
import { checkNumberOfFunctionCalls } from "../../test/utilities";
import { hash } from "../utilities";

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
    const fileHash = hash("test");

    it("listen and retrieve batch publication events", async () => {
      const provider = requireGetProvider();
      const mock = jest.fn();

      const removeListener = await subscribeToBatchPublications(mock);
      const publications: Publication[] = [{ announcementType: 2, fileUrl: testUrl, fileHash }];
      await (await publish(publications)).wait(1);
      const numberOfCalls = await checkNumberOfFunctionCalls(mock, 30, 1);

      const filter = await dsnpBatchFilter();
      expect(numberOfCalls).toBeTruthy();

      expect(mock.mock.calls[0][0].announcementType).toEqual(2);
      expect(mock.mock.calls[0][0].fileUrl).toEqual(testUrl);
      expect(mock.mock.calls[0][0].fileHash).toEqual(fileHash);
      await removeListener();
      expect(provider.listeners(filter).length).toEqual(0);
    });

    it("calls the callback on each event", async () => {
      const provider = requireGetProvider();

      const testUrl1 = "http://www.testconst111.com";
      const hash1 = hash("test111");
      const testUrl2 = "http://www.testconst222.com";
      const hash2 = hash("test222");

      const mock = jest.fn();

      const removeListener = await subscribeToBatchPublications(mock);
      const publications: Publication[] = [{ announcementType: 2, fileUrl: testUrl1, fileHash: hash1 }];
      const publications1: Publication[] = [{ announcementType: 2, fileUrl: testUrl2, fileHash: hash2 }];
      await (await publish(publications)).wait(1);
      await (await publish(publications1)).wait(1);
      const numberOfCalls = await checkNumberOfFunctionCalls(mock, 10, 2);
      expect(numberOfCalls).toBeTruthy();

      expect(mock).toHaveBeenCalledTimes(2);
      await removeListener();
      const filter = await dsnpBatchFilter();
      expect(provider.listeners(filter).length).toEqual(0);
    });
    describe("when a filter is provided", () => {
      const filterOptions: BatchFilterOptions = {
        announcementType: 2,
        fromBlock: 0,
      };

      it("does not fail if there are no past logs", async () => {
        const provider = requireGetProvider();
        const mock = jest.fn();

        const removeListener = await subscribeToBatchPublications(mock, filterOptions);
        expect(mock).not.toHaveBeenCalled();
        await removeListener();
        const filter = await dsnpBatchFilter();
        expect(provider.listeners(filter).length).toEqual(0);
      });
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
      const mock = jest.fn((opts: BatchPublicationLogData) => {
        return opts;
      });
      const testUrl3 = "http://www.testconst333.com";
      const hash3 = hash("test333");
      const testUrl4 = "http://www.testconst333.com";
      const hash4 = hash("test333");

      const removeListener = await subscribeToBatchPublications(mock, { announcementType: 2 });
      const publications: Publication[] = [{ announcementType: 2, fileUrl: testUrl3, fileHash: hash3 }];
      const publications1: Publication[] = [{ announcementType: 4, fileUrl: testUrl4, fileHash: hash4 }];
      await (await publish(publications)).wait(1);
      await (await publish(publications1)).wait(1);
      await checkNumberOfFunctionCalls(mock, 10, 1);
      const filter = await dsnpBatchFilter();
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock.mock.calls[0][0].announcementType).toEqual(2);
      expect(mock.mock.calls[0][0].fileUrl).toEqual(testUrl3);
      expect(mock.mock.calls[0][0].fileHash).toEqual(hash3);
      await removeListener();
      expect(provider.listeners(filter).length).toEqual(0);
    });
  });

  describe("get past events from start block", () => {
    it("retrieves past events based on given start block", async () => {
      const provider = requireGetProvider();
      const mock = jest.fn();

      const testUrl3 = "http://www.testconst333.com";
      const hash3 = hash("test333");
      const testUrl4 = "http://www.testconst444.com";
      const hash4 = hash("test444");
      const testUrl5 = "http://www.testconst555.com";
      const hash5 = hash("test555");
      const testUrl6 = "http://www.testconst666.com";
      const hash6 = hash("test666");

      const publications: Publication[] = [{ announcementType: 2, fileUrl: testUrl3, fileHash: hash3 }];
      const publications1: Publication[] = [{ announcementType: 2, fileUrl: testUrl4, fileHash: hash4 }];
      const publications2: Publication[] = [{ announcementType: 2, fileUrl: testUrl5, fileHash: hash5 }];
      const publications3: Publication[] = [{ announcementType: 2, fileUrl: testUrl6, fileHash: hash6 }];

      await (await publish(publications)).wait(1);

      const blockNumber = (await provider.getBlockNumber()) + 1;
      await (await publish(publications1)).wait(1);

      const removeListener = await subscribeToBatchPublications(mock, { announcementType: 2, fromBlock: blockNumber });

      await (await publish(publications2)).wait(1);
      await (await publish(publications3)).wait(1);

      await checkNumberOfFunctionCalls(mock, 10, 3);

      expect(mock).toHaveBeenCalledTimes(3);
      expect(mock.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          fileUrl: publications1[0].fileUrl,
          fileHash: publications1[0].fileHash,
          announcementType: publications1[0].announcementType,
        })
      );
      expect(mock.mock.calls[1][0]).toEqual(
        expect.objectContaining({
          fileUrl: publications2[0].fileUrl,
          fileHash: publications2[0].fileHash,
          announcementType: publications2[0].announcementType,
        })
      );
      expect(mock.mock.calls[2][0]).toEqual(
        expect.objectContaining({
          fileUrl: publications3[0].fileUrl,
          fileHash: publications3[0].fileHash,
          announcementType: publications3[0].announcementType,
        })
      );

      const filter = await dsnpBatchFilter();
      await removeListener();
      expect(provider.listeners(filter).length).toEqual(0);
    });
  });
});
