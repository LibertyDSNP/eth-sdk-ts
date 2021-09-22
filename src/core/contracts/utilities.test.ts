import { ethers } from "ethers";

import { getFromBlockDefault, subscribeToEvent, getPublicationLogIterator } from "./utilities";
import { checkNumberOfFunctionCalls, mineBlocks } from "../../test/utilities";
import { requireGetProvider, setConfig } from "../config";
import { dsnpBatchFilter, Publication, publish } from "./publisher";
import { hash } from "../utilities";
import { setupSnapshot } from "../../test/hardhatRPC";
import { setupConfig } from "../../test/sdkTestConfig";

type ProviderOnCb = (log: ethers.providers.Log) => void;

describe("#subscribeToEvent", () => {
  afterAll(jest.restoreAllMocks);

  describe("edge condition", () => {
    it("doesn't miss or duplicate any when there are events in the currentBlockNumber", async () => {
      const log1 = { blockNumber: 51, logIndex: 1, transactionHash: "0xa" } as ethers.providers.Log;
      const log2 = { blockNumber: 52, logIndex: 1, transactionHash: "0xb" } as ethers.providers.Log;
      const log22 = { blockNumber: 52, logIndex: 2, transactionHash: "0xb" } as ethers.providers.Log;
      const log3 = { blockNumber: 53, logIndex: 1, transactionHash: "0xc" } as ethers.providers.Log;
      const log4 = { blockNumber: 55, logIndex: 1, transactionHash: "0xd" } as ethers.providers.Log;

      const mockBlockNumber = 52;
      let providerOnCallback: ProviderOnCb = jest.fn();

      const eventFilter: ethers.EventFilter = { topics: [] };
      const providerOn = jest.fn().mockImplementation((_filter: ethers.EventFilter, callback: ProviderOnCb) => {
        providerOnCallback = callback;
        // Overlap of log2 and log22
        [log2, log22, log3].forEach(callback);
      });

      const mockProvider = {
        on: providerOn,
        getBlockNumber: jest.fn().mockImplementation(() => {
          return mockBlockNumber;
        }),
        // Overlap of log2 and log22
        getLogs: jest.fn().mockResolvedValue([log1, log2, log22]),
        off: jest.fn(),
      } as unknown as ethers.providers.Provider;

      const doReceiveEventMock = jest.fn();

      await subscribeToEvent(mockProvider, eventFilter, doReceiveEventMock, 50);
      // Now call after we have "caught up" to make sure it switches to streaming
      providerOnCallback(log4);
      await checkNumberOfFunctionCalls(doReceiveEventMock, 10, 5);
      expect(doReceiveEventMock).toHaveBeenCalledTimes(5);
    });
  });

  describe("when starting block number (fromBlock) is not provided", () => {
    const mockProvider = {
      on: jest.fn(),
      off: jest.fn(),
      getLogs: jest.fn().mockResolvedValue([]),
      getBlockNumber: jest.fn(),
    } as unknown as ethers.providers.Provider;
    const eventFilter: ethers.EventFilter = { topics: [] };
    const doReceiveEventMock = jest.fn();

    it("calls provider.on with", async () => {
      await subscribeToEvent(mockProvider, eventFilter, doReceiveEventMock);

      expect(mockProvider.on).toHaveBeenCalledWith(eventFilter, doReceiveEventMock);
    });

    it("returns an an anonymous function used to unsubscribe", async () => {
      const logEvents: ethers.providers.Log[] = [];
      const doReceiveEventMock = jest.fn().mockImplementation((log: ethers.providers.Log) => logEvents.push(log));

      const unsubscribe = await subscribeToEvent(mockProvider, eventFilter, doReceiveEventMock);
      unsubscribe();

      expect(mockProvider.off).toHaveBeenCalled();
    });

    it("does not call getBlockNumber", async () => {
      await subscribeToEvent(mockProvider, eventFilter, doReceiveEventMock);

      expect(mockProvider.getBlockNumber).not.toHaveBeenCalled();
    });
  });

  describe("when a starting block number (fromBlock) is provided", () => {
    describe("and the starting block number (fromBlock: 0) is less current block number (99)", () => {
      const fromBlock = 0;
      const log1 = { blockNumber: 0 } as ethers.providers.Log;
      const log2 = { blockNumber: 75 } as ethers.providers.Log;
      const eventFilter: ethers.EventFilter = { topics: [] };
      const providerOn = jest.fn().mockImplementation((_filter: ethers.EventFilter, callback: ProviderOnCb) => {
        const currentLog = { blockNumber: 100 } as ethers.providers.Log;
        callback(currentLog);
      });

      const mockProvider = {
        on: providerOn,
        getBlockNumber: jest.fn().mockResolvedValue(99),
        getLogs: jest.fn().mockResolvedValue([log1, log2]),
        off: jest.fn(),
      } as unknown as ethers.providers.Provider;

      it("calls getLogs to fetch past logs", async () => {
        const doReceiveEventMock = jest.fn();

        await subscribeToEvent(mockProvider, eventFilter, doReceiveEventMock, fromBlock);

        expect(mockProvider.getLogs).toHaveBeenCalledWith({ ...eventFilter, fromBlock, toBlock: 99 });
      });

      it("calls doReceiveEvent 3 times", async () => {
        const logEvents: ethers.providers.Log[] = [];
        const doReceiveEventMock = jest.fn().mockImplementation((log: ethers.providers.Log) => logEvents.push(log));

        await subscribeToEvent(mockProvider, eventFilter, doReceiveEventMock, fromBlock);

        expect(doReceiveEventMock).toHaveBeenCalledTimes(3);
      });

      it("calls doReceiveEvent in order of oldest log to newest log", async () => {
        const logEvents: ethers.providers.Log[] = [];
        const doReceiveEventMock = jest.fn().mockImplementation((log: ethers.providers.Log) => logEvents.push(log));

        await subscribeToEvent(mockProvider, eventFilter, doReceiveEventMock, fromBlock);

        expect(logEvents).toEqual([log1, log2, { blockNumber: 100 }]);
      });

      it("returns an an anonymous function used to unsubscribe", async () => {
        const logEvents: ethers.providers.Log[] = [];
        const doReceiveEventMock = jest.fn().mockImplementation((log: ethers.providers.Log) => logEvents.push(log));

        const unsubscribe = await subscribeToEvent(mockProvider, eventFilter, doReceiveEventMock, fromBlock);
        unsubscribe();

        expect(mockProvider.off).toHaveBeenCalled();
      });

      describe("and the start block number (fromBlock 200) is greater than the current block number (99)", () => {
        const fromBlock = 200;
        const eventFilter: ethers.EventFilter = { topics: [] };
        const providerOn = jest.fn().mockImplementation((_filter: ethers.EventFilter, callback: ProviderOnCb) => {
          const currentLog = { blockNumber: 99 } as ethers.providers.Log;
          callback(currentLog);
        });

        const mockProvider = {
          on: providerOn,
          getBlockNumber: jest.fn().mockResolvedValue(99),
          getLogs: jest.fn().mockResolvedValue([]),
          off: jest.fn(),
        } as unknown as ethers.providers.Provider;

        it("does not call doReceiveEvent", async () => {
          const doReceiveEventMock = jest.fn();

          await subscribeToEvent(mockProvider, eventFilter, doReceiveEventMock, fromBlock);

          expect(doReceiveEventMock).not.toHaveBeenCalled();
        });

        it("returns an an anonymous function used to unsubscribe", async () => {
          const logEvents: ethers.providers.Log[] = [];
          const doReceiveEventMock = jest.fn().mockImplementation((log: ethers.providers.Log) => logEvents.push(log));

          const unsubscribe = await subscribeToEvent(mockProvider, eventFilter, doReceiveEventMock, fromBlock);
          unsubscribe();

          expect(mockProvider.off).toHaveBeenCalled();
        });
      });
    });
  });
});

describe("#getFromBlockDefault", () => {
  it("defaults to the default", () => {
    expect(getFromBlockDefault(undefined, 0)).toEqual(0);
    expect(getFromBlockDefault(undefined, "latest")).toEqual("latest");
    expect(getFromBlockDefault(undefined, "dsnp-start-block", { dsnpStartBlockNumber: 10 })).toEqual(10);
  });

  it("earliest converts to zero", () => {
    expect(getFromBlockDefault("earliest", 0)).toEqual(0);
  });

  it("gets the value from the config", () => {
    setConfig({ dsnpStartBlockNumber: 22, contracts: {} });
    expect(getFromBlockDefault("dsnp-start-block", 0)).toEqual(22);
  });

  it("returns the given value", () => {
    setConfig({ dsnpStartBlockNumber: 22, contracts: {} });
    expect(getFromBlockDefault(100, 0)).toEqual(100);
  });

  describe("getPublicationLogIterator", () => {
    jest.setTimeout(7000);
    setupSnapshot();

    let provider: ethers.providers.Provider;
    let filter: ethers.EventFilter;

    const testUrl = "http://www.testconst.com";
    const filenames = ["test00", "test01", "test02", "test03"];
    const publications: Publication[] = [
      { announcementType: 2, fileUrl: [testUrl, filenames[0]].join("/"), fileHash: hash(filenames[0]) },
      { announcementType: 2, fileUrl: [testUrl, filenames[1]].join("/"), fileHash: hash(filenames[1]) },
      { announcementType: 2, fileUrl: [testUrl, filenames[2]].join("/"), fileHash: hash(filenames[2]) },
      { announcementType: 2, fileUrl: [testUrl, filenames[3]].join("/"), fileHash: hash(filenames[3]) },
    ];

    const rcpts: number[] = [];

    beforeEach(async () => {
      setupConfig();
      provider = requireGetProvider();
      filter = dsnpBatchFilter(2);
      for (const pub of publications) {
        const txn = await publish([pub]);
        const rcpt = await txn.wait(1);
        rcpts.push(rcpt.blockNumber);
        await mineBlocks(1, provider as ethers.providers.JsonRpcProvider);
      }
      await new Promise((r) => setTimeout(r, 2000));
    });
    afterEach(async () => {
      jest.resetAllMocks();
    });

    /**
     *
     */
    async function verifyResult(
      nextResult: IteratorYieldResult<Publication> | IteratorReturnResult<any>,
      resultIndex: number
    ) {
      expect(nextResult?.value?.fileHash).toEqual(publications[resultIndex].fileHash);
      expect(nextResult?.value?.fileUrl).toEqual(publications[resultIndex].fileUrl);
      expect(nextResult?.value?.blockNumber).toEqual(rcpts[resultIndex]);
      return;
    }

    describe("when only a filter + walkback is passed", () => {
      let nextResult: IteratorResult<Publication>;
      let iterator: AsyncIterator<Publication>;
      describe("chunks are fetched in correct order", () => {
        const tests: Record<string, any>[] = [
          { wb: 4, order: [2, 3, 0, 1] },
          { wb: 3, order: [3, 1, 2, 0] },
          { wb: 2, order: [3, 2, 1, 0] },
          { wb: 1, order: [3, 2, 1, 0] },
        ];

        for (const test of tests) {
          it("for walkback = " + test.wb, async () => {
            iterator = await getPublicationLogIterator(filter, parseInt(test.wb));
            for (const resultIndex of test.order) {
              nextResult = await iterator.next();
              verifyResult(nextResult, resultIndex);
            }
            nextResult = await iterator.next();
            expect(nextResult?.done).toEqual(true);
            expect(nextResult?.value).toBeUndefined();
          });
        }
      });
    });
    describe("when parameters are passed", () => {
      it("fetches only what is up to the earliest block", async () => {
        const oldestBlock = rcpts[2];
        const newestBlock = rcpts[3];
        const walkbackBlockCount = 4;
        const iterator = await getPublicationLogIterator(filter, walkbackBlockCount, newestBlock, oldestBlock);
        let nextResult = await iterator.next();
        for (const resultIndex of [2, 3]) {
          verifyResult(nextResult, resultIndex);
          nextResult = await iterator.next();
        }
        expect(nextResult?.done).toEqual(true);
        expect(nextResult?.value).toBeUndefined();
      });

      it("fetches only up to the toBlock specified", async () => {
        const newestBlock = rcpts[2];
        const walkbackBlockCount = 5;
        const iterator = await getPublicationLogIterator(filter, walkbackBlockCount, newestBlock);
        let nextResult = await iterator.next();
        for (const resultIndex of [0, 1, 2]) {
          verifyResult(nextResult, resultIndex);
          nextResult = await iterator.next();
        }
        expect(nextResult?.done).toEqual(true);
        expect(nextResult?.value).toBeUndefined();
      });
    });
    describe("when invalid parameters are provided", () => {
      const tests: Record<string, number[]> = {
        "negative walkback": [-1],
        "negative newestBlock": [5, -1],
        "negative oldestBlock": [5, 99, -1],
        "walkback that's too large": [999999],
        "newestBlock that's <= oldestBlock": [1, 5, 5],
      };
      for (const testName of Object.keys(tests)) {
        it("throws an error when passing a " + testName, async () => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [wbk, newest, oldest, ..._unused] = tests[testName];
          await expect(getPublicationLogIterator(filter, wbk, newest, oldest)).rejects.toThrowError();
        });
      }
    });

    describe("when there are no logs for `walkback` set of blocks", () => {
      it("next fetches until it gets logs", async () => {
        const walkBack = 4;
        // make sure there are more empty blocks than walkback before we get to some log
        // results
        await mineBlocks(walkBack + 1, provider as ethers.providers.JsonRpcProvider);
        const iterator = await getPublicationLogIterator(filter, walkBack);
        const nextResult = await iterator.next();
        expect(nextResult?.done).toEqual(false);
        expect(nextResult?.value?.blockNumber).toEqual(rcpts[3]);
      });
    });
  });
});
