import { ActivityContentAttachment, ActivityContentNote, ActivityContentProfile } from "./factories";
import {
  requireActivityContentNoteType,
  requireIsActivityContentProfileType,
  requireValidActivityContentNote,
  requireValidActivityContentProfile,
  requireGetSupportedContentAttachments,
} from "./validation";

describe("activity content validations", () => {
  describe("requireGetSupportedContentAttachments", () => {
    describe("when there is one valid attachment", () => {
      const testCases: Record<string, Array<ActivityContentAttachment>> = {
        "Image attachment with multiple urls and only one is valid": [
          {
            type: "Image",
            url: [
              {
                type: "Link",
                href: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
                mediaType: "image/jpg",
                hash: [
                  {
                    algorithm: "keccak256",
                    value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                  },
                ],
              },
              {
                type: "Link",
                href: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
                mediaType: "image/foo",
                hash: [
                  {
                    algorithm: "keccak256",
                    value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                  },
                ],
              },
            ],
          },
        ],
        "Video attachment with multiple urls but only one has a valid hash algorithm": [
          {
            type: "Video",
            name: "My video",
            duration: "00:00:47",
            url: [
              {
                type: "Link",
                href: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
                mediaType: "video/webm",
                hash: [
                  {
                    algorithm: "keccak256",
                    value: "0xf841950dfcedc968dbd63132da844b9f28faea3dbfd4cf326b3831b419a20e9a",
                  },
                  {
                    algorithm: "secp256k1",
                    value: "0xf841950dfcedc968dbd63132da844b9f28faea3dbfd4cf326b3831b419a29999",
                  },
                ],
              },
            ],
          },
        ],
        "with a link attachment": [
          {
            type: "Link",
            href: "https://dsnp.org",
          },
        ],
        "with an audio attachment": [
          {
            type: "Audio",
            url: [
              {
                type: "Link",
                href: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Wilhelm_Scream.ogg",
                mediaType: "audio/ogg",
                hash: [
                  {
                    algorithm: "keccak256",
                    value: "0x3b33df3d163e86514e9041ac97e3d920a75bbafa8d9c1489e631897874b762cc",
                  },
                ],
              },
            ],
          },
        ],
      };
      for (const tc in testCases) {
        it(`returns the attachment ${tc}`, () => {
          expect(requireGetSupportedContentAttachments(testCases[tc])).toEqual(testCases[tc]);
        });
      }
    });
    describe("when there is one invalid attachment", () => {
      [
        {
          name: "an audio attachment with a bad duration value",
          expErr: "ActivityContentAudio duration is invalid",
          attachment: [
            {
              name: "I have a name",
              duration: "53 minutes",
              type: "Audio",
              url: [
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Wilhelm_Scream.ogg",
                  mediaType: "audio/ogg",
                  hash: [
                    {
                      algorithm: "keccak256",
                      value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "an image attachment with a bad name value",
          expErr: "ActivityContentImage name is not a string",
          attachment: [
            {
              type: "Image",
              name: 1234,
              url: [
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
                  mediaType: "image/jpg",
                  hash: [
                    {
                      algorithm: "keccak256",
                      value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "a video attachment with an unsupported mediaType",
          expErr: "ActivityContentVideo has no supported media types",
          attachment: [
            {
              type: "Video",
              url: [
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
                  mediaType: "video/avi",
                  hash: [
                    {
                      algorithm: "keccak256",
                      value: "0xf841950dfcedc968dbd63132da844b9f28faea3dbfd4cf326b3831b419a20e9a",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "a link attachment with an invalid protocol",
          expErr: "ActivityContentLink href is invalid",
          attachment: [
            {
              type: "Link",
              href: "ftp://dsnp.org",
            },
          ],
        },
        {
          name: "audio attachment with an unsupported algorithm",
          expErr: "ActivityContent hash algorithms must contain at least one of: keccak256",
          attachment: [
            {
              type: "Audio",
              url: [
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Wilhelm_Scream.ogg",
                  mediaType: "audio/ogg",
                  hash: [
                    {
                      algorithm: "secp256k1",
                      value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "audio attachment with undefined hash",
          expErr: "ActivityContentAudioLink hash is invalid",
          attachment: [
            {
              type: "Audio",
              url: [
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Wilhelm_Scream.ogg",
                  mediaType: "audio/ogg",
                },
              ],
            },
          ],
        },
        {
          name: "a link attachment with no type",
          expErr: "ActivityContentAttachment type is invalid",
          attachment: [
            {
              href: "https://dsnp.org",
            },
          ],
        },
      ].forEach((testCase) => {
        it(`${testCase.name} throws error`, () => {
          expect(() => requireGetSupportedContentAttachments(testCase.attachment)).toThrowError(testCase.expErr);
        });
      });
    });
    describe("when there are multiple attachments", () => {
      it("with a single invalid attachment url, throws expected error", () => {
        const missingMediaType = [
          {
            type: "Image",
            url: [
              {
                type: "Link",
                href: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
                hash: [
                  {
                    algorithm: "keccak256",
                    value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                  },
                ],
              },
            ],
          },
        ];
        expect(() => requireGetSupportedContentAttachments(missingMediaType)).toThrowError(
          "DSNPError: Invalid ActivityContent: ActivityContentImageLink mediaType is not a string"
        );
      });

      it("with one attachment that has multiple urls where only one is valid, returns the attachment", () => {
        const multipleUrls = [
          {
            type: "Image",
            url: [
              {
                type: "Link",
                href: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
                mediaType: "image/bar",
                hash: [
                  {
                    algorithm: "keccak256",
                    value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                  },
                ],
              },
              {
                type: "Link",
                href: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
                mediaType: "image/foo",
                hash: [
                  {
                    algorithm: "keccak256",
                    value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                  },
                ],
              },
              {
                type: "Link",
                href: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
                mediaType: "image/jpg",
                hash: [
                  {
                    algorithm: "keccak256",
                    value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                  },
                ],
              },
            ],
          },
        ];
        expect(requireGetSupportedContentAttachments(multipleUrls)).toHaveLength(1);
      });

      it("with multiple attachments but only one is usable/valid, returns the valid one", () => {
        const validAttachment = {
          type: "Image",
          url: [
            {
              type: "Link",
              href: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
              mediaType: "image/jpg",
              hash: [
                {
                  algorithm: "keccak256",
                  value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                },
              ],
            },
          ],
        };
        const invalidAttachment = {
          type: "Image",
          url: [
            {
              type: "Link",
              href: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
              hash: [
                {
                  algorithm: "keccak256",
                  value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                },
              ],
            },
          ],
        };

        expect(requireGetSupportedContentAttachments([validAttachment, invalidAttachment])).toHaveLength(1);
      });

      it("with multiple link attachments and one is invalid, returns the valid one", () => {
        const validAttachment = {
          type: "Link",
          href: "https://dsnp.org",
        };
        const invalidAttachment = {
          type: "Link",
          href: "ftp://dsnp.org",
        };
        expect(requireGetSupportedContentAttachments([validAttachment, invalidAttachment])).toHaveLength(1);
      });
      it("with multiple attachments of different types", () => {
        const validImageAttachment = {
          type: "Image",
          url: [
            {
              type: "Link",
              href: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
              mediaType: "image/jpg",
              hash: [
                {
                  algorithm: "keccak256",
                  value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                },
              ],
            },
          ],
        };
        const validLinkAttachment = {
          type: "Link",
          href: "https://dsnp.org",
        };
        const validVideoAttachment = {
          type: "Video",
          url: [
            {
              type: "Link",
              href: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
              mediaType: "video/webm",
              hash: [
                {
                  algorithm: "keccak256",
                  value: "0xf841950dfcedc968dbd63132da844b9f28faea3dbfd4cf326b3831b419a20e9a",
                },
                {
                  algorithm: "secp256k1",
                  value: "0xf841950dfcedc968dbd63132da844b9f28faea3dbfd4cf326b3831b419a29999",
                },
              ],
            },
          ],
        };

        expect(
          requireGetSupportedContentAttachments([validLinkAttachment, validImageAttachment, validVideoAttachment])
        ).toHaveLength(3);
      });
    });
  });
  describe("requireActivityContentNoteType", () => {
    describe("when a Note's types are valid", () => {
      const activityContentNotes: Record<string, ActivityContentNote> = {
        "with no attachments": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Hello world!",
          mediaType: "text/plain",
        },
        "with a hashtag": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Hello world!",
          mediaType: "text/plain",
          tag: [{ name: "happiness" }, { name: "feels" }, { name: "kawaii" }],
        },
        "with a mention": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Hello world!",
          mediaType: "text/plain",
          tag: [
            { type: "Mention", id: "0x1001", name: "Spoopy" },
            { type: "Mention", id: "0x1002", name: "Snoopy" },
          ],
        },
        "with an audio attachment": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Feel like I've heard this before!",
          mediaType: "text/plain",
          attachment: [
            {
              type: "Audio",
              url: [
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Wilhelm_Scream.ogg",
                  mediaType: "audio/ogg",
                  hash: [
                    {
                      algorithm: "keccak256",
                      value: "0x3b33df3d163e86514e9041ac97e3d920a75bbafa8d9c1489e631897874b762cc",
                    },
                  ],
                },
              ],
            },
          ],
        },
        "with an image attachment": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Interesting guy!",
          mediaType: "text/plain",
          attachment: [
            {
              type: "Image",
              url: [
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
                  mediaType: "image/jpg",
                  hash: [
                    {
                      algorithm: "keccak256",
                      value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                    },
                  ],
                },
              ],
            },
          ],
        },
        "with a video attachment": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "What an adventure!",
          mediaType: "text/plain",
          attachment: [
            {
              type: "Video",
              url: [
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
                  mediaType: "video/webm",
                  hash: [
                    {
                      algorithm: "keccak256",
                      value: "0xf841950dfcedc968dbd63132da844b9f28faea3dbfd4cf326b3831b419a20e9a",
                    },
                  ],
                },
              ],
            },
          ],
        },
        "with a video attachment that has one supported media type and one not": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "What an adventure!",
          mediaType: "text/plain",
          attachment: [
            {
              type: "Video",
              url: [
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
                  mediaType: "video/webm",
                  hash: [
                    {
                      algorithm: "keccak256",
                      value: "0xf841950dfcedc968dbd63132da844b9f28faea3dbfd4cf326b3831b419a20e9a",
                    },
                  ],
                },
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/c/c0/AWindowsMediaVideo.wmv",
                  mediaType: "video/wmv",
                  hash: [
                    {
                      algorithm: "keccak256",
                      value: "0xf841950dfcedc968dbd63132da844b9f28faea3dbfd4cf326b3831b419a99999",
                    },
                  ],
                },
              ],
            },
          ],
        },
        "with a link attachment": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Interesting project!",
          mediaType: "text/plain",
          attachment: [
            {
              type: "Link",
              href: "https://dsnp.org",
            },
          ],
        },
        "with a location": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Hello world!",
          mediaType: "text/plain",
          location: {
            type: "Place",
            name: "Topkapi Palace, Istanbul, Turkey",
            accuracy: 10,
            altitude: 51,
            latitude: 41.0115195,
            longitude: 28.9811849,
            radius: 100,
            units: "m",
          },
        },
      };

      for (const key in activityContentNotes) {
        it(`returns true for ${key}`, () => {
          expect(() => requireActivityContentNoteType(activityContentNotes[key])).not.toThrow();
        });
      }
    });
    describe("when a Note fails type checks because of", () => {
      [
        {
          name: "a missing mediaType",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Note",
            content: "Hello world!",
          },
          expErr: "invalid ActivityContentNote mediaType",
        },
        {
          name: "an invalid location type",
          expErr: "ActivityContentNote location is not a record type",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Note",
            content: "Hello world!",
            mediaType: "text/plain",
            location: "My house",
          },
        },
      ].forEach((testCase) => {
        it(`${testCase.name} throws correct error`, () => {
          expect(() => requireActivityContentNoteType(testCase.testObject)).toThrowError(
            "Invalid ActivityContent: " + testCase.expErr
          );
        });
      });
    });
  });

  describe("requireIsActivityContentProfile", () => {
    describe("when the profile is valid", () => {
      const activityContentProfiles: Record<string, ActivityContentProfile> = {
        "a profile object": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Profile",
          name: "🌹🚗",
        },
        "a profile object with a published timestamp": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Profile",
          name: "jaboukie",
          published: "2000-01-01T00:00:00.000+00:00",
        },
        "a profile object with icon": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Profile",
          name: "dril",
          icon: [
            {
              type: "Link",
              href: "https://pbs.twimg.com/profile_images/847818629840228354/VXyQHfn0_400x400.jpg",
              mediaType: "image/jpg",
              hash: [
                {
                  algorithm: "keccak256",
                  value: "0x00a63eb58f6ce7fccd93e2d004fed81da5ec1a9747b63f5f1bf80742026efea7",
                },
              ],
            },
          ],
        },
      };

      for (const key in activityContentProfiles) {
        it(`returns true for ${key}`, () => {
          expect(requireIsActivityContentProfileType(activityContentProfiles[key])).toEqual(true);
        });
      }
    });
    describe("when the profile is invalid", () => {
      [
        {
          name: "when the name is invalid",
          expErr: "ActivityContentProfile name is not a string",
          testObject: {
            name: 1234,
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            content: "Feel like I've heard this before!",
          },
        },
        {
          name: "when the context is invalid",
          expErr: "invalid ActivityContentProfile @context",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreamzzz",
            type: "Profile",
            content: "Me",
          },
        },
        {
          name: "icon has invalid hash value",
          expErr: "ActivityContentHash value field is not a string",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            content: "Feel like I've heard this before!",
            icon: [
              {
                type: "Link",
                href: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Wilhelm_Scream.jpg",
                mediaType: "image/jpg",
                hash: [
                  {
                    algorithm: "keccak256",
                  },
                ],
              },
            ],
          },
        },
        {
          name: "icon is missing a mediaType",
          expErr: "ActivityContentImageLink mediaType is not a string",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            content: "Interesting guy!",
            icon: [
              {
                type: "Link",
                href: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Wilhelm_Scream.jpg",
                hash: [
                  {
                    algorithm: "keccak256",
                  },
                ],
              },
            ],
          },
        },
        {
          name: "a profile undefined type field",
          expErr: "invalid ActivityContentProfile type",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            name: "🌹🚗",
          },
        },
        {
          name: "a profile with a bad type field",
          expErr: "invalid ActivityContentProfile type",
          testObject: {
            type: "Profil",
            "@context": "https://www.w3.org/ns/activitystreams",
            name: "🌹🚗",
          },
        },
        {
          name: "a profile with bad summary",
          expErr: "ActivityContentProfile summary is not a string",
          testObject: {
            type: "Profile",
            "@context": "https://www.w3.org/ns/activitystreams",
            name: "🌹🚗",
            summary: 12345,
          },
        },
        {
          name: "a profile with icon without a hash",
          expErr: "ActivityContentImageLink hash is invalid",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            name: "dril",
            icon: [
              {
                type: "Link",
                mediaType: "image/jpg",
                href: "https://pbs.twimg.com/profile_images/847818629840228354/VXyQHfn0_400x400.jpg",
              },
            ],
          },
        },
        {
          name: "a profile with bad icon",
          expErr: "ActivityContentProfile icon is invalid",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            name: "dril",
            icon: "http://placekitten.com/700/400",
          },
        },
      ].forEach((testCase) => {
        it(`throws error for ${testCase.name}`, () => {
          expect(() => requireIsActivityContentProfileType(testCase.testObject)).toThrowError(
            "DSNPError: Invalid ActivityContent: " + testCase.expErr
          );
        });
      });
    });
  });
  describe("requireValidActivityContentNote", () => {
    describe("when the Note is valid", () => {
      const validActivityContentNotes: Record<string, ActivityContentNote> = {
        "a note with no attachments": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Hello world!",
          mediaType: "text/plain",
        },
        "a note with an audio attachment": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Feel like I've heard this before!",
          mediaType: "text/plain",
          attachment: [
            {
              type: "Audio",
              url: [
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Wilhelm_Scream.ogg",
                  mediaType: "audio/ogg",
                  hash: [
                    {
                      algorithm: "keccak256",
                      value: "0x3b33df3d163e86514e9041ac97e3d920a75bbafa8d9c1489e631897874b762cc",
                    },
                  ],
                },
              ],
            },
          ],
        },
        "a note with an image attachment": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Interesting guy!",
          mediaType: "text/plain",
          attachment: [
            {
              type: "Image",
              url: [
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
                  mediaType: "image/jpg",
                  hash: [
                    {
                      algorithm: "keccak256",
                      value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                    },
                  ],
                },
              ],
            },
          ],
        },
        "a note with a video attachment": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "What an adventure!",
          mediaType: "text/plain",
          attachment: [
            {
              type: "Video",
              url: [
                {
                  type: "Link",
                  href: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
                  mediaType: "video/webm",
                  hash: [
                    {
                      algorithm: "keccak256",
                      value: "0xf841950dfcedc968dbd63132da844b9f28faea3dbfd4cf326b3831b419a20e9a",
                    },
                  ],
                },
              ],
            },
          ],
        },
        "a note with a link attachment": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Interesting project!",
          mediaType: "text/plain",
          attachment: [
            {
              type: "Link",
              href: "https://dsnp.org",
            },
          ],
        },
        "a note with multiple attachments": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Interesting project!",
          mediaType: "text/plain",
          attachment: [
            {
              type: "Link",
              href: "https://dsnp.org",
            },
            {
              type: "Link",
              href: "https://placekitten.com",
            },
            {
              type: "Link",
              href: "https://examplecompany.com",
            },
          ],
        },
        "a note with a location": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Interesting project!",
          mediaType: "text/plain",
          location: { type: "Place", name: "Valjevo, Serbia" },
        },
      };

      for (const key in validActivityContentNotes) {
        it(`Does not throw for a ${key}`, () => {
          expect(() => requireValidActivityContentNote(validActivityContentNotes[key])).not.toThrow();
        });
      }
    });

    describe("when the Note is invalid", () => {
      [
        {
          name: "a note with a bad published 'value' field",
          expErr: "ActivityContentNote published is invalid",
          note: {
            published: "Yesterday",
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Note",
            content: "Hello world!",
            mediaType: "text/plain",
            hash: [
              {
                algorithm: "keccak256",
                value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
              },
            ],
          },
        },
        {
          name: "with a location that is not a record",
          expErr: "ActivityContentNote location is not a record type",
          note: {
            location: "bad",
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Note",
            content: "Interesting project!",
            mediaType: "text/plain",
          },
        },
        {
          name: "with a location object that is not a valid Location Type",
          expErr: "ActivityContentLocation type is not 'Place'",
          note: {
            location: {
              type: "bad",
              name: "This is fine",
            },
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Note",
            content: "Interesting project!",
            mediaType: "text/plain",
          },
        },
      ].forEach((testCase) => {
        it(`throws an error for ${testCase.name}`, () => {
          expect(() => requireValidActivityContentNote(testCase.note)).toThrowError(
            "DSNPError: Invalid ActivityContent: " + testCase.expErr
          );
        });
      });
    });
  });
  describe("requireValidActivityContentProfile", () => {
    describe("when profile is valid", () => {
      const validActivityContentProfiles: Record<string, ActivityContentProfile> = {
        "a profile object": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Profile",
          name: "🌹🚗",
        },
        "a profile object with a published timestamp": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Profile",
          name: "jaboukie",
          published: "2000-01-01T00:00:00+00:00",
        },
        "a profile object with a location": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Profile",
          name: "jaboukie",
          location: {
            type: "Place",
            name: "My house",
            accuracy: 1,
            altitude: 1,
            latitude: 1,
            longitude: 1,
            radius: 1,
            units: "string",
          },
        },
        "a profile object with icon": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Profile",
          name: "dril",
          icon: [
            {
              type: "Link",
              href: "https://pbs.twimg.com/profile_images/847818629840228354/VXyQHfn0_400x400.jpg",
              mediaType: "image/jpg",
              hash: [
                {
                  algorithm: "keccak256",
                  value: "0x00a63eb58f6ce7fccd93e2d004fed81da5ec1a9747b63f5f1bf80742026efea7",
                },
              ],
            },
          ],
        },
      };
      for (const key in validActivityContentProfiles) {
        it(`returns true for ${key}`, () => {
          expect(() => requireValidActivityContentProfile(validActivityContentProfiles[key])).not.toThrow();
        });
      }
    });

    describe("when profile is invalid", () => {
      [
        {
          name: "when location has the wrong type",
          expErr: "ActivityContentLocation type is not 'Place'",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            content: "Me",
            location: {
              type: "bad",
              name: "This is fine",
            },
          },
        },
        {
          name: "when a single tag is invalid",
          expErr: "ActivityContentHashtag name is not a string",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            content: "Me",
            tag: { hashtag: "spoopy" },
          },
        },
        {
          name: "when a mention tag is invalid",
          expErr: "ActivityContentMention id is not a valid DSNPUserId",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            content: "Me",
            tag: [{ type: "Mention", id: 1234, name: "spoopy" }],
          },
        },
        {
          name: "with an invalid published timestamp",
          expErr: "ActivityContentProfile published is invalid",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            name: "jaboukie",
            published: "07/28/2021",
          },
        },
        {
          name: "with an icon with an invalid hash",
          expErr: "ActivityContentHash value is invalid",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            name: "dril",
            icon: [
              {
                type: "Link",
                mediaType: "image/jpg",
                href: "https://pbs.twimg.com/profile_images/847818629840228354/VXyQHfn0_400x400.jpg",
                hash: [
                  {
                    algorithm: "keccak256",
                    value: "0x0",
                  },
                ],
              },
            ],
          },
        },
        {
          name: "with an icon with an unsupported hash algorithm",
          expErr: "ActivityContent hash algorithms must contain at least one of: keccak256",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            name: "dril",
            icon: [
              {
                type: "Link",
                mediaType: "image/jpg",
                href: "https://pbs.twimg.com/profile_images/847818629840228354/VXyQHfn0_400x400.jpg",
                hash: [
                  {
                    algorithm: "MD5",
                    value: "0x00a63eb58f6ce7fccd93e2d004fed81da5ec1a9747b63f5f1bf80742026efea7",
                  },
                ],
              },
            ],
          },
        },
        {
          name: "with an icon with an unsupported protocol link",
          expErr: "ActivityContentLink href is invalid",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            name: "dril",
            icon: [
              {
                type: "Link",
                mediaType: "image/jpg",
                href: "ftp://pbs.twimg.com/profile_images/847818629840228354/VXyQHfn0_400x400.jpg",
                hash: [
                  {
                    algorithm: "keccak256",
                    value: "0x00a63eb58f6ce7fccd93e2d004fed81da5ec1a9747b63f5f1bf80742026efea7",
                  },
                ],
              },
            ],
          },
        },
        {
          name: "with a location missing a type",
          expErr: "ActivityContentLocation type is not 'Place'",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            name: "jaboukie",
            location: { name: "My house", units: "m" },
          },
        },
        {
          name: "with a location with bad numbers",
          expErr: "ActivityContentLocation latitude is not a number",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            name: "jaboukie",
            location: { type: "Place", name: "My house", latitude: "string" },
          },
        },
      ].forEach((testCase) => {
        it(`throws error for ${testCase.name}`, () => {
          expect(() => requireValidActivityContentProfile(testCase.testObject)).toThrowError(
            "DSNPError: Invalid ActivityContent: " + testCase.expErr
          );
        });
      });
    });
  });
});
