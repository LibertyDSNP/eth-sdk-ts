/* eslint @typescript-eslint/no-var-requires: "off" */
require("dotenv").config();
import { Log } from "web3-core";
import Web3 from "web3";
import { getContractAddress } from "./contract";
import { snapshotHardhat, revertHardhat } from "../test/hardhatRPC";
import { keccakTopic } from "./contract";

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

const announcerABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "dsnpUri",
        type: "string",
      },
    ],
    name: "DSNPBatch",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "dsnpUri",
        type: "string",
      },
    ],
    name: "batch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

describe("Contracts", () => {
  describe("getContractAddress", () => {
    it("returns latest address for contract", async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL as string));
      const contractResults = await getContractAddress(web3, "Announcer");
      expect(contractResults.contractName).toEqual("Announcer");
      expect(contractResults).toEqual(
        expect.objectContaining({
          contractAddress: expect.any(String),
          contractName: "Announcer",
          blockNumber: 3,
          blockHash: expect.any(String),
        })
      );
    });
    it("returns empty array if no values found", async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL as string));
      const contractResults = await getContractAddress(web3, "Test");
      expect(contractResults).toEqual({ error: "No longs found for contract name: Test" });
    });
  });

  describe("Call batch on Announcer Contract", () => {
    describe("Using snapshot", () => {
      it("only call the function once", async () => {
        const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL as string));
        const contractResults = await getContractAddress(web3, "Announcer");
        console.log("results", contractResults);
        const announcerContract = new Contract(announcerABI, contractResults.contractAddress);
        console.log("announcer contract", announcerContract);
        const receipt = await announcerContract.methods
          .batch("0x0", "http://test.com")
          .send({ from: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" });
        console.log("receipt", receipt);
        const announcerTopic = keccakTopic("DSNPBatch(bytes32,string)");
        const logs: Log[] = await web3.eth.getPastLogs({ topics: [announcerTopic], fromBlock: 0 });
        expect(logs.length).toEqual(1);
      });
    });
  });
});
