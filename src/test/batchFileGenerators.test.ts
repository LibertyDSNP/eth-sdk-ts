import os from "os";
import {
  DSNPBatchWriteResult,
  generateBroadcastBatchFile,
  generateReactionBatchFile,
  generateReplyBatchFile,
} from "./generators/batchFileGenerators";

describe("batchFileGenerators", () => {
  [generateBroadcastBatchFile, generateReactionBatchFile, generateReplyBatchFile].forEach((f) => {
    it(`${f.name} works as designed`, async () => {
      const dir = os.tmpdir();
      const numMessages = 10;

      const res: DSNPBatchWriteResult = await f(dir, numMessages);
      expect(res.error).toEqual("");
      expect(res.path).toMatch(dir);
      expect(res.records).toEqual(10);
    });
  });
});
