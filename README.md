# DSNP TypeScript SDK

Easy to use SDK for the DSNP

## Quick Start

### Install the package

First, install the SDK package with the following command:

```bash
npm install @dsnp/sdk
```

### Configure the SDK

#### Configuration File

Next, add a `dsnp.config.js` file to your project's root directory. For web3, the following contents will work:

```js
var Web3 = require("web3");
var web3 = new Web3();

var provider = new Web3.providers.HttpProvider("<ETH NODE HTTP ADDRESS>");
web3.setProvider(provider);

var account = web3.eth.accounts.privateKeyToAccount("<ETH PRIVATE KEY>");
web3.eth.accounts.wallet.add(account);

module.exports = {
  accountAddress: account.address,
  provider: web3
};
```

#### Runtime Configuration

Alternatively, the configuration can be set at runtime with the following:

```js
var config = require("@dsnp/sdk/Config");

config
  .setConfig({
    accountAddress: "<ACCOUNT ADDRESS HERE>",
    provider: web3
  })
  .then(function () {
    // Do something with the SDK
  });
```

## Usage

Once the SDK is installed and configured, the following code can be used to post a batch on the chain:

```js
var announcement = require("@dsnp/sdk/Announcement");

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

## How to Test
1. Check out the [contracts repo](https://github.com/LibertyDSNP/contracts) and follow the instructions to start a hardhat test node and deploy the contracts.
1. In the SDK create a .env file with the following content.
    ```shell
    RPC_URL=http://localhost:8545
    TESTING_PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    ```
1.  Replace the value of TESTING_PRIVATE_KEY with the value of `LOCAL_NETWORK_ACCOUNT_PRIVATE_KEY` in the .env from the contracts repo, or use what is in .github/workflows/main.yml. It may be same as above. 
1. Ensure that the contracts version you would like to use is the correct version. The version of the `@dsnp/contracts` package is specified in the `package.json` 
1. Run `npm run test`
