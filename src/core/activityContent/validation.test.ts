import { ActivityContentNote, ActivityContentProfile } from "./factories";
import {
  requireActivityContentNoteType,
  requireIsActivityContentProfile,
  requireValidActivityContentNote,
  requireValidActivityContentProfile,
} from "./validation";

describe("activity content validations", () => {
  describe("isActivityContentNote", () => {
    describe("when a Note's types are valid", () => {
      const activityContentNotes: Record<string, ActivityContentNote> = {
        "with no attachments": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Hello world!",
          mediaType: "text/plain",
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
        "with a single location": {
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
          expect(requireActivityContentNoteType(activityContentNotes[key])).toEqual(true);
        });
      }
    });
    describe("when a note fails type checks because of", () => {
      [
        {
          testName: "a missing mediaType",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Note",
            content: "Hello world!",
          },
          expErr: "invalid ActivityContentNote mediaType",
        },
        {
          testName: "audio attachment with undefined hash",
          expErr: "ActivityContentAudioLink hash is invalid",
          testObject: {
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
                  },
                ],
              },
            ],
          },
        },
        {
          testName: "audio attachment with hash value that is invalid",
          expErr: "ActivityContentHash value field is not a string",
          testObject: {
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
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          testName: "audio attachment with an unsupported algorithm",
          expErr: "ActivityContentHash has unsupported algorithm",
          testObject: {
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
                        algorithm: "secp256k1",
                        value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          testName: "audio attachment with a malformed hash",
          expErr: "ActivityContentHash value is invalid",
          testObject: {
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
                        value: "bad",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          testName: "image attachment missing a mediaType",
          expErr: "ActivityContentImageLink mediaType is not a string",
          testObject: {
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
        },
        {
          testName: "video attachment with a non-array URL field",
          expErr: "invalid ActivityContentVideoLink",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Note",
            content: "What an adventure!",
            mediaType: "text/plain",
            attachment: [
              {
                type: "Video",
                url: {
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
              },
            ],
          },
        },
        {
          testName: "a link attachment with no type",
          expErr: "unknown activity content type: undefined",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Note",
            content: "Interesting project!",
            mediaType: "text/plain",
            attachment: [
              {
                href: "https://dsnp.org",
              },
            ],
          },
        },
        {
          testName: "an invalid location type",
          expErr: "ActivityContentLocation is not a record",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Note",
            content: "Hello world!",
            mediaType: "text/plain",
            location: "My house",
          },
        },
      ].forEach((testCase) => {
        it(`${testCase.testName} throws correct error`, () => {
          expect(() => requireActivityContentNoteType(testCase.testObject)).toThrowError(
            "Invalid ActivityContent: " + testCase.expErr
          );
        });
      });
    });
  });

  describe("isActivityContentProfile", () => {
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
          expect(requireIsActivityContentProfile(activityContentProfiles[key])).toEqual(true);
        });
      }
    });
    describe("when the profile is invalid", () => {
      [
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
        it(`returns false for ${testCase.name}`, () => {
          expect(() => requireIsActivityContentProfile(testCase.testObject)).toThrowError(
            "DSNPError: Invalid ActivityContent: " + testCase.expErr
          );
        });
      });
    });
  });
  describe("isValidActivityContentNote", () => {
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
        "a note with an video attachment": {
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
        "a note with an link attachment": {
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
        "a note with a location": {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Note",
          content: "Interesting project!",
          mediaType: "text/plain",
          location: { type: "Place", name: "Valjevo, Serbia" },
        },
      };

      for (const key in validActivityContentNotes) {
        it(`Returns true for ${key}`, () => {
          expect(() => requireValidActivityContentNote(validActivityContentNotes[key])).toBeTruthy();
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
          name: "a note with an audio attachment with an invalid hash",
          expErr: "ActivityContentHash value is invalid",

          note: {
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
                        value: "0x3b33df3d",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          name: "a note with an image attachment with an unsupported hash algorithm",
          expErr: "ActivityContentHash has unsupported algorithm",
          note: {
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
                        algorithm: "MD5",
                        value: "0x90b3b09658ec527d679c2de983b5720f6e12670724f7e227e5c360a3510b4cb5",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          name: "a note with an video attachment with an unsupported mediaType",
          expErr: "ActivityContentVideo url mediaType is unsupported",
          note: {
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
        },
        {
          name: "a note with a link attachment with an invalid protocol",
          expErr: "ActivityContentLink href protocol must be one of: http:, https:",
          note: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Note",
            content: "Interesting project!",
            mediaType: "text/plain",
            attachment: [
              {
                type: "Link",
                href: "ftp://dsnp.org",
              },
            ],
          },
        },
        {
          name: "with a location that is not a record",
          expErr: "ActivityContentLocation is not a record",
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
  describe("isValidActivityContentProfile", () => {
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
          name: "a profile object with an invalid published timestamp",
          expErr: "ActivityContentProfile published is invalid",
          testObject: {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Profile",
            name: "jaboukie",
            published: "07/28/2021",
          },
        },
        {
          name: "a profile object with an icon with an invalid hash",
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
          name: "a profile object with an icon with an unsupported hash algorithm",
          expErr: "ActivityContentHash has unsupported algorithm",
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
      ].forEach((testCase) => {
        it(`returns false for ${testCase.name}`, () => {
          expect(() => requireValidActivityContentProfile(testCase.testObject)).toThrowError(
            "DSNPError: Invalid ActivityContent: " + testCase.expErr
          );
        });
      });
    });
  });
});
