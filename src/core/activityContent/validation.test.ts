import { ActivityContentNote, ActivityContentProfile } from "./factories";
import {
  isActivityContentNote,
  isActivityContentProfile,
  isValidActivityContentNote,
  isValidActivityContentProfile,
} from "./validation";

describe("activity content validations", () => {
  describe("isActivityContentNote", () => {
    const activityContentNotes: Record<string, ActivityContentNote> = {
      "a note with no attachements": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Note",
        content: "Hello world!",
        mediaType: "text/plain",
      },
      "a note with an audio attachement": {
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
      "a note with an image attachement": {
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
      "a note with an video attachement": {
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
      "a note with an link attachement": {
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
    };

    for (const key in activityContentNotes) {
      it(`returns true for ${key}`, () => {
        expect(isActivityContentNote(activityContentNotes[key])).toEqual(true);
      });
    }

    const notActivityContentNotes: Record<string, unknown> = {
      "a note missing a mediaType": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Note",
        content: "Hello world!",
      },
      "a note with an audio attachement missing a hash": {
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
      "a note with an audio attachement missing a hash value": {
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
      "a note with an image attachement missing a mediaType": {
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
      "a note with an video attachement with a non-array URL field": {
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
      "a note with an link attachement with a no type": {
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
    };

    for (const key in notActivityContentNotes) {
      it(`returns false for ${key}`, () => {
        expect(isActivityContentNote(notActivityContentNotes[key])).toEqual(false);
      });
    }
  });

  describe("isActivityContentProfile", () => {
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
        expect(isActivityContentProfile(activityContentProfiles[key])).toEqual(true);
      });
    }

    const notActivityContentProfiles: Record<string, unknown> = {
      "a profile object without type": {
        "@context": "https://www.w3.org/ns/activitystreams",
        name: "🌹🚗",
      },
      "a profile object with icon without a hash": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Profile",
        name: "dril",
        icon: [
          {
            type: "Link",
            href: "https://pbs.twimg.com/profile_images/847818629840228354/VXyQHfn0_400x400.jpg",
          },
        ],
      },
    };

    for (const key in notActivityContentProfiles) {
      it(`returns false for ${key}`, () => {
        expect(isActivityContentProfile(notActivityContentProfiles[key])).toEqual(false);
      });
    }
  });

  describe("isValidActivityContentNote", () => {
    const validActivityContentNotes: Record<string, ActivityContentNote> = {
      "a note with no attachements": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Note",
        content: "Hello world!",
        mediaType: "text/plain",
      },
      "a note with an audio attachement": {
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
      "a note with an image attachement": {
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
      "a note with an video attachement": {
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
      "a note with an link attachement": {
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
    };

    for (const key in validActivityContentNotes) {
      it(`returns true for ${key}`, () => {
        expect(isValidActivityContentNote(validActivityContentNotes[key])).toEqual(true);
      });
    }

    const invalidActivityContentNotes: Record<string, unknown> = {
      "a note with a bad published field": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Note",
        content: "Hello world!",
        mediaType: "text/plain",
        published: "Yesterday",
      },
      "a note with an audio attachement with an invalid hash": {
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
      "a note with an image attachement without a keccak256 hash": {
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
                href: "ftp://upload.wikimedia.org/wikipedia/commons/a/ae/Mccourt.jpg",
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
      "a note with an video attachement without a supported mediaType": {
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
      "a note with an link attachement with an invalid protocol": {
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
    };

    for (const key in invalidActivityContentNotes) {
      it(`returns false for ${key}`, () => {
        expect(isValidActivityContentNote(invalidActivityContentNotes[key])).toEqual(false);
      });
    }
  });

  describe("isValidActivityContentProfile", () => {
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
        expect(isValidActivityContentProfile(validActivityContentProfiles[key])).toEqual(true);
      });
    }

    const invalidActivityContentProfiles: Record<string, unknown> = {
      "a profile object with an invalid published timestamp": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Profile",
        name: "jaboukie",
        published: "07/28/2021",
      },
      "a profile object with an icon with an invalid hash": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Profile",
        name: "dril",
        icon: [
          {
            type: "Link",
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
      "a profile object with an icon without a keccak256 hash": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Profile",
        name: "dril",
        icon: [
          {
            type: "Link",
            href: "https://pbs.twimg.com/profile_images/847818629840228354/VXyQHfn0_400x400.jpg",
            hash: [
              {
                algorithm: "MD5",
                value: "0x0",
              },
            ],
          },
        ],
      },
    };

    for (const key in invalidActivityContentProfiles) {
      it(`returns false for ${key}`, () => {
        expect(isValidActivityContentProfile(invalidActivityContentProfiles[key])).toEqual(false);
      });
    }
  });
});
