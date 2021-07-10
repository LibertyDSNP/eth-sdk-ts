import { JsonFragment } from "@ethersproject/abi";
import { ethers } from "ethers";
import { keccak256 } from "js-sha3";

import { getContracts, ConfigOpts } from "../../config";
import { MissingContractAddressError, NoLogsFoundContractError } from "./contractErrors";
import { HexString } from "../../types/Strings";
import * as types from "../../types/typechain";

const DSNP_MIGRATION_TYPE = "DSNPMigration(address,string)";

export const getKeccakTopic = (topic: string): HexString => "0x" + keccak256(topic);

type RawLog = { topics: Array<string>; data: string };

const EVENTS_ABI = new ethers.utils.Interface(
  [
    types.Publisher__factory,
    types.BeaconFactory__factory,
    types.Identity__factory,
    types.Migrations__factory,
    types.Registry__factory,
  ]
    // eslint-disable-next-line id-length
    .reduce((m, f) => m.concat(f.abi as Array<JsonFragment>), [] as Array<JsonFragment>)
    .filter((ef) => ef.type === "event") as Array<JsonFragment>
);

interface ContractResult {
  contractAddr: string;
  contractName: string;
  blockNumber: number;
  blockHash: string;
}

export interface VmError {
  body?: string;
  error?: {
    body?: string;
  };
}

export const DSNP_MIGRATION_ABI: ethers.utils.ParamType[] = [
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
 * getContractAddress() fetches the address for a given contract. If a contract
 * address override is available in the configuration, it will be returned. If
 * no override exists, the latest migration ABI will be fetched from the chain,
 * parsed and the appropriate contract address will be returned. If the contract
 * address is missing from the chain as well, a MissingContractAddressError will be
 * thrown.
 *
 * @throws {@link MissingContractAddressError}
 * Thrown if the requested contract address cannot be found.
 * @param provider - initialized provider
 * @param contractName - Name of contract to find address for
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns HexString A hexidecimal string representing the contract address
 */
export const getContractAddress = async (
  provider: ethers.providers.Provider,
  contractName: string,
  opts?: ConfigOpts
): Promise<HexString> => {
  const contractOverrides = getContracts(opts);
  if (contractOverrides[contractName]) return contractOverrides[contractName];

  const topic = getKeccakTopic(DSNP_MIGRATION_TYPE);

  const logs: ethers.providers.Log[] = await provider.getLogs({
    topics: [topic],
    fromBlock: 0,
  });
  const decodedValues = decodeReturnValues(DSNP_MIGRATION_ABI, logs);
  const filteredResults = filterValues(decodedValues, contractName);

  if (filteredResults.length == 0) throw new MissingContractAddressError(contractName);

  return filteredResults[filteredResults.length - 1].contractAddr;
};

/**
 * Get the JSON RPC error from the body, if one exists
 *
 * @param e - The error expected to have a vm Error
 * @returns the error if any
 */
export const getVmError = (e: VmError): string | undefined => {
  try {
    if (e.body) {
      const parsed = JSON.parse(e.body);
      return parsed?.error?.message;
    }
    if (e.error?.body) {
      const parsed = JSON.parse(e.error.body);
      return parsed?.error?.message;
    }
  } catch (e) {
    return undefined;
  }
  return undefined;
};

/**
 * Parse all transaction logs.
 * This requires that all contracts involved in processing the transaction be included in EVENTS_ABI.
 *
 * @param logs - raw logs from a transaction
 * @returns parsed logs excluding any logs that cannot be parsed by the interface.
 */
export const parseLogs = (logs: Array<RawLog>): Array<ethers.utils.LogDescription> => {
  return logs.map((log) => EVENTS_ABI.parseLog(log)) as Array<ethers.utils.LogDescription>;
};

/**
 * Find event with given name.
 *
 * @throws {@link NoLogsFoundContractError}
 * Thrown if the requested log event could not be found.
 * @param name - name of event to find.
 * @param logs - raw logs from a transaction
 * @returns First event in log that matches name
 */
export const findEvent = (name: string, logs: Array<RawLog>): ethers.utils.LogDescription => {
  const event = parseLogs(logs).find((e) => e.name === name);
  if (event === undefined) {
    throw new NoLogsFoundContractError(name);
  }
  return event;
};
