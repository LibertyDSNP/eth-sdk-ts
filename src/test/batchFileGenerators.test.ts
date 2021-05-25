import os from "os";
import { DSNPBatchWriteResult, generateBatchBroadcasts } from "./generators/batchFileGenerators";

describe("batchFileGenerators", () => {
  it("generateBatchBroadcasts", async () => {
    const dir = os.tmpdir();
    const numMessages = 10;

    const res: DSNPBatchWriteResult = await generateBatchBroadcasts(dir, numMessages);
    expect(res.error).toEqual("");
    expect(res.path).toMatch(dir);
    expect(res.records).toEqual(10);
  });
});
