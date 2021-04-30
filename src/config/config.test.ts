import { getConfig, setConfig, Config } from "./config";

describe("config", () => {
  describe("#getConfig", () => {
    it("returns the default settings when the config hasn't been set yet", async () => {
      const results = await getConfig();

      // We have to test keys here because #toMatchObject doesn't work with
      // object instances
      expect(results["queue"]).toBeInstanceOf(Object);
      expect(results["store"]).toBeInstanceOf(Object);
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

      expect(
        await getConfig(({
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

      await setConfig(testConfig);

      expect(await getConfig()).toMatchObject({ test: "object" });
    });
  });
});
