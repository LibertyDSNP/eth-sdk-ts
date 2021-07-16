import { getSchemaFor, getBloomFilterOptionsFor } from "./parquetSchema";
import { InvalidAnnouncementTypeError } from "../announcements";

describe("#getSchemaFor", () => {
  it("returns the schema for announcementType GraphChange", () => {
    const result = getSchemaFor(1);

    expect(result).toEqual({
      changeType: { type: "INT32" },
      announcementType: { type: "INT32" },
      fromId: { type: "BYTE_ARRAY" },
      signature: { type: "BYTE_ARRAY" },
    });
  });

  it("returns the schema for announcementType Broadcast", () => {
    const result = getSchemaFor(2);

    expect(result).toEqual({
      announcementType: { type: "INT32" },
      contentHash: { type: "BYTE_ARRAY" },
      fromId: { type: "BYTE_ARRAY" },
      url: { type: "BYTE_ARRAY" },
      signature: { type: "BYTE_ARRAY" },
    });
  });

  it("returns the schema for announcementType Reply", () => {
    const result = getSchemaFor(3);

    expect(result).toEqual({
      announcementType: { type: "INT32" },
      contentHash: { type: "BYTE_ARRAY" },
      fromId: { type: "BYTE_ARRAY" },
      inReplyTo: { type: "BYTE_ARRAY" },
      url: { type: "BYTE_ARRAY" },
      signature: { type: "BYTE_ARRAY" },
    });
  });

  it("returns the schema for announcementType Profile", () => {
    const result = getSchemaFor(5);

    expect(result).toEqual({
      announcementType: { type: "INT32" },
      fromId: { type: "BYTE_ARRAY" },
      url: { type: "BYTE_ARRAY" },
      signature: { type: "BYTE_ARRAY" },
    });
  });

  it("returns the schema for announcementType Reaction", () => {
    const result = getSchemaFor(4);

    expect(result).toEqual({
      announcementType: { type: "INT32" },
      emoji: { type: "BYTE_ARRAY" },
      fromId: { type: "BYTE_ARRAY" },
      inReplyTo: { type: "BYTE_ARRAY" },
      signature: { type: "BYTE_ARRAY" },
    });
  });

  it("throws InvalidAnnouncementTypeError", () => {
    expect(() => getSchemaFor(0)).toThrow(InvalidAnnouncementTypeError);
  });
});

describe("#getBloomFilterOptionsFor", () => {
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
    expect(() => getSchemaFor(0)).toThrow(InvalidAnnouncementTypeError);
  });
});
