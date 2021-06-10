import { providers, Wallet } from "ethers";
import {
  getConfig,
  setConfig,
  Config,
  getQueue,
  ConfigOpts,
  MissingStore,
  MissingUser,
  requireGetConfig,
} from "./config";
import {} from "./core/utilities";

describe("config", () => {
  describe("#getConfig", () => {
    it("returns the default settings when the config hasn't been set yet", () => {
      const queue = getQueue();

      // We have to test keys here because #toMatchObject doesn't work with
      // object instances
      expect(queue).toBeInstanceOf(Object);
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

  describe("getConfigOrThrow", () => {
    // get a minimal valid config
    describe("when config is missing required params", () => {
      it("throws when something is missing", () => {
        const testConfig = {
          signer: Wallet.createRandom(),
          provider: new providers.JsonRpcProvider("http://localhost:8383"),
        };
        setConfig(testConfig);
        expect(() => requireGetConfig(["signer", "provider", "currentFromId"])).toThrow(MissingUser);
      });

      it("throws when we require invalid config", () => {
        expect(() => requireGetConfig(["singer"])).toThrow("unknown config: singer");
      });

      it("throws when the config key exists but its value is undefined", () => {
        setConfig({
          provider: undefined,
          store: undefined,
          signer: undefined,
          currentFromId: undefined,
        });
        expect(() => requireGetConfig(["store", "currentFromId", "provider", "signer"])).toThrow(MissingStore);
      });
    });

    describe("when config has all expected values", () => {
      const testConfig: ConfigOpts = getConfig();

      [
        { name: "when passed no params", require: [] },
        { name: "when passed params that exist", require: ["queue", "contracts"] },
      ].forEach((tc) => {
        it(`${tc.name} returns config`, () => {
          expect(requireGetConfig([])).toEqual(testConfig);
        });
      });
    });
  });
});
