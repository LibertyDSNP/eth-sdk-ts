# DSNP TypeScript SDK

Easy to use SDK for the DSNP

## Documentation

See [Documentation](https://libertydsnp.github.io/sdk-ts/) or generate documentation locally via `npm run doc`.

## How to Install

Run `npm install @LibertyDSNP/sdk`

## How to Build

Run `npm run build`

## How to Compile Documentation

Documentation is deployed on merge to main to GitHub Pages: https://libertydsnp.github.io/sdk-ts/

- Run `npm run doc` for HTML documentation
- Run `npm run doc:json` for JSON documentation
- Run `npm run doc:markdown` for markdown documentation (published with the npm package)

## Environment Variables

| Name  | Description |
| --- | ------- | 
| RPC_URL | url of node to make calls to | 
| BATCH_CONTRACT_ADDRESS | Address of contract on chain you are calling to | 
| TESTING_PRIVATE_KEY| **Only used in testing** - private key of account you are sending transactions from  | 

## How to Test

Run `npm run test`
