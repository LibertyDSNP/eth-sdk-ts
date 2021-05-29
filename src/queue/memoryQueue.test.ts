import { BroadcastMessage, DSNPType } from "../messages/messages";
import MemoryQueue, { IdDoesNotExist } from "./memoryQueue";

describe("memoryQueue", () => {
  const testMsg: BroadcastMessage = {
    type: DSNPType.Broadcast,
    contentHash: "test",
    fromId: "test",
    uri: "test",
  };

  describe("#enqueue", () => {
    it("adds a message to the queue and returns a queue id", async () => {
      const queue = new MemoryQueue();
      const result = await queue.enqueue(testMsg);

      expect(await queue.getAll()).toEqual([testMsg]);
      expect(result).toEqual("0");
    });
  });

  describe("#dequeue", () => {
    describe("with a valid queue id", () => {
      it("removes a message from the queue and returns it", async () => {
        const queue = new MemoryQueue();
        const queueId = await queue.enqueue(testMsg);

        const result = await queue.dequeue(queueId);

        expect(await queue.getAll()).toEqual([]);
        expect(result).toEqual(testMsg);
      });
    });

    describe("with an invalid queue id", () => {
      it("throws IdDoesNotExist", async () => {
        const queue = new MemoryQueue();
        await expect(queue.dequeue("DEADCODE")).rejects.toThrow(IdDoesNotExist);
      });
    });
  });

  describe("#getAll", () => {
    it("returns the contents of the queue", async () => {
      const queue = new MemoryQueue();
      await queue.enqueue({
        type: DSNPType.Broadcast,
        contentHash: "test",
        fromId: "test",
        uri: "test1",
      });
      const idToRemove = await queue.enqueue({
        type: DSNPType.Broadcast,
        contentHash: "test",
        fromId: "test",
        uri: "test2",
      });
      await queue.enqueue({
        type: DSNPType.Broadcast,
        contentHash: "test",
        fromId: "test",
        uri: "test3",
      });

      await queue.dequeue(idToRemove);

      expect(await queue.getAll()).toEqual([
        {
          type: DSNPType.Broadcast,
          contentHash: "test",
          fromId: "test",
          uri: "test1",
        },
        {
          type: DSNPType.Broadcast,
          contentHash: "test",
          fromId: "test",
          uri: "test3",
        },
      ]);
    });
  });
});
