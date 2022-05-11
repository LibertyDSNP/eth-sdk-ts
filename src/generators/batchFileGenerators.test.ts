import os from "os";
import fs from "fs";
import parquet from "@dsnp/parquetjs";

import {
  DSNPBatchWriteResult,
  generateBroadcastBatchFile,
  generateReactionBatchFile,
  generateReplyBatchFile,
} from "./batchFileGenerators";

describe("batchFileGenerators", () => {
  [
    { name: "Broadcasts", gen: generateBroadcastBatchFile, bloom: ["fromId"] },
    { name: "Reactions", gen: generateReactionBatchFile, bloom: ["fromId", "inReplyTo", "emoji"] },
    { name: "Replies", gen: generateReplyBatchFile, bloom: ["fromId", "inReplyTo"] },
  ].forEach((testCase) => {
    it(`${testCase.name} can be written and read with bloom filters`, async () => {
      const dir = os.tmpdir();
      const numRows = 10;

      const res: DSNPBatchWriteResult = await testCase.gen(dir, numRows);
      expect(res.error).toEqual("");
      expect(res.path).toMatch(dir);
      expect(res.records).toEqual(10);

      const reader = await parquet.ParquetReader.openFile(res.path);
      expect(reader).not.toBeUndefined();
      const cursor = reader.getCursor();
      let record: unknown = {};
      let numRecords = 0;
      while ((record = await cursor.next())) {
        numRecords++;
        ["signature", "announcementType", "fromId"].forEach((field) => {
          expect(record).toHaveProperty(field);
        });
      }
      expect(numRecords).toEqual(numRows);

      // some sanity checking of the bloom filters.
      const bloomFilters = await reader.getBloomFiltersFor(testCase.bloom);
      expect(Object.keys(bloomFilters).length).toEqual(testCase.bloom.length);
      testCase.bloom.forEach((columnName) => {
        const bf = bloomFilters[columnName][0];
        expect(bf.sbbf.getNumFilterBlocks()).toEqual(935);
        expect(bf.rowGroupIndex).toEqual(0);
      });

      fs.unlinkSync(res.path || "");
    });
  });
});
