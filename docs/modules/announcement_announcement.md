[@LibertyDSNP/sdk](../README.md) / [Exports](../modules.md) / announcement/announcement

# Module: announcement/announcement

## Table of contents

### Functions

- [batch](announcement_announcement.md#batch)
- [getContract](announcement_announcement.md#getcontract)

## Functions

### batch

▸ `Const`**batch**(`provider`: *any*, `account`: *any*, `uri`: *string*, `hash`: *string*): *Promise*<any\>

batch() allows users call the batch smart contract and post the URI and hash
of a generated batch to the blockchain.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`provider` | *any* | The web3 instance used for calling the smart contract   |
`account` | *any* | The account from which to post the batch   |
`uri` | *string* | The URI of the hosted batch to post   |
`hash` | *string* | A hash of the batch contents for use in verification   |

**Returns:** *Promise*<any\>

A [web3 contract receipt promise](https://web3js.readthedocs.io/en/v1.3.4/web3-eth-contract.html#id36)

___

### getContract

▸ `Const`**getContract**(`web3Instance`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`web3Instance` | *any* |

**Returns:** *any*
