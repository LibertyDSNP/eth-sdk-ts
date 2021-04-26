import * as fs from "fs";
import * as path from "path";

import { Config } from "./config";

// Require is necessary here to re-import the config module and reset local state
// eslint-disable-next-line @typescript-eslint/no-var-requires
let config = require("./config");

// module.export is necessary here because import is not supported in dynamic imports
const TEST_CONFIG_FILE = `
module.exports = { test: "object" };
`;

describe("config", () => {
  describe("#getConfig", () => {
    describe("with a config file", () => {
      const configPath = path.resolve("./dsnp.config.js");

      beforeAll(() => {
        // Write test config to ./dsnp.config.js
        fs.writeFileSync(configPath, TEST_CONFIG_FILE);
      });

      afterAll(() => {
        // rm ./dsnp.config.js
        fs.unlinkSync(configPath);

        // Reimport config module to clear local state
        jest.resetModules();
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        config = require("./config");
      });

      it("fetches the config settings from the file", async () => {
        expect(await config.getConfig()).toMatchObject({ test: "object" });
      });

      it("overrides the returned settings with any provided parameters", async () => {
        expect(
          await config.getConfig(({
            test: "differentObject",
          } as unknown) as Config)
        ).toMatchObject({
          test: "differentObject",
        });
      });
    });

    describe("without a config file", () => {
      it("returns the default settings when the config hasn't been set yet", async () => {
        const results = await config.getConfig();

        // We have to test keys here because #toMatchObject doesn't work with
        // object instances
        expect(results["queue"]).toBeInstanceOf(Object);
        expect(results["store"]).toBeInstanceOf(Object);
      });

      it("fetches the current config settings", async () => {
        const testConfig = ({
          test: "object",
        } as unknown) as Config;

        await config.setConfig(testConfig);

        expect(await config.getConfig()).toMatchObject({ test: "object" });
      });

      it("overrides the returned settings with any provided parameters", async () => {
        const testConfig = ({
          test: "object",
        } as unknown) as Config;

        await config.setConfig(testConfig);

        expect(
          await config.getConfig(({
            test: "differentObject",
          } as unknown) as Config)
        ).toMatchObject({
          test: "differentObject",
        });
      });
    });
  });

  describe("#setConfig", () => {
    it("updates the config settings", async () => {
      const testConfig = ({
        test: "object",
      } as unknown) as Config;

      await config.setConfig(testConfig);

      expect(await config.getConfig()).toMatchObject({ test: "object" });
    });
  });
});
