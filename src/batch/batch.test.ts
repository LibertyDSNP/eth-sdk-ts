import { batchIncludes } from "./batch";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parquet = require("@dsnp/parquetjs");
const { ParquetReader } = parquet;

describe("batchIncludes", () => {
  let reader: typeof ParquetReader;

  beforeEach(() => {
    const MockSplitBlockBloomFilter = {
      check: jest.fn(),
    };

    const bloomFitlerData = {
      name: [
        {
          sbbf: MockSplitBlockBloomFilter,
          columnName: "name",
          rowGroupIndex: 0,
        },
      ],
    };

    reader = { getBloomFilters: jest.fn().mockResolvedValue(bloomFitlerData) };
  });

  it("calls getBloomFilter", () => {
    batchIncludes(reader, "name", "banana");

    expect(reader.getBloomFilters.mock.calls.length).toBe(1);
  });
});
