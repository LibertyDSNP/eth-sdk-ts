import { requireGetProvider } from "../config";
import { publish, Publication, dsnpBatchFilter } from "./publisher";
import {
  subscribeToBatchPublications,
  BatchPublicationLogData,
  BatchFilterOptions,
  subscribeToRegistryUpdates,
  syncPublicationsByRange,
} from "./subscription";
import { setupSnapshot } from "../../test/hardhatRPC";
import { setupConfig } from "../../test/sdkTestConfig";
import { checkNumberOfFunctionCalls, mineBlocks } from "../../test/utilities";
import { hash } from "../utilities";
import { ethers, Signer } from "ethers";
import { changeHandle, getContract, register } from "./registry";
import { Identity__factory, Registry } from "../../types/typechain";
import { JsonRpcProvider } from "@ethersproject/providers";

describe("subscription", () => {
  setupSnapshot();

  beforeEach(() => {
    setupConfig();
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  describe.skip("subscribeToBatchPublications", () => {
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
      describe("and fromBlock is from genesis block", () => {
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

      describe("and a fromBlock from the future is provided", () => {
        let filterOptions: BatchFilterOptions;
        let provider: ethers.providers.Provider;

        beforeEach(async () => {
          provider = requireGetProvider();
        });

        it("logs data after starting at fromBlock", async () => {
          const blockNumber = await provider.getBlockNumber();
          filterOptions = {
            announcementType: 2,
            fromBlock: blockNumber + 10,
          };
          const mock = jest.fn();

          const removeListener = await subscribeToBatchPublications(mock, filterOptions);

          const testUrl = "http://www.test.com";
          const fileHash = hash("test");
          const publications1: Publication[] = [{ announcementType: 2, fileUrl: testUrl, fileHash: fileHash }];
          await (await publish(publications1)).wait(1);
          await new Promise((r) => setTimeout(r, 2000));

          await mineBlocks(11, provider as ethers.providers.JsonRpcProvider);

          const publications: Publication[] = [{ announcementType: 2, fileUrl: testUrl, fileHash: fileHash }];

          await (await publish(publications)).wait(1);

          const numberOfCalls = await checkNumberOfFunctionCalls(mock, 10, 1);
          expect(numberOfCalls).toBeTruthy();

          await removeListener();
          const filter = await dsnpBatchFilter();
          expect(provider.listeners(filter).length).toEqual(0);
        });
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

  describe.skip("BatchPublication events with custom filter", () => {
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

  describe.skip("get past events from start block", () => {
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
          transactionIndex: expect.any(Number),
          logIndex: expect.any(Number),
        })
      );
      expect(mock.mock.calls[1][0]).toEqual(
        expect.objectContaining({
          fileUrl: publications2[0].fileUrl,
          fileHash: publications2[0].fileHash,
          announcementType: publications2[0].announcementType,
          transactionIndex: expect.any(Number),
          logIndex: expect.any(Number),
        })
      );
      expect(mock.mock.calls[2][0]).toEqual(
        expect.objectContaining({
          fileUrl: publications3[0].fileUrl,
          fileHash: publications3[0].fileHash,
          announcementType: publications3[0].announcementType,
          transactionIndex: expect.any(Number),
          logIndex: expect.any(Number),
        })
      );

      const filter = await dsnpBatchFilter();
      await removeListener();
      expect(provider.listeners(filter).length).toEqual(0);
    });
  });

  describe.skip("subscribeToRegistryUpdates", () => {
    jest.setTimeout(70000);

    describe("get past events from start block", () => {
      let signer: Signer;
      let provider: JsonRpcProvider;

      setupSnapshot();

      beforeAll(() => {
        ({ signer, provider } = setupConfig());
      });

      it("retrieves past events based on given start block", async () => {
        const mock = jest.fn();

        const identityContract = await new Identity__factory(signer).deploy(await signer.getAddress());
        const contract: Registry = await getContract();
        const registryUpdateFilter = contract.filters.DSNPRegistryUpdate();
        await identityContract.deployed();
        const handle = "PenguinButtons";
        const handleTwo = "PenguinButtons2";
        const handleThree = "PenguinButtons3";

        const currentBlockNumber = await provider.getBlockNumber();
        const identityContractAddress = identityContract.address;
        await (await register(identityContractAddress, handle)).wait(1);

        await mineBlocks(10, provider as ethers.providers.JsonRpcProvider);

        await (await changeHandle(handle, handleTwo)).wait(1);

        await mineBlocks(10, provider as ethers.providers.JsonRpcProvider);
        await (await changeHandle(handleTwo, handleThree)).wait(1);

        const removeListener = await subscribeToRegistryUpdates(mock, { fromBlock: currentBlockNumber });
        await checkNumberOfFunctionCalls(mock, 10, 3);

        expect(mock).toHaveBeenCalledTimes(3);
        expect(mock.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            transactionHash: expect.any(String),
            blockNumber: expect.any(Number),
            dsnpUserURI: expect.any(String),
            contractAddr: identityContractAddress,
            handle: handle,
            transactionIndex: expect.any(Number),
            logIndex: expect.any(Number),
          })
        );
        expect(mock.mock.calls[1][0]).toEqual(
          expect.objectContaining({
            transactionHash: expect.any(String),
            blockNumber: expect.any(Number),
            dsnpUserURI: expect.any(String),
            contractAddr: identityContractAddress,
            handle: handleTwo,
            transactionIndex: expect.any(Number),
            logIndex: expect.any(Number),
          })
        );
        expect(mock.mock.calls[2][0]).toEqual(
          expect.objectContaining({
            transactionHash: expect.any(String),
            blockNumber: expect.any(Number),
            dsnpUserURI: expect.any(String),
            contractAddr: identityContractAddress,
            handle: handleThree,
            transactionIndex: expect.any(Number),
            logIndex: expect.any(Number),
          })
        );

        await removeListener();
        expect(provider.listeners(registryUpdateFilter).length).toEqual(0);
      });
    });
  });
  describe("syncPublicationsByRange", () => {
    let provider: ethers.providers.Provider;
    let filter: ethers.EventFilter;
    jest.setTimeout(7000);

    const testUrl = "http://www.testconst.com";
    const filenames = ["test00", "test01", "test02", "test03"];
    const publications: Publication[] = [
      { announcementType: 2, fileUrl: [testUrl, filenames[0]].join("/"), fileHash: hash(filenames[0]) },
      { announcementType: 2, fileUrl: [testUrl, filenames[1]].join("/"), fileHash: hash(filenames[1]) },
      { announcementType: 2, fileUrl: [testUrl, filenames[2]].join("/"), fileHash: hash(filenames[2]) },
      { announcementType: 2, fileUrl: [testUrl, filenames[3]].join("/"), fileHash: hash(filenames[3]) },
    ];

    beforeEach(async () => {
      provider = requireGetProvider();
      filter = await dsnpBatchFilter(2);
      console.log("filter: ", filter);
      for (const pub of publications) {
        const txn = await publish([pub]);
        await txn.wait(1);
        // console.log("recpt: ", rcpt);
        await mineBlocks(1, provider as ethers.providers.JsonRpcProvider);
      }
      await mineBlocks(2, provider as ethers.providers.JsonRpcProvider);
      await new Promise((r) => setTimeout(r, 2000));
    });

    it("fetches all blocks by default", async () => {
      const res = await syncPublicationsByRange({ filter });
      expect(res?.length).toEqual(4);
    });

    // it("fetches only the number of blocks specified by walkback", async () => {});
    // it("fetches  specified by walkback", async () => {});
    // it("fetches only up to the toBlock specified", async () => {});
    // it("throws an error if walkbackBlockCount is invalid", async () => {});
  });
});
