import { S3Client, S3ClientConfig, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { StoreInterface } from "./interface";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable, PassThrough } from "stream";

/**
 * PassThroughStream a stream that can be written to and read from. It is
 * intended for streaming parquet data to storage.
 */
interface PassThroughStream {
  read(chunk: unknown, size: number): void;
  write(chunk: unknown, encoding?: string, callbck?: (error: Error | null | undefined) => void): boolean;
  write(chunk: unknown, cb?: (error: Error | null | undefined) => void): boolean;
  end(chunk: unknown, cb?: () => void): void;
  end(chunk: unknown, encoding?: string, cb?: () => void): void;
}

interface PassThroughCallback {
  (stream: PassThroughStream): void;
}

/**
 * S3Credentials extends S3ClientConfig
 * It allows for easy to level configuration.
 */
export interface S3Credentials extends S3ClientConfig {
  key: string;
  secret: string;
  bucket: string;
  region: string;
}
/**
 * S3Node provides a storage solution for saving DSNP messages
 * This adapter is provided for convenience can be used in other applications configuration.
 */
export class S3Node implements StoreInterface {
  client: S3Client;
  bucket: string;
  region: string;

  constructor(config: S3Credentials) {
    const { key, secret, bucket, region } = config;

    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId: key,
        secretAccessKey: secret,
      },
    });

    this.bucket = bucket;
    this.region = region;
  }

  public async put(targetPath: string, content: Buffer | string): Promise<URL> {
    const params = { Key: targetPath, Body: content, Bucket: this.bucket };
    try {
      await this.client.send(new PutObjectCommand(params));

      return this.getURLFrom(targetPath);
    } catch (e) {
      throw new Error(`Failed to upload file: ${e.message}`);
    }
  }

  public async putStream(targetPath: string, callback: PassThroughCallback): Promise<URL> {
    const readWriteStream = new PassThrough();

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: targetPath,
        Body: readWriteStream,
      },
    });

    await callback(readWriteStream);

    try {
      await upload.done();
    } catch (e) {
      throw new Error(`Failed to upload file: ${e.message}`);
    }

    return this.getURLFrom(targetPath);
  }

  public async get(targetPath: string): Promise<string> {
    const params = { Key: targetPath, Bucket: this.bucket };

    try {
      const { Body } = await this.client.send(new GetObjectCommand(params));

      return this.streamToString(Body as Readable);
    } catch (e) {
      throw new Error(`Failed to retrieve file from S3: ${e.message}`);
    }
  }

  private getURLFrom(targetPath: string): URL {
    return new URL(`https://${this.bucket}.s3.${this.region}.amazonaws.com/${targetPath}`);
  }

  private async streamToString(stream: Readable): Promise<string> {
    return await new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    });
  }
}
