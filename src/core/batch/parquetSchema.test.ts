import { getSchemaFor, getBloomFilterOptionsFor } from "./parquetSchema";
import { InvalidAnnouncementTypeError } from "../announcements";

describe("#getSchemaFor", () => {
  it("returns the schema for announcementType Tombstone", () => {
    const result = getSchemaFor(0);

    expect(result).toEqual({
      announcementType: { type: "INT32" },
      createdAt: { type: "UINT_64" },
      fromId: { type: "UINT_64" },
      signature: { type: "BYTE_ARRAY", statistics: false },
      targetAnnouncementType: { type: "INT32" },
      targetSignature: { type: "BYTE_ARRAY", statistics: false },
    });
  });

  it("returns the schema for announcementType GraphChange", () => {
    const result = getSchemaFor(1);

    expect(result).toEqual({
      announcementType: { type: "INT32" },
      changeType: { type: "INT32" },
      createdAt: { type: "UINT_64" },
      fromId: { type: "UINT_64" },
      objectId: { type: "UINT_64" },
      signature: { type: "BYTE_ARRAY", statistics: false },
    });
  });

  it("returns the schema for announcementType Broadcast", () => {
    const result = getSchemaFor(2);

    expect(result).toEqual({
      announcementType: { type: "INT32" },
      contentHash: { type: "BYTE_ARRAY", statistics: false },
      createdAt: { type: "UINT_64" },
      fromId: { type: "UINT_64" },
      signature: { type: "BYTE_ARRAY", statistics: false },
      url: { type: "UTF8" },
    });
  });

  it("returns the schema for announcementType Reply", () => {
    const result = getSchemaFor(3);

    expect(result).toEqual({
      announcementType: { type: "INT32" },
      contentHash: { type: "BYTE_ARRAY", statistics: false },
      createdAt: { type: "UINT_64" },
      fromId: { type: "UINT_64" },
      inReplyTo: { type: "UTF8" },
      signature: { type: "BYTE_ARRAY", statistics: false },
      url: { type: "UTF8" },
    });
  });

  it("returns the schema for announcementType Profile", () => {
    const result = getSchemaFor(5);

    expect(result).toEqual({
      announcementType: { type: "INT32" },
      contentHash: { type: "BYTE_ARRAY", statistics: false },
      createdAt: { type: "UINT_64" },
      fromId: { type: "UINT_64" },
      signature: { type: "BYTE_ARRAY", statistics: false },
      url: { type: "UTF8" },
    });
  });

  it("returns the schema for announcementType Reaction", () => {
    const result = getSchemaFor(4);

    expect(result).toEqual({
      announcementType: { type: "INT32" },
      createdAt: { type: "UINT_64" },
      emoji: { type: "UTF8" },
      fromId: { type: "UINT_64" },
      inReplyTo: { type: "UTF8" },
      signature: { type: "BYTE_ARRAY", statistics: false },
    });
  });

  it("throws InvalidAnnouncementTypeError", () => {
    expect(() => getSchemaFor(-1)).toThrow(InvalidAnnouncementTypeError);
  });
});

describe("#getBloomFilterOptionsFor", () => {
  it("returns the bloom filter options for announcementType Tombstone", () => {
    const result = getBloomFilterOptionsFor(0);

    expect(result).toEqual({
      bloomFilters: [{ column: "fromId" }, { column: "targetSignature" }],
    });
  });

  it("returns the bloom filter options for announcementType GraphChange", () => {
    const result = getBloomFilterOptionsFor(1);

    expect(result).toEqual({
      bloomFilters: [{ column: "fromId" }],
    });
  });

  it("returns the bloom filter options for announcementType Broadcast", () => {
    const result = getBloomFilterOptionsFor(2);

    expect(result).toEqual({
      bloomFilters: [{ column: "fromId" }],
    });
  });

  it("returns the bloom filter options for announcementType Reply", () => {
    const result = getBloomFilterOptionsFor(3);

    expect(result).toEqual({ bloomFilters: [{ column: "fromId" }, { column: "inReplyTo" }] });
  });

  it("returns the bloom filter options for announcementType Profile", () => {
    const result = getBloomFilterOptionsFor(5);

    expect(result).toEqual({
      bloomFilters: [{ column: "fromId" }],
    });
  });

  it("returns the bloom filter options for announcementType Reaction", () => {
    const result = getBloomFilterOptionsFor(4);

    expect(result).toEqual({
      bloomFilters: [{ column: "emoji" }, { column: "fromId" }, { column: "inReplyTo" }],
    });
  });

  it("throws InvalidAnnouncementTypeError", () => {
    expect(() => getSchemaFor(-1)).toThrow(InvalidAnnouncementTypeError);
  });
});
