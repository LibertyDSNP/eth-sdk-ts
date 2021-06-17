import { S3Client } from "@aws-sdk/client-s3";
import { PassThroughCallback } from "../store/interface";
import { Upload } from "@aws-sdk/lib-storage";

import { Readable } from "stream";
import { S3Node } from "./s3Node";

jest.mock("@aws-sdk/lib-storage");

describe("S3Node", () => {
  let client: S3Node;
  const credentials = { key: "key", secret: "password", bucket: "bucket", region: "aws-tijuana" };

  beforeEach(() => {
    client = new S3Node(credentials);
  });

  describe("#putStream", () => {
    let callback: PassThroughCallback;

    beforeEach(() => {
      callback = jest.fn().mockImplementation();
      Upload.prototype.done = jest.fn();
    });

    it("calls callback with PassThrough stream", async () => {
      await client.putStream("batch.parquet", callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          write: expect.any(Function),
          read: expect.any(Function),
        })
      );
    });

    it("calls Upload#done", async () => {
      await client.putStream("batch.parquet", callback);

      expect(Upload.prototype.done).toHaveBeenCalled();
    });

    it("returns a url of file location", async () => {
      const result = await client.putStream("batch.parquet", callback);

      expect(result.toString()).toEqual("https://bucket.s3.aws-tijuana.amazonaws.com/batch.parquet");
    });

    describe("when uploading a file errors", () => {
      beforeEach(() => {
        Upload.prototype.done = jest.fn().mockImplementation(() => {
          throw new Error("try again");
        });
      });

      it("throws generic message", async () => {
        await expect(client.putStream("batch.parquet", callback)).rejects.toThrowError(
          "Failed to upload file: try again"
        );
      });
    });
  });

  describe("#put", () => {
    beforeEach(() => {
      S3Client.prototype.send = jest.fn();
    });

    it("calls #send", async () => {
      await client.put("file.txt", "{}");

      expect(S3Client.prototype.send).toBeCalledWith(
        expect.objectContaining({ input: { Key: "file.txt", Body: "{}", Bucket: "bucket" } })
      );
    });

    it("returns a URL of the destination", async () => {
      const result = await client.put("file.txt", "{}");
      expect(result).toEqual(new URL("https://bucket.s3.aws-tijuana.amazonaws.com/file.txt"));
    });

    describe("when uploading a file errors", () => {
      beforeEach(() => {
        S3Client.prototype.send = jest.fn().mockImplementation(() => {
          throw new Error("try again");
        });
      });

      it("throws generic message", async () => {
        await expect(client.put("file.txt", "{}")).rejects.toThrowError("Failed to upload file: try again");
      });
    });
  });

  describe("#get", () => {
    beforeEach(() => {
      async function* generate() {
        yield Buffer.from("im streaming ");
        yield Buffer.from("wait for me");
      }

      const readableStream = Readable.from(generate());
      S3Client.prototype.send = jest.fn().mockReturnValue({ Body: readableStream });
    });

    it("calls send", async () => {
      await client.get("file.txt");

      expect(S3Client.prototype.send).toBeCalledWith(
        expect.objectContaining({ input: { Bucket: "bucket", Key: "file.txt" } })
      );
    });

    it("returns a string when stream is done", async () => {
      const result = await client.get("file.txt");

      expect(result).toEqual("im streaming wait for me");
    });

    describe("when uploading a file errors", () => {
      beforeEach(() => {
        S3Client.prototype.send = jest.fn().mockImplementation(() => {
          throw new Error("try again");
        });
      });

      it("throws generic message", async () => {
        await expect(client.get("file.txt")).rejects.toThrowError("Failed to retrieve file from S3: try again");
      });
    });
  });
});
