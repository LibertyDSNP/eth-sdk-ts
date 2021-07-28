# DSNP TypeScript SDK

Easy to use SDK for the DSNP

## Quick Start

### Install the package

First, install the SDK package with the following command:

```bash
npm install @dsnp/sdk
```

### Configure the SDK

The configuration can be set at runtime with the following:

```js
// Node
const { setConfig } = require("@dsnp/sdk");
const { Wallet, providers } = require("ethers");

setConfig({
  signer: new Wallet("key"),
  provider: new providers.JsonRpcProvider("https://...")
});
// Do something with the SDK
```

```typescript
// TypeScript
import { Wallet, providers } from "ethers";
import { setConfig } from "@dsnp/sdk";

setConfig({
  signer: new Wallet("key"),
  provider: new providers.JsonRpcProvider("https://...")
});
// Do something with the SDK
```

#### Storing Activity Content and Batch Files

Storage solutions can be added so as long it matches the [StoreInterface](https://github.com/LibertyDSNP/sdk-ts/blob/main/src/core/store/interface.ts).
```typescript
interface StoreInterface {
  putStream: (targetPath: string, doWriteToStream: WriteStreamCallback) => Promise<URL>;
}
```

Configuration is set like so:
```
config
  .setConfig({
    store: MyStoreModule, // for modules
    store: new MyStore(), // for classes
   });
```

See [Config Documentation](https://libertydsnp.github.io/sdk-ts/interfaces/config_config.config.html) for details on additional options.

#### Example Stores

An example implementations of storage can be found under the [examples folder](https://github.com/LibertyDSNP/sdk-ts/tree/main/examples)

## Usage

Once the SDK is installed and configured, the following code can be used to post a batch on the chain:

```js
// Node
const publisher = require("@dsnp/sdk/core/contracts/publisher");

publisher.publish([{ fileHash, fileUrl, announcementType }]);
```

```typescript
// TypeScript
import publisher from "@dsnp/sdk/core/contracts/publisher";

publisher.publish([{ fileHash, fileUrl, announcementType }]);
```

## Documentation

See [Documentation](https://libertydsnp.github.io/sdk-ts/) or generate documentation locally via `npm run doc`.

## How to Install

Run `npm install @dsnp/sdk`

## How to Build

Run `npm run build`

## How to Compile Documentation

Documentation is deployed on merge to main to GitHub Pages: https://libertydsnp.github.io/sdk-ts/

- Run `npm run doc` for HTML documentation
- Run `npm run doc:json` for JSON documentation
- Run `npm run doc:markdown` for markdown documentation (published with the npm package)

## Environment Variables

| Name                   | Description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| RPC_URL                | url of node to make calls to                                                        |
| TESTING_PRIVATE_KEY    | **Only used in testing** - private key of account you are sending transactions from |

## Testing

### How to Test
1. Check out the [contracts repo](https://github.com/LibertyDSNP/contracts) and follow the instructions to start a hardhat test node and deploy the contracts.
   - Match sure you match the version in ./package.json!
1. In the SDK create a .env file with the following content.
    ```shell
    RPC_URL=http://localhost:8545
    TESTING_PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    ```
1. Replace the value of TESTING_PRIVATE_KEY with the value of `LOCAL_NETWORK_ACCOUNT_PRIVATE_KEY` in the .env from the contracts repo, or use what is in .github/workflows/main.yml. It may be same as above.
1. Ensure that the contracts version you would like to use is the correct version. The version of the `@dsnp/contracts` package is specified in the `package.json`
1. In the contracts repo run: `npm run hardhat -- node`
1. In the contracts repo run: `npm run deploy:localhost`
1. In the sdk repo run: `npm run test`

### Test Writing Utilities

- test/hardhatRPC
  - `setupSnapshot`: Call this to use evm snapshots before each test to make sure the blockchain state is clean
  - `snapshotHardhat`/`revertHardhat`: Make other snapshots, but remember to revert them for other tests
- test/sdkTestConfig
  - `setupConfig`: An easy way to setup the default config for the sdk for testing.
    - Often can be as simple as `beforeAll(setupConfig);`
    - Returns an object with the provider and signer if those are needed.
- test/matchers
  - Helpful common Jest Matchers like `expect("0x0").toMatch(EthAddressRegex)`
- test/customMatchers
  - Custom Loaded Jest expect matchers like `expect(tx).transactionRejectsWith("message")`
- test/generators
  - Test Data Generators and fixtures


### Testnet
We are currently running 2 POA nodes for our Testnet
Tesnet Authority nodes are:

- node0.testnet.dsnp.org
- node1.testnet.dsnp.org

#### Contracts are located at the following addresses:

Migrations contract: 0xe7a6467113c2B7f09Aad3b99C30811718A114013
Publisher contract: 0xdBA8e92706e48bbFDe1A8496710d4e85d3388E71
Identity contract: 0xB708186004dAC4019417fa8deF9E8F49a55103b1
Registry contract: 0xDcc457296d9790C52B6746cD45AFaaD18b7FfEfa
IdentityCloneFactory factory: 0x31C3fDb70078FD1d64D51ecA713bCdb2f4212E74
Beacon contract: 0x233FfDa2cEd4579B07bbc5e95bDe7f540A2DFd5a
Beacon Factory: 0x26b21a1E90b86c779D9a1d31cD09F5cd8C7c8f1d

Contract source code is located [here](https://github.com/LibertyDSNP/contracts)
