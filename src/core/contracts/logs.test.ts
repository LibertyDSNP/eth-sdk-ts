import { setupSnapshot } from "../../test/hardhatRPC";
import { setupConfig } from "../../test/sdkTestConfig";
import { requireGetProvider } from "../config";
import { dsnpBatchFilter, Publication, publish } from "./publisher";
import { mineBlocks } from "../../test/utilities";
import { ethers } from "ethers";
import { hash } from "../utilities";
import { BatchPublicationLogData } from "./subscription";
import { getPublicationLogIterator } from "./logs";

describe("getPublicationLogIterator", () => {
  jest.setTimeout(7000);
  setupSnapshot();
  beforeAll(setupConfig);

  beforeEach(async () => {
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

  const verifyResult = (
    nextResult: IteratorYieldResult<BatchPublicationLogData> | IteratorReturnResult<BatchPublicationLogData>,
    resultIndex: number
  ) => {
    expect(nextResult?.value?.fileHash).toEqual(publications[resultIndex].fileHash);
    expect(nextResult?.value?.fileUrl).toEqual(publications[resultIndex].fileUrl);
    expect(nextResult?.value?.blockNumber).toEqual(rcpts[resultIndex]);
    return;
  };

  describe("when only a filter + walkback is passed", () => {
    let nextResult: IteratorResult<BatchPublicationLogData>;
    let iterator: AsyncIterator<BatchPublicationLogData>;
    describe("chunks are fetched in correct orders", () => {
      const tests = [
        { wb: 4, order: [2, 3, 0, 1] },
        { wb: 3, order: [3, 1, 2, 0] },
        { wb: 2, order: [3, 2, 1, 0] },
        { wb: 1, order: [3, 2, 1, 0] },
      ];

      for (const test of tests) {
        it("for walkback = " + test.wb, async () => {
          iterator = await getPublicationLogIterator(filter, test.wb);
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
    describe("when used with await (const nextResult of iterator)", () => {
      it("works", async () => {
        const iterator: AsyncIterableIterator<BatchPublicationLogData> = await getPublicationLogIterator(filter, 2);

        let resultCount = 0;
        for await (const nextResult of iterator) {
          expect(nextResult?.blockNumber).toBeTruthy();
          console.log(nextResult.blockNumber);
          resultCount++;
        }
        expect(resultCount).toEqual(4);
      });
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
