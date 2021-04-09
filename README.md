# DSNP TypeScript SDK

Easy to use SDK for the DSNP

## Documentation

See [Documentation](docs/README.md) or generate html documentation via `npm run doc`.

## How to Install

Run `npm install @LibertyDSNP/sdk`

## How to Build

Run `npm run build`

## How to Compile Documentation

- Run `npm run doc` for HTML documentation
- Run `npm run doc:json` for JSON documentation
- Run `npm run doc:markdown` for markdown documentation intended to be committed with the update

## Environment Variables

| Name  | Description |
| --- | ------- | 
| RPC_URL | url of node to make calls to | 
| BATCH_CONTRACT_ADDRESS | Address of contract on chain you are calling to | 
| TESTING_PRIVATE_KEY| **Only used in testing** - private key of account you are sending transactions from  | 

## How to Test

Run `npm run test`
