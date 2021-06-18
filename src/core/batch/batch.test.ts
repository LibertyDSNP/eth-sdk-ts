import * as batch from "./batch";
import { generateBroadcast } from "../../generators/dsnpGenerators";
import { EmptyArrayError } from "../utilities/errors";
import { BroadcastSchema } from "./parquetSchema";
import { ParquetReader, ParquetWriter } from "@dsnp/parquetjs";
import TestStore from "../../test/testStore";

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
  const messages = [generateBroadcast()];
  const writeStream = { write: jest.fn(), end: jest.fn() };
  const parquetWriterInstance = {
    appendRow: jest.fn().mockImplementation(async (message) => message),
    close: jest.fn(),
  };

  const { writeBatch } = batch;

  beforeEach(() => {
    jest.clearAllMocks();
    ParquetWriter.openStream = jest.fn().mockResolvedValue(parquetWriterInstance);
  });

  it("calls ParquetWriter#openStream to start a writable stream", async () => {
    await writeBatch(writeStream, BroadcastSchema, messages);
    expect(ParquetWriter.openStream).toHaveBeenCalled();
  });

  it("calls ParquetWriter#appendRow to add a row to parquet stream", async () => {
    await writeBatch(writeStream, BroadcastSchema, messages);
    expect(parquetWriterInstance.appendRow).toHaveBeenCalledTimes(1);
  });

  it("calls ParquetWriter#closes to end the stream", async () => {
    await writeBatch(writeStream, BroadcastSchema, messages);
    expect(parquetWriterInstance.close).toHaveBeenCalledTimes(1);
  });
});

describe("#createFile", () => {
  const { createFile } = batch;
  const messages = [{ ...generateBroadcast(), signature: "0xfa1ce" }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    expect(batch.writeBatch).toHaveBeenCalled();
    expect(mockStore.store).toEqual({
      "batch.parquet": {
        rowCount: 1,
        type: "parquet",
      },
    });
  });

  describe("when messages argument is empty", () => {
    it("throws an EmptyArrayError", async () => {
      await expect(batch.createFile("batch.parquet", [])).rejects.toThrow(EmptyArrayError);
    });
  });
});
