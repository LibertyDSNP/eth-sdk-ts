/* eslint @typescript-eslint/no-var-requires: "off" */
require("dotenv").config();
import Web3 from "web3";
import { JsonRpcResponse } from "web3-core-helpers";

let latestSnapshot: string;

export const snapshotHardhat = async (): Promise<void> => {
  const provider = new Web3.providers.HttpProvider(process.env.RPC_URL as string);
  const snapshotResponse: JsonRpcResponse = await new Promise((resolve, reject) =>
    provider.send({ jsonrpc: "2.0", method: "evm_snapshot", id: 1, params: [] }, (err, snapshotResponse) =>
      err ? reject(err) : resolve(snapshotResponse as JsonRpcResponse)
    )
  );

  expect(snapshotResponse.error).toBeUndefined();
  latestSnapshot = snapshotResponse.result as string;
};

export const revertHardhat = async (): Promise<void> => {
  const provider = new Web3.providers.HttpProvider(process.env.RPC_URL as string);
  const revertResponse: JsonRpcResponse = await new Promise((resolve, reject) =>
    provider.send({ jsonrpc: "2.0", method: "evm_revert", id: 1, params: [latestSnapshot] }, (err, revertResponse) =>
      err ? reject(err) : resolve(revertResponse as JsonRpcResponse)
    )
  );

  expect(revertResponse.error).toBeUndefined();
};
