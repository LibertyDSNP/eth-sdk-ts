import * as ethers from "ethers";
import fetch from "node-fetch";
import { KeccakHash } from "../types/hash";

const RPC_URL = "http://localhost:8545";
const BATCH_CONTRACT_ADDRESS = "0x1123949C3D569F93295Ef76aaC537c1287fa83D9";
const BATCH_CONTRACT_ABI = [
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

let contract: ethers.Contract | null = null;

export const getContract = (wallet: ethers.Signer): ethers.Contract => {
  if (contract) return contract;

  contract = new ethers.Contract(BATCH_CONTRACT_ADDRESS, BATCH_CONTRACT_ABI, wallet);
  return contract;
};

export const post = async (wallet: ethers.Signer, uri: string, hash: KeccakHash) => {
  return getContract(wallet).batch(`0x${hash}`, uri);
};
