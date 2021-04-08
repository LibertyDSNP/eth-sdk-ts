//eslint-disable-next-line
require("dotenv").config();
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";

import { KeccakHash } from "../types/hash";
import { hashPrefix } from "../utilities/hashPrefix";
import { TransactionReceipt } from "web3-core/types";

const BATCH_CONTRACT_ADDRESS = String(process.env.BATCH_CONTRACT_ADDRESS);
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


const GAS_LIMIT_BUFFER = 1000;
const contract: Contract | null = null;

const getContract = (web3Instance: Web3): Contract => {
  if (contract) return contract;
  return new web3Instance.eth.Contract(BATCH_CONTRACT_ABI, BATCH_CONTRACT_ADDRESS);
};

const getGasLimit = async (contract: Contract, uri: string, hash: KeccakHash, fromAddress: string): Promise<number> => {
  const gasEstimate = await contract.methods.batch(hashPrefix(hash), uri).estimateGas({
    from: fromAddress,
  });

  return gasEstimate + GAS_LIMIT_BUFFER;
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
export const batch = async (
  provider: Web3,
  accountAddress: string,
  uri: string,
  hash: KeccakHash
): Promise<TransactionReceipt> => {
  const contract = await getContract(provider);
  const gasEstimate = await getGasLimit(contract, uri, hash, accountAddress);

  return contract.methods.batch(hashPrefix(hash), uri).send({
    from: accountAddress,
    gas: gasEstimate,
  });
};
