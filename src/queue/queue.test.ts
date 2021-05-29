import { setConfig } from "../config/config";
import { BroadcastMessage, DSNPType } from "../messages/messages";
import { enqueue, dequeue } from "./queue";

describe("queue", () => {
  const testMsg: BroadcastMessage = {
    type: DSNPType.Broadcast,
    contentHash: "test",
    fromId: "test",
    uri: "test",
  };
  const testId = "12345";
  const fakeQueue = {
    enqueue: jest.fn().mockResolvedValue(testId),
    dequeue: jest.fn().mockResolvedValue(testMsg),
    getAll: jest.fn(),
  };

  beforeAll(async () => {
    await setConfig({
      queue: fakeQueue,
    });
  });

  describe("#enqueue", () => {
    it("calls the enqueue method of the configured queue adapter", async () => {
      const result = await enqueue(testMsg);

      expect(fakeQueue.enqueue).toHaveBeenCalledWith(testMsg);
      expect(result).toEqual(testId);
    });
  });

  describe("#dequeue", () => {
    it("calls the dequeue method of the configured queue adapter", async () => {
      const result = await dequeue(testId);

      expect(fakeQueue.dequeue).toHaveBeenCalledWith(testId);
      expect(result).toEqual(testMsg);
    });
  });
});
