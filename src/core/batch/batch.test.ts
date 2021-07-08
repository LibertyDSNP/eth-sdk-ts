import { ParquetReader, ParquetWriter } from "@dsnp/parquetjs";

import * as batch from "./batch";
import { DSNPBatchMessage } from "./batchMessages";
import { generateBroadcast, generateReply } from "../../generators/dsnpGenerators";
import { BroadcastSchema } from "./parquetSchema";
import TestStore from "../../test/testStore";
import { MixedTypeBatchError, EmptyBatchError } from "../utilities";

describe("batch", () => {
  describe("includes", () => {
    let reader: typeof ParquetReader;

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

      reader = { getBloomFilters: jest.fn().mockResolvedValue(bloomFilterData) };
    });

    it("calls getBloomFilter", () => {
      batch.includes(reader, "name", "banana");

      expect(reader.getBloomFilters.mock.calls.length).toBe(1);
    });
  });

  describe("#writeBatch", () => {
    const parquetWriterInstance = {
      appendRow: jest.fn().mockImplementation(async (message) => message),
      close: jest.fn(),
    };
    const writeStream = { write: jest.fn(), end: jest.fn() };

    const { writeBatch } = batch;

    beforeAll(() => {
      jest.spyOn(ParquetWriter, "openStream").mockResolvedValue(parquetWriterInstance);
    });

    beforeEach(jest.clearAllMocks);
    afterAll(jest.restoreAllMocks);

    describe("when passed a valid message iterator", () => {
      const messages = [{ ...generateBroadcast(), signature: "0xfa1ce" }];

      it("calls ParquetWriter#openStream to start a writable stream", async () => {
        await writeBatch(writeStream, BroadcastSchema, messages);
        expect(ParquetWriter.openStream).toHaveBeenCalled();
      });

      it("calls ParquetWriter#appendRow to add a row to parquet stream", async () => {
        await writeBatch(writeStream, BroadcastSchema, messages);
        expect(parquetWriterInstance.appendRow).toHaveBeenCalledTimes(1);
      });

      it("calls ParquetWriter#close to end the stream", async () => {
        await writeBatch(writeStream, BroadcastSchema, messages);
        expect(parquetWriterInstance.close).toHaveBeenCalledTimes(1);
      });
    });

    describe("when passed a message iterator containing multiple DSNP types", () => {
      const badMessages = [
        { ...generateBroadcast(), signature: "0xfa1ce" },
        { ...generateReply(), signature: "0xfa1ce" },
      ];

      it("throws MixedDSNPTypeError", async () => {
        await expect(writeBatch(writeStream, BroadcastSchema, badMessages)).rejects.toBeInstanceOf(MixedTypeBatchError);
      });

      it("includes the write stream handle in the thrown error", async () => {
        await expect(writeBatch(writeStream, BroadcastSchema, badMessages)).rejects.toMatchObject({
          fileHandle: writeStream,
        });
      });
    });

    describe("when passed a message iterator containing no messages", () => {
      const badMessages: Array<DSNPBatchMessage> = [];

      it("throws MixedDSNPTypeError", async () => {
        await expect(writeBatch(writeStream, BroadcastSchema, badMessages)).rejects.toBeInstanceOf(EmptyBatchError);
      });

      it("includes the write stream handle in the thrown error", async () => {
        await expect(writeBatch(writeStream, BroadcastSchema, badMessages)).rejects.toMatchObject({
          fileHandle: writeStream,
        });
      });
    });
  });

  describe("#createFile", () => {
    const { createFile } = batch;
    const messages = [{ ...generateBroadcast(), signature: "0xfa1ce" }];

    it("calls putStream to start streaming", async () => {
      const mockStore = new TestStore();
      jest.spyOn(mockStore, "putStream");
      await createFile("batch.parquet", messages, { store: mockStore });
      expect(mockStore.putStream).toHaveBeenCalled();
    });

    it("calls #writeBatch to stream write parquet", async () => {
      jest.spyOn(batch, "writeBatch");
      const mockStore = new TestStore();
      await createFile("batch.parquet", messages, { store: mockStore });

      const file = mockStore.getStore()["batch.parquet"];
      const reader = await ParquetReader.openBuffer(file);

      expect(batch.writeBatch).toHaveBeenCalled();
      expect(reader.metadata.num_rows.buffer.toString("hex")).toEqual("0000000000000001");
    });
  });
});
