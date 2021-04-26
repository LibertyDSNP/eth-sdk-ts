/* eslint @typescript-eslint/no-var-requires: "off" */
require("dotenv").config();
import Web3 from "web3";

let latestSnapshot: string;

export const snapshotHardhat = async () => {
  const provider = new Web3.providers.HttpProvider(process.env.RPC_URL as string);
  const snapshotResponse: any = await new Promise((resolve, reject) =>
    provider.send({ jsonrpc: "2.0", method: "evm_snapshot", id: 1, params: [] }, (err, snapshotResponse) =>
      err ? reject(err) : resolve(snapshotResponse)
    )
  );

  expect(snapshotResponse.error).toBeUndefined();
  latestSnapshot = snapshotResponse.result as string;
};

export const revertHardhat = async () => {
  const provider = new Web3.providers.HttpProvider(process.env.RPC_URL as string);
  const revertResponse: any = await new Promise((resolve, reject) =>
    provider.send({ jsonrpc: "2.0", method: "evm_revert", id: 1, params: [latestSnapshot] }, (err, revertResponse) =>
      err ? reject(err) : resolve(revertResponse)
    )
  );

  expect(revertResponse.error).toBeUndefined();
};
