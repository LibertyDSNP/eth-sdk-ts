//eslint-disable-next-line
require("dotenv").config();
import { setConfig } from "../config";
import { Wallet, Signer, providers } from "ethers";

type SdkTestConfig = { provider: providers.Provider; signer: Signer };

export const setupConfig = (): SdkTestConfig => {
  const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
  const RPC_URL = String(process.env.RPC_URL);
  const provider = new providers.JsonRpcProvider(RPC_URL);
  const signer = new Wallet(TESTING_PRIVATE_KEY);
  const conf = setConfig({
    signer,
    provider,
  });
  if (!conf.signer || !conf.provider) throw new Error("Something is very wrong with sdkTestConfig");
  return {
    signer: conf.signer,
    provider: conf.provider,
  };
};
