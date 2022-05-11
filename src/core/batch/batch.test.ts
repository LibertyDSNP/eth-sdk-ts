import { ethers } from "ethers";
import { ParquetReader, ParquetSchema, ParquetWriter } from "@dsnp/parquetjs";

import { createFollowGraphChange, createProfile, createTombstone, AnnouncementType } from "../announcements";
import * as batch from "./batch";
import { MixedTypeBatchError, EmptyBatchError } from "./errors";
import { generateBroadcast, generateReply, generateReaction } from "../../generators/dsnpGenerators";
import { BroadcastSchema } from "./parquetSchema";
import TestStore from "../../test/testStore";
import { sign, SignedAnnouncement } from "../announcements";

describe("batch", () => {
  describe("includes", () => {
    let reader: ParquetReader;

    beforeEach(() => {
      const MockSplitBlockBloomFilter = {
        check: jest.fn(),
      };

      const bloomFilterData = {
        name: [
          {
            sbbf: MockSplitBlockBloomFilter,
            columnName: "name",
            rowGroupIndex: 0,
          },
        ],
      };

      reader = { getBloomFiltersFor: jest.fn().mockResolvedValue(bloomFilterData) } as any;
    });

    it("calls getBloomFilter", () => {
      batch.includes(reader, "name", "banana");

      expect((reader.getBloomFiltersFor as jest.Mock).mock.calls.length).toBe(1);
    });
  });

  describe("#writeBatch", () => {
    const parquetWriterInstance = {
      appendRow: jest.fn().mockImplementation(async (x) => x),
      close: jest.fn(),
    };
    const writeStream = { write: jest.fn(), end: jest.fn() };

    const { writeBatch } = batch;

    beforeAll(() => {
      jest.spyOn(ParquetWriter, "openStream").mockResolvedValue(parquetWriterInstance as any);
    });

    beforeEach(jest.clearAllMocks);
    afterAll(jest.restoreAllMocks);

    describe("when passed a valid announcement iterator", () => {
      const announcements = [{ ...generateBroadcast(), signature: "0xfa1ce" }];

      it("calls ParquetWriter#openStream to start a writable stream", async () => {
        await writeBatch(writeStream, new ParquetSchema(BroadcastSchema), announcements);
        expect(ParquetWriter.openStream).toHaveBeenCalled();
      });

      it("calls ParquetWriter#appendRow to add a row to parquet stream", async () => {
        await writeBatch(writeStream, new ParquetSchema(BroadcastSchema), announcements);
        expect(parquetWriterInstance.appendRow).toHaveBeenCalledTimes(1);
      });

      it("calls ParquetWriter#close to end the stream", async () => {
        await writeBatch(writeStream, new ParquetSchema(BroadcastSchema), announcements);
        expect(parquetWriterInstance.close).toHaveBeenCalledTimes(1);
      });
    });

    describe("when passed a message iterator containing multiple announcement types", () => {
      const badMessages = [
        { ...generateBroadcast(), signature: "0xfa1ce" },
        { ...generateReply(), signature: "0xfa1ce" },
      ];

      it("throws MixedTypeBatchError", async () => {
        await expect(writeBatch(writeStream, new ParquetSchema(BroadcastSchema), badMessages)).rejects.toThrow(
          MixedTypeBatchError
        );
      });

      it("includes the write stream handle in the thrown error", async () => {
        await expect(writeBatch(writeStream, new ParquetSchema(BroadcastSchema), badMessages)).rejects.toMatchObject({
          fileHandle: writeStream,
        });
      });
    });

    describe("when passed a message iterator containing no announcements", () => {
      const badMessages: Array<SignedAnnouncement> = [];

      it("throws EmptyBatchError", async () => {
        await expect(writeBatch(writeStream, new ParquetSchema(BroadcastSchema), badMessages)).rejects.toThrow(
          EmptyBatchError
        );
      });

      it("includes the write stream handle in the thrown error", async () => {
        await expect(writeBatch(writeStream, new ParquetSchema(BroadcastSchema), badMessages)).rejects.toMatchObject({
          fileHandle: writeStream,
        });
      });
    });
  });

  describe("#createFile", () => {
    const { createFile } = batch;
    const announcements = [{ ...generateBroadcast(), signature: "0xfa1ce" }];

    describe("when passed a valid message iterator", () => {
      it("calls putStream to start streaming", async () => {
        const mockStore = new TestStore();
        jest.spyOn(mockStore, "putStream");
        await createFile("batch.parquet", announcements, { store: mockStore });
        expect(mockStore.putStream).toHaveBeenCalled();
      });

      it("calls #writeBatch to stream write parquet", async () => {
        jest.spyOn(batch, "writeBatch");
        const mockStore = new TestStore();
        await createFile("batch.parquet", announcements, { store: mockStore });

        const file = mockStore.getStore()["batch.parquet"];
        const reader = await ParquetReader.openBuffer(file as any);

        expect(batch.writeBatch).toHaveBeenCalled();
        expect(reader!.metadata!.num_rows.buffer.toString("hex")).toEqual("0000000000000001");
      });
    });

    describe("when passed a message iterator containing no announcements", () => {
      const badMessages: Array<SignedAnnouncement> = [];

      it("throws EmptyBatchError", async () => {
        const mockStore = new TestStore();
        await expect(createFile("batch.parquet", badMessages, { store: mockStore })).rejects.toThrow(EmptyBatchError);
      });
    });
  });

  describe("#openURL", () => {
    describe("when url param is of type string", () => {
      it("calls ParquetReader.openURL", async () => {
        const parquetReaderInstance = {};

        jest.spyOn(ParquetReader, "openUrl").mockResolvedValue(parquetReaderInstance as any);
        await batch.openURL("http://parque-file.com");

        expect(ParquetReader.openUrl).toHaveBeenCalledWith("http://parque-file.com");
      });
    });

    describe("when url param is of type URL", () => {
      it("calls ParquetReader.openURL", async () => {
        const parquetReaderInstance = {};

        jest.spyOn(ParquetReader, "openUrl").mockResolvedValue(parquetReaderInstance as any);
        await batch.openURL(new URL("http://parque-file.com"));

        expect(ParquetReader.openUrl).toHaveBeenCalledWith("http://parque-file.com");
      });
    });
  });

  describe("#readFile", () => {
    const { createFile, readFile } = batch;
    const mockStore = new TestStore();

    [
      {
        announcement: generateBroadcast(),
        name: "broadcasts",
      },
      {
        announcement: generateReply(),
        name: "replies",
      },
      {
        announcement: generateReaction(),
        name: "reactions",
      },
      {
        announcement: createProfile("dsnp://1234567890", "https://spec.dsnp.org", "0x1234567890"),
        name: "profiles",
      },
      {
        announcement: createFollowGraphChange("dsnp://1234567890", "0x1234567890"),
        name: "graph changes",
      },
      {
        announcement: createTombstone("dsnp://1234567890", AnnouncementType.Broadcast, "0x1234567890abcdef"),
        name: "tombstones",
      },
    ].forEach(({ announcement, name }) => {
      it(`triggers callbacks with expected format for ${name}`, async () => {
        const signedAnnouncement = await sign(announcement, { signer: ethers.Wallet.createRandom() });

        await createFile("batch.parquet", [signedAnnouncement], { store: mockStore });

        const file = mockStore.getStore()["batch.parquet"];
        const reader = await ParquetReader.openBuffer(file as any);
        const callback = jest.fn();

        await readFile(reader, callback);

        expect(callback).toHaveBeenCalledWith(signedAnnouncement);
      });
    });
  });
});
