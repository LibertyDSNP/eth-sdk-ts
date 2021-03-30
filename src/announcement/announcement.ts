require("dotenv").config();
import {KeccakHash} from "../types/hash";

const BATCH_CONTRACT_ADDRESS = process.env.BATCH_CONTRACT_ADDRESS as string;
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

const contract = null;

export const getContract = (web3Instance: any) => {
  if (contract) return contract;
  return new web3Instance.eth.Contract(BATCH_CONTRACT_ABI, BATCH_CONTRACT_ADDRESS);
};


export const post = async (provider: any, account: any, uri: string, hash: KeccakHash) => {
  const receipt = await getContract(provider).methods.batch(`0x${hash}`, uri).send({
    from: account.address,
    gasPrice: 6000000000
  }).on("receipt", console.log);

  return receipt;
};
