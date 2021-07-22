import { Config } from "./core/config";
import { getConfig, setConfig } from "./config";

describe("config", () => {
  describe("#getConfig", () => {
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

      expect(
        getConfig(({
          otherTest: "differentObject",
        } as unknown) as Config)
      ).toMatchObject({
        test: "object",
        otherTest: "differentObject",
      });
    });
  });

  describe("#setConfig", () => {
    it("updates the config settings", async () => {
      const testConfig = ({
        test: "object",
      } as unknown) as Config;

      setConfig(testConfig);

      expect(getConfig()).toMatchObject({ test: "object" });
    });

    it("does not remove existing keys in the config settings", async () => {
      setConfig({
        other_test: "blah blah",
      });

      const testConfig = ({
        test: "object",
      } as unknown) as Config;

      setConfig(testConfig);

      expect(getConfig()).toMatchObject({ other_test: "blah blah", test: "object" });
    });
  });
});
