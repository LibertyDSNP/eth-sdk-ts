//eslint-disable-next-line
require("dotenv").config();
import { setConfig } from "../core/config";
import { Wallet, Signer, providers } from "ethers";

type SdkTestConfig = { provider: providers.JsonRpcProvider; signer: Signer };

export const setupConfig = (): SdkTestConfig => {
  const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
  const RPC_URL = String(process.env.RPC_URL);
  const provider = new providers.JsonRpcProvider(RPC_URL);
  const signer = new Wallet(TESTING_PRIVATE_KEY);
  // polling interval determines how often it checks for events on chain
  provider.pollingInterval = 500;
  const conf = setConfig({
    signer,
    provider,
  });
  return {
    signer: conf.signer as Signer,
    provider: conf.provider as providers.JsonRpcProvider,
  };
};
