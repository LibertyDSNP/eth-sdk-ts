import os from "os";
import fs from "fs";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parquet = require("@dsnp/parquetjs");

import {
  DSNPBatchWriteResult,
  generateBroadcastBatchFile,
  generateReactionBatchFile,
  generateReplyBatchFile,
} from "./generators/batchFileGenerators";

describe("batchFileGenerators", () => {
  [
    { name: "Broadcasts", gen: generateBroadcastBatchFile, bloom: ["fromId"] },
    { name: "Reactions", gen: generateReactionBatchFile, bloom: ["fromId", "inReplyTo", "emoji"] },
    { name: "Replies", gen: generateReplyBatchFile, bloom: ["fromId", "inReplyTo"] },
  ].forEach((testCase) => {
    it(`${testCase.name} can be written and read with bloom filters`, async () => {
      const dir = os.tmpdir();
      const numMessages = 10;

      const res: DSNPBatchWriteResult = await testCase.gen(dir, numMessages);
      expect(res.error).toEqual("");
      expect(res.path).toMatch(dir);
      expect(res.records).toEqual(10);

      const reader = await parquet.ParquetReader.openFile(res.path);
      expect(reader).not.toBeUndefined();
      const cursor = reader.getCursor();
      let record: Record<string, unknown> = {};
      let numRecords = 0;
      while ((record = await cursor.next())) {
        numRecords++;
        ["signature", "dsnpType", "fromId"].forEach((field) => {
          expect(record).toHaveProperty(field);
        });
      }
      expect(numRecords).toEqual(numMessages);

      // some sanity checking of the bloom filters.
      const bloomFilters = await reader.getBloomFiltersFor(testCase.bloom);
      expect(Object.keys(bloomFilters).length).toEqual(testCase.bloom.length);
      testCase.bloom.forEach((columnName) => {
        const bf = bloomFilters[columnName][0];
        expect(bf.sbbf.splitBlockFilter).toHaveLength(935);
        expect(bf.rowGroupIndex).toEqual(0);
      });

      fs.unlinkSync(res.path || "");
    });
  });
});
