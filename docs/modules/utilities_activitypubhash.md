[@LibertyDSNP/sdk](../README.md) / [Exports](../modules.md) / utilities/activityPubHash

# Module: utilities/activityPubHash

## Table of contents

### Functions

- [activityPubHash](utilities_activitypubhash.md#activitypubhash)

## Functions

### activityPubHash

▸ `Const`**activityPubHash**(`data`: *Record*<string, unknown\>): *string*

activityPubHash() provides a simple way to hash activityPub objects while
guaranteeing that identical objects with different key orders still return
the same hash. The underlying hash method used is
[Keccak256](https://en.wikipedia.org/wiki/SHA-3).

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`data` | *Record*<string, unknown\> | The activityPub object to hashes   |

**Returns:** *string*

A hexadecimal string containing the Keccak hash
