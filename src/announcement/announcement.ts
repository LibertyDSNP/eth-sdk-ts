require("dotenv").config();
import { KeccakHash } from "../types/hash";

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
  return new web3Instance.eth.Contract(BATCH_CONTRACT_ABI, BATCH_CONTRACT_ADDRESS, {
    transactionConfirmationBlocks: 1,
  });
};

/**
 * batch() allows users call the batch smart contract and post the URI and hash
 * of a generated batch to the blockchain.
 *
 * @param provider  The web3 instance used for calling the smart contract
 * @param account   The account from which to post the batch
 * @param uri       The URI of the hosted batch to post
 * @param hash      A hash of the batch contents for use in verification
 * @returns         A [web3 contract receipt promise](https://web3js.readthedocs.io/en/v1.3.4/web3-eth-contract.html#id36)
 */
export const batch = async (provider: any, account: any, uri: string, hash: KeccakHash) => {
  const nonce = await provider.eth.getTransactionCount(account.address);
  console.log("account.address", account.address);
  console.log("nonce", nonce);
  console.log("new nonce", nonce + 1);
  const contract = await getContract(provider);
  console.log("contract", contract);
  const receipt = await contract.methods.batch(`0x${hash}`, uri)
    .send(
      {
        from: account.address,
        gasPrice: 6000000000,
        gas: 1000000,
        nonce: nonce + 1,
      },
      () => {
        console.log("we are here");
      }
    )
    .on("sending", console.log)
    .on("sent", console.log)
    .on("transactionHash", console.log)
    .on("receipt", console.log)
    .on("error", console.log);

  console.log("receipt", receipt);
  return receipt;
};
