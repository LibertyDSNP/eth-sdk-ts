//eslint-disable-next-line
import { HexString } from "../types/Strings";
import { keccak256 } from "js-sha3";
import { Contract, ContractInterface, ethers } from "ethers";
import { MissingContract } from "../utilities";

export const GAS_LIMIT_BUFFER = 1000;
export const keccakTopic = (topic: string): HexString => "0x" + keccak256(topic);
const DSNP_MIGRATION_TYPE = "DSNPMigration(address,string)";

interface ContractResult {
  contractAddr: string;
  contractName: string;
  blockNumber: number;
  blockHash: string;
}

export const DSNPMigrationABI: ethers.utils.ParamType[] = [
  ethers.utils.ParamType.fromObject({
    indexed: false,
    baseType: "address",
    name: "contractAddr",
    type: "address",
  }),
  ethers.utils.ParamType.fromObject({
    indexed: false,
    baseType: "string",
    name: "contractName",
    type: "string",
  }),
];

const decodeReturnValues = (inputs: ethers.utils.ParamType[], logs: ethers.providers.Log[]): ContractResult[] => {
  const decoder = new ethers.utils.AbiCoder();
  return logs.map((log: ethers.providers.Log) => {
    const { contractAddr, contractName } = decoder.decode(inputs, log.data);

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
 * @param provider initialized provider
 * @param string Name of contract to find address for
 * @returns HexString A hexidecimal string representing the contract address
 */

export const getContractAddress = async (
  provider: ethers.providers.Provider,
  contractName: string
): Promise<HexString | null> => {
  const topic = keccakTopic(DSNP_MIGRATION_TYPE);

  const logs: ethers.providers.Log[] = await provider.getLogs({ topics: [topic], fromBlock: 0 });
  const decodedValues = decodeReturnValues(DSNPMigrationABI, logs);
  const filteredResults = filterValues(decodedValues, contractName);
  return filteredResults.length > 0 ? filteredResults[filteredResults.length - 1].contractAddr : null;
};

export const getContract = async (
  provider: ethers.providers.Provider,
  contractName: string,
  abi: ContractInterface
) => {
  const address = (await getContractAddress(provider, contractName)) as string;
  if (!address) throw MissingContract;
  return new Contract(address, abi, provider) as Contract;
};
