//eslint-disable-next-line
require("dotenv").config();
import { setConfig } from "../config";
import { ethers } from "ethers";

type SdkTestConfig = { provider: ethers.providers.JsonRpcProvider; signer: ethers.Signer };

export const setupConfig = (): SdkTestConfig => {
  const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
  const RPC_URL = String(process.env.RPC_URL);
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(TESTING_PRIVATE_KEY);
  setConfig({
    signer,
    provider,
  });
  return {
    signer,
    provider,
  };
};
