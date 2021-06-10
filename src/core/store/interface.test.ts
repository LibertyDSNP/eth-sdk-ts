import { getConfig } from "../../config";
import { MissingStore, NotImplementedError } from "../utilities";
import { get, put } from "./interface";

jest.mock("../../config");

describe("store", () => {
  describe("#get", () => {
    describe("when store configuration is not set", () => {
      beforeEach(() => {
        (getConfig as jest.Mock).mockReturnValue({});
      });

      it("throws MissingStoreError error", async () => {
        await expect(get("file.txt")).rejects.toThrow(MissingStore);
      });

      describe("and #get function is not set", () => {
        beforeEach(() => {
          (getConfig as jest.Mock).mockReturnValue({ store: {} });
        });

        it("throws MissingStoreError error", async () => {
          await expect(get("file.txt")).rejects.toThrow(NotImplementedError);
        });
      });
    });

    describe("when store is configured", () => {
      const getMock = jest.fn();
      const storeMock = { get: getMock };

      beforeEach(() => {
        (getConfig as jest.Mock).mockReturnValue({ store: storeMock });
      });

      it("calls #get", async () => {
        await get("file.text");

        expect(getMock).toBeCalled();
      });
    });
  });

  describe("#put", () => {
    describe("when store configuration is not set", () => {
      beforeEach(() => {
        (getConfig as jest.Mock).mockReturnValue({});
      });

      it("throws MissingStoreError error", async () => {
        await expect(put("file.txt", "{}")).rejects.toThrow(MissingStore);
      });
    });

    describe("when store is configured", () => {
      const putMock = jest.fn();
      const storeMock = { put: putMock };

      beforeEach(() => {
        (getConfig as jest.Mock).mockReturnValue({ store: storeMock });
      });

      it("calls #put", async () => {
        await put("file.text", "{}");

        expect(putMock).toBeCalled();
      });
    });
  });
});
