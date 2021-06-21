// This is an example S3 Implementation of the Store Interface

// Type Imports from the SDK:
// import { WriteStreamCallback, StoreInterface } from "@dsnp/sdk/core/store";
import { WriteStreamCallback, StoreInterface } from "../src/core/store";

import { S3Client, S3ClientConfig, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { PassThrough } from "stream";

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
 * S3Node provides an example storage solution for saving DSNP messages on Amazon S3
 * This adapter is provided for convenience can be used in other applications configuration.
 * This can be configured on the SDK like so:
 * ```typescript
 setConfig({
  ...,
  store: S3Node({
    key: "tomyheartisno",
    secret: "itsa",
    bucket: "ofchicken",
    region: "us-east-la",
  })
});
```
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

  public async putStream(targetPath: string, callback: WriteStreamCallback): Promise<URL> {
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

  private getURLFrom(targetPath: string): URL {
    return new URL(`https://${this.bucket}.s3.${this.region}.amazonaws.com/${targetPath}`);
  }
}
