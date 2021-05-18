/* eslint @typescript-eslint/no-var-requires: "off" */
require("dotenv").config();
import { Log } from "web3-core";
import Web3 from "web3";
import { getContractAddress } from "./contract";
import { snapshotHardhat, revertHardhat } from "../test/hardhatRPC";
import { keccakTopic } from "./contract";
import { abi as announcerABI } from "@dsnp/contracts/abi/Announcer.json";

const Contract = require("web3-eth-contract");

beforeAll(() => {
  Contract.setProvider(process.env.RPC_URL as string);
});

beforeEach(async () => {
  await snapshotHardhat();
});

afterEach(async () => {
  await revertHardhat();
});

describe("Contracts", () => {
  describe("getContractAddress", () => {
    it("returns latest address for contract", async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL as string));
      const contractAddress = await getContractAddress(web3, "Announcer");
      expect(contractAddress).not.toBeNull();
    });

    it("returns null if no values found", async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL as string));
      const contractAddress = await getContractAddress(web3, "Test");
      expect(contractAddress).toBeNull();
    });
  });

  describe("Call batch on Announcer Contract", () => {
    describe("Using snapshot", () => {
      it("only call the function once", async () => {
        const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL as string));
        const contractAddress = await getContractAddress(web3, "Announcer");
        const announcerContract = new Contract(announcerABI, contractAddress);
        await announcerContract.methods
          .batch("0x0", "http://test.com")
          .send({ from: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" });
        const announcerTopic = keccakTopic("DSNPBatch(bytes32,string)");
        const logs: Log[] = await web3.eth.getPastLogs({ topics: [announcerTopic], fromBlock: 0 });
        expect(logs.length).toEqual(1);
      });
    });
  });
});
