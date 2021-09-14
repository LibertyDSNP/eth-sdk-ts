import { ethers } from "ethers";

import { getFromBlockDefault, subscribeToEvent } from "./utilities";
import { checkNumberOfFunctionCalls } from "../../test/utilities";
import { setConfig } from "../config";

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
});
