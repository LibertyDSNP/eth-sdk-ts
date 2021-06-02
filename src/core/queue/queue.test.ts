import { setConfig } from "../../config";
import { DSNPType } from "../messages/messages";
import { dequeueBatch, enqueue, remove } from "./queue";
import { BatchBroadcastMessage } from "../batch/batchMesssages";

describe("queue", () => {
  const testMsg: BatchBroadcastMessage = {
    dsnpType: DSNPType.Broadcast,
    contentHash: "test",
    fromId: "test",
    uri: "test",
    signature: "0x0badbadbadfa730316",
  };
  const testId = "12345";
  const fakeQueue = {
    dequeue: jest.fn(),
    enqueue: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    fakeQueue.dequeue.mockReset();
    fakeQueue.dequeue
      .mockResolvedValueOnce(testMsg)
      .mockResolvedValueOnce(testMsg)
      .mockResolvedValueOnce(testMsg)
      .mockResolvedValueOnce(testMsg)
      .mockResolvedValueOnce(testMsg)
      .mockResolvedValue(null);

    fakeQueue.enqueue.mockReset();
    fakeQueue.enqueue.mockResolvedValue(testId);

    fakeQueue.remove.mockReset();
    fakeQueue.remove.mockResolvedValue(testMsg);

    await setConfig({
      queue: fakeQueue,
      contracts: {},
    });
  });

  describe("#enqueue", () => {
    it("calls the enqueue method of the configured queue adapter", async () => {
      const result = await enqueue(testMsg);

      expect(fakeQueue.enqueue).toHaveBeenCalledWith(testMsg.type, testMsg);
      expect(result).toEqual(testId);
    });
  });

  describe("#remove", () => {
    it("calls the dequeue method of the configured queue adapter", async () => {
      const result = await remove(testId);

      expect(fakeQueue.remove).toHaveBeenCalledWith(testId);
      expect(result).toEqual(testMsg);
    });
  });

  describe("#dequeueBatch", () => {
    beforeEach(async () => {
      for (let i = 0; i < 5; i++) {
        await enqueue(testMsg);
      }
    });

    describe("with a 3 passed for count", () => {
      it("calls the dequeue method of the configured queue adapter 3 times", async () => {
        await dequeueBatch(DSNPType.Broadcast, 3);

        expect(fakeQueue.dequeue).toHaveBeenCalledTimes(3);
        for (let i = 0; i < 3; i++) {
          expect(fakeQueue.dequeue).toHaveBeenNthCalledWith(i + 1, DSNPType.Broadcast);
        }
      });

      it("returns an array of the returned messages", async () => {
        const results = await dequeueBatch(DSNPType.Broadcast, 3);

        expect(results.length).toEqual(3);
        for (let i = 0; i < 3; i++) {
          expect(results[i]).toMatchObject(testMsg);
        }
      });
    });

    describe("with a 0 passed for count", () => {
      it("calls the dequeue method of the configured queue adapter until queue is empty", async () => {
        await dequeueBatch(DSNPType.Broadcast, 0);

        expect(fakeQueue.dequeue).toHaveBeenCalledTimes(6);
        for (let i = 0; i < 5; i++) {
          expect(fakeQueue.dequeue).toHaveBeenNthCalledWith(i + 1, DSNPType.Broadcast);
        }
      });

      it("returns an array of the returned messages", async () => {
        const results = await dequeueBatch(DSNPType.Broadcast, 0);

        expect(results.length).toEqual(5);
        for (let i = 0; i < 5; i++) {
          expect(results[i]).toMatchObject(testMsg);
        }
      });
    });
  });
});
