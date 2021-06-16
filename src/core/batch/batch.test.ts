import * as batch from "./batch";
import { generateBroadcast } from "../../generators/dsnpGenerators";
import { EmptyArrayError } from "../utilities/errors";
import { putStream } from "../store/interface";
import { BroadcastSchema } from "./parquetSchema";
import { ParquetReader, ParquetWriter } from "@dsnp/parquetjs";

jest.mock("../store/interface");

describe("batchIncludes", () => {
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
    batch.batchIncludes(reader, "name", "banana");

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
  const messages = [generateBroadcast()];

  beforeEach(() => {
    jest.spyOn(batch, "writeBatch");
    (putStream as jest.Mock).mockImplementation((path, callback) => callback(path, callback));
  });

  it("calls putStream to start streaming", async () => {
    await createFile("batch.parquet", messages);

    expect(putStream).toHaveBeenCalled();
  });

  it("calls #writeBatch to stream write parquet", async () => {
    await createFile("batch.parquet", messages);

    expect(batch.writeBatch).toHaveBeenCalledWith(
      "batch.parquet",
      expect.objectContaining({ fieldList: expect.any(Array) }),
      messages,
      { bloomFilters: { bloomFilters: [{ column: "fromId" }] } }
    );
  });

  describe("when messages argument is empty", () => {
    it("throws an EmptyArrayError", async () => {
      await expect(batch.createFile("batch.parquet", [])).rejects.toThrow(EmptyArrayError);
    });
  });
});
