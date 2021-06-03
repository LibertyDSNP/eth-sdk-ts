import { DSNPType } from "../messages/messages";
import MemoryQueue from "./memoryQueue";
import { BatchBroadcastMessage } from "../batch/batchMesssages";

describe("memoryQueue", () => {
  const testMsg: BatchBroadcastMessage = {
    dsnpType: DSNPType.Broadcast,
    contentHash: "test",
    fromId: "test",
    uri: "test",
    signature: "0x0badbadbadfa730316",
  };

  describe("#enqueue", () => {
    it("adds a message to the queue and returns a queue id", async () => {
      const queue = new MemoryQueue();

      expect(await queue.enqueue(testMsg)).toEqual("2:0");
    });
  });

  describe("#dequeue", () => {
    it("removes a message with the matching DSNP type and returns it", async () => {
      const queue = new MemoryQueue();
      await queue.enqueue(testMsg);

      expect(await queue.dequeue(DSNPType.Broadcast)).toEqual(testMsg);
    });

    it("returns null when no more messages of DSNPType are present", async () => {
      const queue = new MemoryQueue();

      expect(await queue.dequeue(DSNPType.Broadcast)).toEqual(null);
    });
  });

  describe("#remove", () => {
    describe("with a valid queue id", () => {
      it("returns the message with the specified id", async () => {
        const queue = new MemoryQueue();
        const queueId = await queue.enqueue(testMsg);

        expect(await queue.remove(queueId)).toEqual(testMsg);
      });

      it("removes the message with the specified id", async () => {
        const queue = new MemoryQueue();
        const queueId = await queue.enqueue(testMsg);

        await queue.remove(queueId);

        expect(await queue.dequeue(DSNPType.Broadcast)).toEqual(null);
      });
    });

    describe("with an non-existent queue id", () => {
      it("throws", async () => {
        const queue = new MemoryQueue();
        await expect(queue.remove("1:1")).rejects.toThrow();
      });
    });

    describe("with an invalid queue id", () => {
      it("throws", async () => {
        const queue = new MemoryQueue();
        await expect(queue.remove("BAD_ID")).rejects.toThrow();
      });
    });
  });
});
