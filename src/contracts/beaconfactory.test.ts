//eslint-disable-next-line
require("dotenv").config();
import { BigNumber, ContractReceipt, ethers, Signer } from "ethers";
import { findEvent } from "./contract";
import { snapshotHardhat, revertHardhat } from "../test/hardhatRPC";
import { createAndRegisterBeaconProxy } from "./identity";
import { setConfig, getConfig } from "../config/config";
import { JsonRpcProvider } from "@ethersproject/providers/src.ts/json-rpc-provider";

const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
const RPC_URL = String(process.env.RPC_URL);

describe("identity", () => {
  let signer: Signer;
  let provider: JsonRpcProvider;

  beforeAll(async () => {
    provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    signer = new ethers.Wallet(TESTING_PRIVATE_KEY, provider);
    const config = await getConfig();
    config.provider = provider;
    config.signer = signer;
    await setConfig(config);
  });

  beforeEach(async () => {
    // Remember snapshots are used up each time they are reverted to, so beforeEach.
    await snapshotHardhat(provider);
  });

  afterEach(async () => {
    await revertHardhat(provider);
  });

  describe("#createAndRegisterBeaconProxy", () => {
    const handle = "flarp";
    const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";

    it("returns a Contract Transaction that can be resolved into a DSNP Id", async () => {
      const transaction = await createAndRegisterBeaconProxy(fakeAddress, handle);

      const receipt = await transaction.wait(1);

      expect(getIdFromReceipt(receipt).toNumber()).toBeGreaterThan(999);

      const address = getAddressFromReceipt(receipt);
      expect(ethers.utils.isAddress(address)).toBeTruthy();
    });
  });
});

const getIdFromReceipt = (receipt: ContractReceipt): BigNumber => {
  const registerEvent = findEvent("DSNPRegistryUpdate", receipt.logs);
  return registerEvent.args[0];
};

const getAddressFromReceipt = (receipt: ContractReceipt): string => {
  const proxyEvent = findEvent("ProxyCreated", receipt.logs);
  return proxyEvent.args[0];
};
