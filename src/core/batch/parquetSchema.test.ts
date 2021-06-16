import { getSchemaFor, getBloomFilterOptionsFor } from "./parquetSchema";

describe("#getSchemaFor", () => {
  it("returns the schema for dsnpType GraphChange", () => {
    const result = getSchemaFor(1);

    expect(result).toEqual({
      changeType: { type: "INT32" },
      dsnpType: { type: "INT32" },
      fromId: { type: "BYTE_ARRAY" },
      signature: { type: "BYTE_ARRAY" },
    });
  });

  it("returns the schema for dsnpType Broadcast", () => {
    const result = getSchemaFor(2);

    expect(result).toEqual({
      dsnpType: { type: "INT32" },
      contentHash: { type: "BYTE_ARRAY" },
      fromId: { type: "BYTE_ARRAY" },
      uri: { type: "BYTE_ARRAY" },
      signature: { type: "BYTE_ARRAY" },
    });
  });

  it("returns the schema for dsnpType Reply", () => {
    const result = getSchemaFor(3);

    expect(result).toEqual({
      dsnpType: { type: "INT32" },
      contentHash: { type: "BYTE_ARRAY" },
      fromId: { type: "BYTE_ARRAY" },
      inReplyTo: { type: "BYTE_ARRAY" },
      uri: { type: "BYTE_ARRAY" },
      signature: { type: "BYTE_ARRAY" },
    });
  });

  it("returns the schema for dsnpType Profile", () => {
    const result = getSchemaFor(5);

    expect(result).toEqual({
      dsnpType: { type: "INT32" },
      fromId: { type: "BYTE_ARRAY" },
      uri: { type: "BYTE_ARRAY" },
      signature: { type: "BYTE_ARRAY" },
    });
  });

  it("returns the schema for dsnpType Reaction", () => {
    const result = getSchemaFor(4);

    expect(result).toEqual({
      dsnpType: { type: "INT32" },
      emoji: { type: "BYTE_ARRAY" },
      fromId: { type: "BYTE_ARRAY" },
      inReplyTo: { type: "BYTE_ARRAY" },
      signature: { type: "BYTE_ARRAY" },
    });
  });

  it("throws an error for invalid DSNP type", () => {
    expect(() => getSchemaFor(0)).toThrow("Invalid DSNP type: 0");
  });
});

describe("#getBloomFilterOptionsFor", () => {
  it("returns the bloom filter options for dsnpType GraphChange", () => {
    const result = getBloomFilterOptionsFor(1);

    expect(result).toEqual({
      bloomFilters: [{ column: "fromId" }],
    });
  });

  it("returns the bloom filter options for dsnpType Broadcast", () => {
    const result = getBloomFilterOptionsFor(2);

    expect(result).toEqual({
      bloomFilters: [{ column: "fromId" }],
    });
  });

  it("returns the bloom filter options for dsnpType Reply", () => {
    const result = getBloomFilterOptionsFor(3);

    expect(result).toEqual({ bloomFilters: [{ column: "fromId" }, { column: "inReplyTo" }] });
  });

  it("returns the bloom filter options for dsnpType Profile", () => {
    const result = getBloomFilterOptionsFor(5);

    expect(result).toEqual({
      bloomFilters: [{ column: "fromId" }],
    });
  });

  it("returns the bloom filter options for dsnpType Reaction", () => {
    const result = getBloomFilterOptionsFor(4);

    expect(result).toEqual({
      bloomFilters: [{ column: "emoji" }, { column: "fromId" }, { column: "inReplyTo" }],
    });
  });

  it("throws an error for invalid DSNP type", () => {
    expect(() => getSchemaFor(0)).toThrow("Invalid DSNP type: 0");
  });
});
