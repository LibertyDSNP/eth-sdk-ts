# Changelog

## Unreleased
### Changes
- Updated activityContent module to match new spec, again
- Fix length check bug in `subscribeToBatchPublications`
- Updated announcement types to include createdAt type
- Updated announcement factories to include optional createdAt param
- Updated various types to specify DSNP ids instead of string
- Updated various types to specify HexString instead of string
- Updated all instances of keccak256 to use hash utilities instead
- Added hash() and getHashGenerator() utility functions
- Moved "requireGet" config methods back into the SDK core
- Removed put method from the store interface in favor of putStream everywhere
- Updated activityContent types to match spec
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
### Removed
-
### Fixed
- Updated GraphChange enum values to match spec

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
