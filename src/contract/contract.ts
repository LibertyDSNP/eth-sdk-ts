//eslint-disable-next-line
require("dotenv").config();
import Web3 from "web3";
import { keccak256 } from "js-sha3";
import { AbiInput } from "web3-utils";
import { Log } from "web3-core";

export const keccakTopic = (topic: string) => "0x" + keccak256(topic);

interface ContractResult {
  contractAddress: string;
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

const decodeReturnValues = (web3: Web3, inputs: AbiInput[], topic: string, logs: Log[]) => {
  return logs.map((log: Log) => {
    const decodedValue = web3.eth.abi.decodeLog(inputs, log.data, [topic]);
    return {
      contractAddress: decodedValue.contractAddr,
      contractName: decodedValue.contractName,
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

export const getContractAddress = async (
  web3: Web3,
  contractName: string
): Promise<ContractResult | Record<string, string>> => {
  const topic = keccakTopic("DSNPMigration(address,string)");

  const logs: Log[] = await web3.eth.getPastLogs({ topics: [topic], fromBlock: 0 });
  const decodedValues = decodeReturnValues(web3, DSNPMigrationABI, topic, logs);
  const filteredResults: ContractResult[] = filterValues(decodedValues, contractName);
  return filteredResults.length > 0
    ? filteredResults[filteredResults.length - 1]
    : { error: `No longs found for contract name: ${contractName}` };
};
