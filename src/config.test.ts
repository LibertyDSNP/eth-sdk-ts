import { getConfig, setConfig, Config } from "./config";

describe("config", () => {
  describe("#getConfig", () => {
    it("returns the default settings when the config hasn't been set yet", () => {
      const results = getConfig();

      // We have to test keys here because #toMatchObject doesn't work with
      // object instances
      expect(results["queue"]).toBeInstanceOf(Object);
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
  });
});
