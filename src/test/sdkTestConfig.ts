//eslint-disable-next-line
require("dotenv").config();
import { getConfig, setConfig } from "../config";
import { ethers } from "ethers";

type SdkTestConfig = { provider: ethers.providers.JsonRpcProvider; signer: ethers.Signer };

export const setupConfig = (): SdkTestConfig => {
  const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
  const RPC_URL = String(process.env.RPC_URL);
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(TESTING_PRIVATE_KEY, provider);
  setConfig({
    signer,
    provider,
  });
  return {
    signer,
    provider,
  };
};

/**
 * Use this function to set up a new signer other than what is in the config.
 * @param privateKey
 */
export const getSignerFromPrivateKey = (privateKey: string): ethers.Signer => {
  const { provider } = getConfig();
  if (!provider) throw new Error("no provider configured");
  return new ethers.Wallet(privateKey, provider);
};
