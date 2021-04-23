import MemoryStore from "../storage/memoryStorage";
import MemoryQueue from "../batch/memoryQueue";
import { getConfig, setConfig, Config } from "./config";

describe("config", () => {
  describe("#getConfig", () => {
    it("returns the default settings when the config hasn't been set yet", () => {
      expect(getConfig()).toMatchObject({
        store: MemoryStore(),
        queue: MemoryQueue(),
      });
    });

    it("fetches the current config settings", () => {
      const testConfig = ({
        test: "object",
      } as unknown) as Config;

      setConfig(testConfig);

      expect(getConfig()).toMatchObject({ test: "object" });
    });

    it("overrides the returned settings with any provided parameters", () => {
      const testConfig = ({
        test: "object",
      } as unknown) as Config;

      setConfig(testConfig);

      expect(getConfig(({ test: "differentObject" } as unknown) as Config)).toMatchObject({
        test: "differentObject",
      });
    });
  });

  describe("#setConfig", () => {
    it("updates the config settings", () => {
      const testConfig = ({
        test: "object",
      } as unknown) as Config;

      setConfig(testConfig);

      expect(getConfig()).toMatchObject({ test: "object" });
    });
  });
});
