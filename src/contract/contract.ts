//eslint-disable-next-line
require("dotenv").config();
import Web3 from "web3";
import { keccak256 } from "js-sha3";
// import { AbiItem } from "web3-utils";
// import { Log } from "web3-core";

const keccakTopic = (topic: string) => "0x" + keccak256(topic);

// export const decodeReturnValues = (web3Instance: Web3, inputs: AbiItem[], topic: string) => (log: Log) => {
//   return web3Instance.eth.abi.decodeLog(inputs, log.data, [topic]);
// };

export const retrieveLastMigrationEvent = async () => {
  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL as string));
  // const DSNPMibrationABI: AbiItem[] = [
  //   {
  //     "indexed": false,
  //     "internalType": "uint256",
  //     "name": "lastCompleted",
  //     "type": "uint256"
  //   },
  //   {
  //     "indexed": false,
  //     "internalType": "address",
  //     "name": "contractAddr",
  //     "type": "address"
  //   },
  //   {
  //     "indexed": false,
  //     "internalType": "string",
  //     "name": "contractName",
  //     "type": "string"
  //   },
  //   {
  //     "indexed": false,
  //     "internalType": "string",
  //     "name": "abi",
  //     "type": "string"
  //   }
  // ];
  const topic = keccakTopic("DSNPMigration(uint256,address,string,string)");

  const logs = await web3.eth.getPastLogs({topics: [topic]});
  console.log("logs", logs);
};
