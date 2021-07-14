# Changelog

## Unreleased
### Changes
- Renamed DSNPId to DSNPAnnouncementId to avoid confusion with DSNPUserId
- Renamed uri -> url everywhere
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
- Updated @dsnp/contracts to 0.0.0-622366
### Added
- sdk.createPublication
### Removed
-
### Fixed
-

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
