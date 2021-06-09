import { S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { S3Node } from "./s3Node";

describe("S3Node", () => {
  let client: S3Node;
  const credentials = { key: "key", secret: "password", bucket: "bucket", region: "aws-tijuana" };

  beforeEach(() => {
    client = new S3Node(credentials);
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
