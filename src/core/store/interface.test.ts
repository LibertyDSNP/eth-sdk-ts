import { MissingStore, requireGetStore } from "../../config";
import { NotImplementedError } from "../utilities";
import { get, put } from "./interface";

jest.mock("../../config");

describe("store", () => {
  describe("#get", () => {
    describe("when store configuration is not set", () => {
      it("throws MissingStoreError error", async () => {
        (requireGetStore as jest.Mock).mockReturnValue({});
        await expect(get("file.txt")).rejects.toThrow(MissingStore);
      });

      describe("and #get function is not set", () => {
        it("throws MissingStoreError error", async () => {
          (requireGetStore as jest.Mock).mockReturnValue({ put: jest.fn() });
          await expect(get("file.txt")).rejects.toThrow(NotImplementedError);
        });
      });
    });

    describe("when store is configured", () => {
      const getMock = jest.fn();

      beforeEach(() => {
        (requireGetStore as jest.Mock).mockReturnValue({ get: getMock });
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
        (requireGetStore as jest.Mock).mockReturnValue({});
      });

      it("throws MissingStoreError error", async () => {
        await expect(put("file.txt", "{}")).rejects.toThrow(MissingStore);
      });
    });

    describe("when store is configured", () => {
      const putMock = jest.fn();

      beforeEach(() => {
        (requireGetStore as jest.Mock).mockReturnValue({ put: putMock });
      });

      it("calls #put", async () => {
        await put("file.text", "{}");

        expect(putMock).toBeCalled();
      });
    });

    describe("and #put function is not set", () => {
      it("throws NotImplementedError error", async () => {
        (requireGetStore as jest.Mock).mockReturnValue({});
        await expect(get("file.txt")).rejects.toThrow(NotImplementedError);
      });
    });
  });
});
