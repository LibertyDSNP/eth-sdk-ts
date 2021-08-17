# Changelog

## Unreleased

### Fixed
- Fixed bug where graph change annoucements stored in parquet batch files would drop their `objectId` field.

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
