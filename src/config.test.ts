import { providers, Wallet } from "ethers";
import {
  getConfig,
  setConfig,
  Config,
  MissingStore,
  MissingSigner,
  MissingProvider,
  requireGetCurrentFromId,
  requireGetProvider,
  requireGetSigner,
  requireGetStore,
  MissingUser,
} from "./config";
import TestStore from "./test/testStore";

describe("config", () => {
  describe("#getConfig", () => {
    it("returns the default settings when the config hasn't been set yet", () => {
      const { queue } = getConfig();

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

  describe("requireGetters", () => {
    const badConfig = getConfig();

    it("requireGetSigner works", () => {
      expect(() => requireGetSigner(badConfig)).toThrow(MissingSigner);

      const signer = Wallet.createRandom();
      expect(requireGetSigner({ signer: signer })).toBeInstanceOf(Object);
    });

    it("requireGetProvider works", () => {
      expect(() => requireGetProvider(badConfig)).toThrow(MissingProvider);

      const testProvider = new providers.JsonRpcProvider("http://localhost:8383");
      expect(requireGetProvider({ provider: testProvider })).toBeInstanceOf(Object);
    });

    it("requireGetStore works", () => {
      expect(() => requireGetStore(badConfig)).toThrow(MissingStore);

      const testStore = new TestStore();
      expect(requireGetStore({ store: testStore })).toBeInstanceOf(Object);
    });

    it("requireGetCurrentFromId", () => {
      expect(() => requireGetCurrentFromId(badConfig)).toThrow(MissingUser);

      const testRegistration = "0xabcd1234";
      expect(requireGetCurrentFromId({ currentFromId: testRegistration })).toEqual(testRegistration);
    });
  });
});
