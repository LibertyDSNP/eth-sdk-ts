import { BroadcastMessage, DSNPType } from "../messages/messages";
import { enqueue, dequeue, getAll, IdDoesNotExist } from "./memoryQueue";

describe("memoryQueue", () => {
  const testMsg: BroadcastMessage = {
    type: DSNPType.Broadcast,
    contentHash: "test",
    fromId: "test",
    uri: "test",
  };

  describe("#enqueue", () => {
    it("adds a message to the queue and returns a queue id", async () => {
      const result = await enqueue(testMsg);

      expect(await getAll()).toEqual([testMsg]);
      expect(result).toEqual("0");
    });
  });

  describe("#dequeue", () => {
    describe("with a valid queue id", () => {
      let queueId = "";

      beforeEach(async () => {
        queueId = await enqueue(testMsg);
      });

      it("removes a message from the queue and returns it", async () => {
        const result = await dequeue(queueId);

        expect(await getAll()).toEqual([]);
        expect(result).toEqual(testMsg);
      });
    });

    describe("with an invalid queue id", () => {
      it("throws IdDoesNotExist", async () => {
        await expect(dequeue("DEADCODE")).rejects.toThrow(IdDoesNotExist);
      });
    });
  });

  describe("#getAll", () => {
    it("returns the contents of the queue", async () => {
      await enqueue({
        type: DSNPType.Broadcast,
        contentHash: "test",
        fromId: "test",
        uri: "test1",
      });
      const idToRemove = await enqueue({
        type: DSNPType.Broadcast,
        contentHash: "test",
        fromId: "test",
        uri: "test2",
      });
      await enqueue({
        type: DSNPType.Broadcast,
        contentHash: "test",
        fromId: "test",
        uri: "test3",
      });

      await dequeue(idToRemove);

      expect(await getAll()).toEqual([
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
