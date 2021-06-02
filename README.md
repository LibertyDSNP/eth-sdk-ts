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
var config = require("@dsnp/sdk/config");

config.setConfig({
    signer: signer,
    provider: provider
  })
// Do something with the SDK
```

#### Storing Messages and Batches

Amazon S3 is supported when adding the following configuration:
```
import { S3Node } from "./storage/s3Node";

config
  .setConfig({
    ...,
    store: S3Node({
      key: "tomyheartisno",
      secret: "itsa",
      bucket: "ofchicken",
      region: "us-east-la",
    })
  });
```
Other storage solutions can be added so as long it contains the following interface.
```
interface StorageInterface {
  put: (targetPath: string, content: Content) => Promise<URL>;
  get?: (targetPath: string) => Promise<string>;
}
```

```
config
  .setConfig({
    storage: new MyStorage()
   });
```

See [Config Documentation](https://libertydsnp.github.io/sdk-ts/interfaces/config_config.config.html) for details on additional options.

## Usage

Once the SDK is installed and configured, the following code can be used to post a batch on the chain:

```js
var announcement = require("@dsnp/sdk/contracts/announcement");

announcement.batch([{ hash, uri, dsnpType }]);
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
| BATCH_CONTRACT_ADDRESS | Address of contract on chain you are calling to                                     |
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
1.  Replace the value of TESTING_PRIVATE_KEY with the value of `LOCAL_NETWORK_ACCOUNT_PRIVATE_KEY` in the .env from the contracts repo, or use what is in .github/workflows/main.yml. It may be same as above. 
1. Ensure that the contracts version you would like to use is the correct version. The version of the `@dsnp/contracts` package is specified in the `package.json` 
1. Run `npm run test`

### Test Writing Utilities

- test/hardhatRPC
  - `snapshotSetup`: Call this to use evm snapshots before each test to make sure the blockchain state is clean
  - `snapshotHardhat`/`revertHardhat`: Make other snapshots, but remember to revert them for other tests
- test/sdkTestConfig
  - `setupConfig`: An easy way to setup the default config for the sdk for testing.
    - Often can be as simple as `beforeAll(setupConfig);`
    - Returns an object with the provider and signer if those are needed.
- test/matchers
  - Helpful common Jest Matchers
- test/generators
  - Test Data Generators and fixtures
