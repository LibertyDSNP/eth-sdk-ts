[@LibertyDSNP/sdk](../README.md) / [Exports](../modules.md) / announcement/announcement

# Module: announcement/announcement

## Table of contents

### Functions

- [batch](announcement_announcement.md#batch)
- [getContract](announcement_announcement.md#getcontract)

## Functions

### batch

▸ `Const`**batch**(`provider`: _Web3_, `accountAddress`: _string_, `uri`: _string_, `hash`: _string_): _Promise_<any\>

batch() allows users call the batch smart contract and post the URI and hash
of a generated batch to the blockchain.

#### Parameters:

| Name       | Type     | Description                                           |
| :--------- | :------- | :---------------------------------------------------- |
| `provider` | _any_    | The web3 instance used for calling the smart contract |
| `account`  | _any_    | The account from which to post the batch              |
| `uri`      | _string_ | The URI of the hosted batch to post                   |
| `hash`     | _string_ | A hash of the batch contents for use in verification  |

**Returns:** _Promise_<any\>

A [web3 contract receipt promise](https://web3js.readthedocs.io/en/v1.3.4/web3-eth-contract.html#id36)
