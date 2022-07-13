# Changelog

## Unreleased
- Updated placeholder values left in LICENSE
- Changed accepted MIME types of `audio/mp3` to `audio/mpeg` and removed `image/jpg`
- Add an AsyncPublicationsIterator, an AsyncIterator which lazily fetches Publication log events from chain and returns them one at a time based on its initial constructor parameters.
- Updated `tmpl` devDependency to 1.0.5
- BREAKING: Changed createRegistration to now longer return a user URI and instead returns a Registration Object.
- Changed `convertToDSNPUserId` function to throw correct errors
- Updated building to Node 16
- BREAKING: Replaced activity content folder with standalone activity content
  NPM module. All previous modules that references the activity content folder
  now wrap the activity content NPM package
  (generators/activityContentGenerators, content).
- BREAKING: Replaced `isDSNPAnnouncementURI` with `isDSNPContentURI` (DIP-148)
- BREAKING: Replaced Type Name `DSNPAnnouncementURI` with `DSNPContentURI` (DIP-148)
- BREAKING: Replaced `buildDSNPAnnouncementURI` with `buildDSNPContentURI` (DIP-148)
- BREAKING: Replaced `parseDSNPAnnouncementURI` with `parseDSNPContentURI` (DIP-148)
- BREAKING: Replaced `InvalidAnnouncementUriError` with `InvalidContentUriError` (DIP-148)
- Updated `@dsnp/parquetjs` dependency to 1.2.1

## [3.0.3] - 2021-09-15
### Added
- `dsnpStartBlockNumber` to config to allow setConfig to default a different value than `0` for `fromBlock`
- Support "dsnp-start-block" for subscriptions to start from the `dsnpStartBlockNumber`
- Readme configs for Rinkeby and Ropsten
- `getDSNPRegistryUpdateEvents` defaults to dsnp-start-block

### Changed
- Removed esmodule build. All imports will fallback to esmodule compatible commonjs modules
- Better cleaner build (removed multimodule script need, dist package directory, and better package.json)

### Removed
- Internal package `dist` structure. If you were previously importing out of `@dsnp/sdk/dist`, that will need to be updated to the correct export.

## [3.0.2] - 2021-09-02
### Added
- Code documentation and additional test on subscribeToEvent

### Fixed
- subscribeToEvent zero value for fromBlock param fetches logs starting at zero
- batch.openURL to coerce URL to string before passing to ParquetJS
- Fixed flaky tests around registry

## [3.0.1] - 2021-08-27
### Added
- sdk.core.batch.readFile will now await `doReadRow`

## [3.0.0] - 2021-08-25
### Changed
- BREAKING: Changed batch.readFile() to pass parsed announcements instead of parquet records to callback
- BREAKING: Changed createdAt on announcements to BigInt instead of number
- Changed isSignatureAuthorizedTo to work with SignedAnnouncements
- Changed isSignatureAuthorizedTo to throw InvalidAnnouncementParameterError when passed an invalid object as announcement
- Changed AnnouncementWithSignature to take an AnnouncementType instead of a TypedAnnouncement
- Changed to use bigint for types instead of BigInt
- Changed content.react() to throw InvalidEmojiStringError when passed an invalid emoji string
- Changed content.tombstone() to throw InvalidTombstoneAnnouncementTypeError or InvalidTombstoneAnnouncementSignatureError depending on which aspect of the provided target is invalid instead of simply throwing InvalidTombstoneAnnouncementTypeError for both
- Exported announcement.isValidEmoji() for testing emoji strings
- Exported announcement.isValidSignature() for testing signature strings
- Removed statistics from parquet files for signature and hash fields
- BREAKING: Update to Spec v0.10.0
- BREAKING: Use BigInt for DSNPUserId
- BREAKING: Store byte data in parquet as bytes
- BREAKING: Parquet Schema changes
- BREAKING: Use Spec v0.10.0 serialization for signatures

### Added
- Added announcement.isTombstoneableType() for testing if a given announcement type can be tombstoned
- sdk.convertToDSNPUserURI for taking most any value and converting it to the DSNP User URI format
- sdk.convertToDSNPUserId for taking most any value and converting it to the DSNP User Id format

### Fixed
- Changed isValidAnnouncement to return false for all announcements missing a createdAt big int
- Updated content.react() to throw InvalidAnnouncementUriError as specified in its documentation
- Updated Mentions so they require a DSNP User URI [per spec](https://spec.dsnp.org/ActivityContent/Associated/Tag#mention) instead of an Id
- batch.openFile and batch.openUrl had an extra promise wrapping

### Removed
- sdk.core.activityContent.serialize: Serialization of activityContent is just JSON.stringify
- sdk.core.utilities.sortObject: Unused method
- sdk.convertBigNumberToDSNPUserId: Not supporting BigNumber anymore
- sdk.convertDSNPUserIdOrURIToBigNumber: Not supporting BigNumber anymore
- sdk.convertBigNumberToDSNPUserURI: Not supporting BigNumber anymore
- Removed sdk.convertDSNPUserURIToDSNPUserId: Just use convertToDSNPUserId and convertToDSNPUserURI

## [2.1.2] - 2021-08-20
### fixed
- added `transactionIndex` and `logIndex` to batch and registry subscriptions

## [2.1.1] - 2021-08-17
### Changed
- Updated dependencies

### Fixed
- Fixed bug where graph change announcements stored in parquet batch files would drop their `objectId` field.
- Updated parquet schema to match announcement spec

## [2.1.0] - 2021-08-16
### Added
- sdk.core.identifiers.convertDSNPUserIdOrURIToBigNumber supports non-0x prefixed strings
- sdk.core.utilities.serializeToHex for predictable hexadecimal to string values
- Added createTombstone factory to announcements module
- Added isTombstoneAnnouncement validator to announcements module
- Added tombstone porcelain method to top level exports

### Changed
- Major rework of ActivityContent validations to log or throw informative errors when an ActivityContent is invalid, with a couple of other changes:
  - An array of locations is no longer allowed; this will invalidate an attachment.
  - Attachments MUST pass a minimal type check before further processing. For example if even one of its Link url hashes is _malformed_, it fails validation.
  - If an attachment passes a type check, but it fails to meet requirements for what is supported by DSNP, it also fails validation. HOWEVER, attachments can have multiple Link URLs; only one needs to be supported by DSNP to be considered a valid attachment. See code documentation for details.
  - If there is more than one attachment, but at least one is valid, it's considered a valid ActivityContent.
  - New exported function for retrieving an array of valid attachments for an ActivityContent: `requireGetSupportedContentAttachments`  Please see code documentation for details.
  - Note on naming convention: anything beginning with 'require' will throw when failing the indicated action or validation. For example `requireGetSupportedContentAttachments` throws an error if there are attachments but none are valid.
  - If you wish to simply check for type validity without having to catch errors, use `isActivityContentNoteType` and `isActivityContentProfileType`
- Fixed a bug in duration validation.
- Reworked ActivityContent validations to log or throw informative errors when an ActivityContent is invalid.

### Fixed
- Fixed bug resulting in incorrect output from sdk.core.contracts.publisher.dsnpBatchFilter when passed Tombstone
- Fixed a bug in duration validation.
- Fixed a bug in DURATION_REGEX.
- Fix bug in `getRegistrationsByWalletAddress` by normalizing address to checksum version
- Fixed some flaky tests by setting timezone on createdAt test announcements

## [2.0.2] - 2021-08-11
### Added
- Ability to filter registry update events based on start and end block
- Exported sdk.core.identifiers
- Ability to subscribe to DSNPRegistryUpdate events

### Changes
- Renamed BatchPublicationCallbackArgs -> BatchPublicationLogData
- Updated subscribeToBatchPublications to not need a signer
- sdk.core.contracts.publisher.dsnpBatchFilter is no longer async
- Updated Ethers from 5.3.0 -> 5.4.4

## [2.0.1] - 2021-08-04
### Changes
- Updated registry.resolveRegistration to support not found cases for nodes that do not return a failure reason.
- Updated the Activity Content Published field validation regex to support fractional seconds
- Updated @dsnp/contracts to v1.0.1
- Updated minor dependencies

### Fixed
- no longer using destructuring for methods that result in a `store.putStream` call.
- sdk.createRegistration was incorrectly returning a DSNP User Id instead of a DSNP User URI

## [2.0.0] - 2021-08-02
### Changes
- Updated npm dependencies
- Updated activityContent module to match spec
- Updated announcement types to include createdAt type
- Updated announcement factories to include optional createdAt param
- Updated various types to specify DSNP ids instead of string
- Updated various types to specify HexString instead of string
- Updated all instances of keccak256 to use hash utilities instead
- Added hash() and getHashGenerator() utility functions
- Moved "requireGet" config methods back into the SDK core
- Removed put method from the store interface in favor of putStream everywhere
- Updated activityContent generators to match new types
- Updated content porcelain to accept proper activityContent objects and validate them
- Renamed activityPub -> activityContent
- Renamed DSNPId to DSNPAnnouncementURI to avoid confusion with DSNPUserId
- Renamed uri -> url everywhere it was referring to a url only
- Renamed sdk.subscribeToBatchAnnounceEvents -> sdk.subscribeToBatchPublications
- Renamed sdk.core.contracts.announcer -> sdk.core.contracts.publisher
- Renamed sdk.core.contracts.announcer.batch -> sdk.core.contracts.publisher.publish
- Renamed sdk.core.messages -> sdk.core.announcement
- Renamed sdk.core.messages.createBroadcastMessage -> sdk.core.announcement.createBroadcast
- Renamed sdk.core.messages.createReplyMessage -> sdk.core.announcement.createReply
- Renamed sdk.core.messages.createReactionMessage -> sdk.core.announcement.createReaction
- Renamed sdk.core.messages.createGraphChangeMessage -> sdk.core.announcement.createGraphChange
- Renamed sdk.core.messages.createProfileMessage -> sdk.core.announcement.createProfile
- Renamed sdk.core.contracts.registry.isMessageSignatureAuthorizedTo -> sdk.core.contracts.registry.isSignatureAuthorizedTo
- Renamed sdk.core.identifiers.validateDSNPMessageId -> sdk.core.identifiers.validateDSNPAnnouncementId
- Updated @dsnp/contracts to 1.0.0
- Updated Publication interface: dsnpType -> announcementType, dsnpUrl -> fileUrl, dsnpHash -> fileHash
- Renamed DSNPType -> AnnouncementType
- Updated Parquet Schema
- Rename InvalidAnnouncementIdentifierError -> InvalidAnnouncementUriError
- Rename type DSNPAnnouncementId -> DSNPAnnouncementURI
- Rename sdk.core.identifiers.isDSNPAnnouncementId -> sdk.core.identifiers.isDSNPAnnouncementURI
- Rename sdk.core.identifiers.buildDSNPAnnouncementId -> sdk.core.identifiers.buildDSNPAnnouncementURI
- DSNP User Id return no longer contain the dsnp:// prefix
### Added
- sdk.createPublication
- Ability to remove delegate
- Ability to get DSNPAddDelegate logs
- Ability to get DSNPRemoveDelegate logs
- createdAt field to GraphChange announcement type, plus update to parquet schema.
- Ability to get all identities associated to an address
- sdk.core.identifiers.parseDSNPAnnouncementURI
- Added type check and validation functions to activityContent module
- Added type check and validation functions to announcements module
- Added hash() and getHashGenerator() utility functions
- Ability to get Registrations associated to identity address
- Ability to lookup registrations by wallet address
### Removed

### Fixed
- Updated GraphChange enum values to match spec
- Fix length check bug in `subscribeToBatchPublications`


## [1.0.0] - 2021-06-22
### Changes
- Lots of updates and cleanups
- Removed `requireGetConfig`: Use specific getters
- Moved S3Node into examples
### Added
- Reading and writing a batch file
- Creating Announcement Messages
- subscribeToBatchAnnounceEvents for getting batch announce events
### Fixed
- Exported Generators
### Removed
- aws client-s3 dependency

## [0.1.0] - 2021-06-09
### Added
- Many things in place, but still several things may give NotImplementedYet errors.
- There are two primary sections: "index" which is has all the exports that are at the top level and often due multiple things and "core" which are more functional and direct in nature
- The Config interface should be relatively stable (although additions are possible)
- Uses @dsnp/contracts v0.1.0
- Contract writing code is complete

### Deprecated
- Node.JS Only


## [0.0.1] - 2021-03-15
### Added
- Initial release
- Core structure
- Announce contract integration
- NPM package publishing
- Documentation generation
