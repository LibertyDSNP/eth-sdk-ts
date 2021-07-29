import { providers, Wallet } from "ethers";
import { getConfig, requireGetCurrentFromURI, requireGetProvider, requireGetSigner, requireGetStore } from "./config";
import {
  MissingStoreConfigError,
  MissingSignerConfigError,
  MissingProviderConfigError,
  MissingFromIdConfigError,
} from "./errors";
import TestStore from "../../test/testStore";

describe("config", () => {
  describe("requireGetters", () => {
    const badConfig = getConfig();

    it("requireGetSigner works", () => {
      expect(() => requireGetSigner(badConfig)).toThrow(MissingSignerConfigError);

      const signer = Wallet.createRandom();
      expect(requireGetSigner({ signer: signer })).toBeInstanceOf(Object);
    });

    it("requireGetProvider works", () => {
      expect(() => requireGetProvider(badConfig)).toThrow(MissingProviderConfigError);

      const testProvider = new providers.JsonRpcProvider("http://localhost:8383");
      expect(requireGetProvider({ provider: testProvider })).toBeInstanceOf(Object);
    });

    it("requireGetStore works", () => {
      expect(() => requireGetStore(badConfig)).toThrow(MissingStoreConfigError);

      const testStore = new TestStore();
      expect(requireGetStore({ store: testStore })).toBeInstanceOf(Object);
    });

    it("requireGetCurrentFromURI", () => {
      expect(() => requireGetCurrentFromURI(badConfig)).toThrow(MissingFromIdConfigError);

      const testRegistration = "0xabcd1234";
      expect(requireGetCurrentFromURI({ currentFromURI: testRegistration })).toEqual(testRegistration);
    });
  });
});
