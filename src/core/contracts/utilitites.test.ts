import { ethers } from "ethers";

import { subscribeToEvent } from "./utilities";

describe("#subscribeToEvent", () => {
  afterAll(jest.restoreAllMocks);

  describe("when starting block number (fromBlock) is not provided", () => {
    const mockProvider = {
      on: jest.fn(),
      off: jest.fn(),
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
    describe("and the starting block number (fromBlock: 50) is less current block number (99)", () => {
      const fromBlock = 50;
      const log1 = { blockNumber: 50 } as ethers.providers.Log;
      const log2 = { blockNumber: 75 } as ethers.providers.Log;
      const eventFilter: ethers.EventFilter = { topics: [] };
      const providerOn = jest
        .fn()
        .mockImplementation((_filter: ethers.EventFilter, callback: (log: ethers.providers.Log) => void) => {
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
        const providerOn = jest
          .fn()
          .mockImplementation((_filter: ethers.EventFilter, callback: (log: ethers.providers.Log) => void) => {
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
