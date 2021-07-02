import { ParquetReader, ParquetWriter } from "@dsnp/parquetjs";

import * as batch from "./batch";
import { generateBroadcast } from "../../generators/dsnpGenerators";
import { DSNPType } from "../messages";
import { BroadcastSchema } from "./parquetSchema";
import TestStore from "../../test/testStore";

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
    const messages = [{ ...generateBroadcast(), signature: "0xfa1ce" }];
    const writeStream = { write: jest.fn(), end: jest.fn() };
    const parquetWriterInstance = {
      appendRow: jest.fn().mockImplementation(async (message) => message),
      close: jest.fn(),
    };

    const { writeBatch } = batch;

    beforeAll(() => {
      jest.spyOn(ParquetWriter, "openStream").mockResolvedValue(parquetWriterInstance);
    });

    beforeEach(jest.clearAllMocks);
    afterAll(jest.restoreAllMocks);

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

  describe("#createFile", () => {
    const { createFile } = batch;
    const messages = [{ ...generateBroadcast(), signature: "0xfa1ce" }];

    it("calls putStream to start streaming", async () => {
      const mockStore = new TestStore();
      jest.spyOn(mockStore, "putStream");
      await createFile("batch.parquet", DSNPType.Broadcast, messages, { store: mockStore });
      expect(mockStore.putStream).toHaveBeenCalled();
    });

    it("calls #writeBatch to stream write parquet", async () => {
      jest.spyOn(batch, "writeBatch");
      const mockStore = new TestStore();
      await createFile("batch.parquet", DSNPType.Broadcast, messages, { store: mockStore });

      const file = mockStore.getStore()["batch.parquet"];
      const reader = await ParquetReader.openBuffer(file);

      expect(batch.writeBatch).toHaveBeenCalled();
      expect(reader.metadata.num_rows.buffer.toString("hex")).toEqual("0000000000000001");
    });
  });
});
