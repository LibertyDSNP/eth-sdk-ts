//eslint-disable-next-line
require("dotenv").config();
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";

import { KeccakHash } from "../types/hash";
import { hashPrefix } from "../utilities/hashPrefix";

const BATCH_CONTRACT_ADDRESS = process.env.BATCH_CONTRACT_ADDRESS as string;
const BATCH_CONTRACT_ABI: AbiItem[] = [
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

const contract: Contract | null = null;

export const getContract = (web3Instance: Web3): Contract => {
  if (contract) return contract;
  return new web3Instance.eth.Contract(BATCH_CONTRACT_ABI, BATCH_CONTRACT_ADDRESS);
};

/**
 * batch() allows users call the batch smart contract and post the URI and hash
 * of a generated batch to the blockchain.
 *
 * @param provider  The web3 instance used for calling the smart contract
 * @param accountAddress   The address from which to post the batch
 * @param uri       The URI of the hosted batch to post
 * @param hash      A hash of the batch contents for use in verification
 * @returns         A [web3 contract receipt promise](https://web3js.readthedocs.io/en/v1.3.4/web3-eth-contract.html#id36)
 */
export const batch = async (provider: Web3, accountAddress: string, uri: string, hash: KeccakHash): Promise<any> => {
  const contract = (await getContract(provider)) as Contract;
  return await contract.methods.batch(hashPrefix(hash), uri).send({
    from: accountAddress,
    gas: 27000,
  });
};
