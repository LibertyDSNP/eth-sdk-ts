import { isAvailable, availabilityFilter } from "./handles";
import * as registry from "../contracts/registry";
import Mock = jest.Mock;

jest.mock("../contracts/registry");

describe("handles", () => {
  const notTakens = ["not-taken", "not-taken1", "not-taken2"];
  const takens = ["taken", "taken1", "taken2"];
  beforeAll(async () => {
    // Do the work to setup the mock
    (registry.resolveHandleToId as Mock).mockImplementation((handle: string) => {
      if (takens.includes(handle)) return "0xffff";
      return null;
    });
  });

  describe("#isAvailable", () => {
    it("returns true if it is available", async () => {
      expect(await isAvailable("not-taken")).toBe(true);
    });

    it("returns false if it is not available", async () => {
      expect(await isAvailable("taken")).toBe(false);
    });
  });

  describe("#availabilityFilter", () => {
    it("returns all if all are available", async () => {
      expect(await availabilityFilter(notTakens)).toEqual(notTakens);
    });

    it("returns [] if none are available", async () => {
      expect(await availabilityFilter(takens)).toEqual([]);
    });

    it("returns just the not taken ones if mixed", async () => {
      const all = ["not-taken", "taken", "not-taken1", "taken1", "taken2", "not-taken2"];
      expect(await availabilityFilter(all)).toEqual(notTakens);
    });
  });
});
