//eslint-disable-next-line
import {HexString} from "../types/Strings";
import Web3 from "web3";
import { keccak256 } from "js-sha3";
import { AbiInput } from "web3-utils";
import { Log } from "web3-core";

export const keccakTopic = (topic: string): HexString => "0x" + keccak256(topic);

interface ContractResult {
  contractAddr: string;
  contractName: string;
  blockNumber: number;
  blockHash: string;
}

export const DSNPMigrationABI: AbiInput[] = [
  {
    indexed: false,
    internalType: "address",
    name: "contractAddr",
    type: "address",
  },
  {
    indexed: false,
    internalType: "string",
    name: "contractName",
    type: "string",
  },
];

const decodeReturnValues = (web3: Web3, inputs: AbiInput[], topic: string, logs: Log[]): ContractResult[] => {
  return logs.map((log: Log) => {
    const { contractAddr, contractName } = web3.eth.abi.decodeLog(inputs, log.data, [topic]);
    return {
      contractAddr: contractAddr,
      contractName: contractName,
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
    };
  });
};

const filterValues = (values: ContractResult[], contractName: string): ContractResult[] => {
  return values.filter((result: ContractResult) => {
    return result.contractName == contractName;
  });
};

/**
 * getContractAddress() allows users call the batch smart contract and post the URI and hash
 * of a generated batch to the blockchain.
 *
 * @param web3  Web3 instance initialized with provider
 * @param string Name of contract to find address for
 * @returns HexString A hexidecimal string representing the contract address
 */

export const getContractAddress = async (web3: Web3, contractName: string): Promise<HexString | null> => {
  const topic = keccakTopic("DSNPMigration(address,string)");

  const logs: Log[] = await web3.eth.getPastLogs({ topics: [topic], fromBlock: 0 });
  const decodedValues = decodeReturnValues(web3, DSNPMigrationABI, topic, logs);
  const filteredResults = filterValues(decodedValues, contractName);
  return filteredResults.length > 0 ? filteredResults[filteredResults.length - 1].contractAddr : null;
};
