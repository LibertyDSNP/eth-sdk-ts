# DSNP TypeScript SDK

Easy to use SDK for the DSNP

## Quick Start

### Install the package

First, install the SDK package with the following command:

```bash
npm install @unfinishedlabs/sdk
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
var config = require("@unfinishedlabs/sdk/Config");

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
var announcement = require("@unfinishedlabs/sdk/Announcement");

announcement.batch("<URI of batch file>", "<Hash of batch file>");
```

## Documentation

See [Documentation](https://libertydsnp.github.io/sdk-ts/) or generate documentation locally via `npm run doc`.

## How to Install

Run `npm install @unfinishedlabs/sdk`

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

Run `npm run test`
