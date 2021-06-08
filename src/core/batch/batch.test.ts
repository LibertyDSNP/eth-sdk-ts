import { batchIncludes } from "./batch";
import { ParquetReader } from "@dsnp/parquetjs";

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
    batchIncludes(reader, "name", "banana");

    expect(reader.getBloomFilters.mock.calls.length).toBe(1);
  });
});
