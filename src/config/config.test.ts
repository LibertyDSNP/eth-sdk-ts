import MemoryStore from "../storage/memoryStorage";
import MemoryQueue from "../batch/memoryQueue";
import { getConfig, setConfig, Config } from "./config";

describe("config", () => {
  describe("#getConfig", () => {
    it("returns the default settings when the config hasn't been set yet", async () => {
      expect(await getConfig()).toMatchObject({
        store: MemoryStore(),
        queue: MemoryQueue(),
      });
    });

    it("fetches the current config settings", async () => {
      const testConfig = ({
        test: "object",
      } as unknown) as Config;

      await setConfig(testConfig);

      expect(await getConfig()).toMatchObject({ test: "object" });
    });

    it("overrides the returned settings with any provided parameters", async () => {
      const testConfig = ({
        test: "object",
      } as unknown) as Config;

      await setConfig(testConfig);

      expect(await getConfig(({ test: "differentObject" } as unknown) as Config)).toMatchObject({
        test: "differentObject",
      });
    });
  });

  describe("#setConfig", () => {
    it("updates the config settings", async () => {
      const testConfig = ({
        test: "object",
      } as unknown) as Config;

      await setConfig(testConfig);

      expect(await getConfig()).toMatchObject({ test: "object" });
    });
  });
});
