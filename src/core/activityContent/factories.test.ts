import {
  createNote,
  createProfile,
  createAudioAttachment,
  createAudioLink,
  createImageAttachment,
  createImageLink,
  createVideoAttachment,
  createVideoLink,
  createLinkAttachment,
  createLocation,
  createHashtag,
  createMention,
  createHash,
} from "./factories";

describe("activityPub", () => {
  describe("createNote", () => {
    it("returns an ActivityContentNote with the given parameters", () => {
      const activityContentNote = createNote("Hello World!");

      expect(activityContentNote).toMatchObject({
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Note",
        content: "Hello World!",
        mediaType: "text/plain",
      });
    });
  });

  describe("createProfile", () => {
    it("returns an ActivityContentProfile with the given parameters", () => {
      const activityContentProfile = createProfile({ name: "🌹🚗" });

      expect(activityContentProfile).toMatchObject({
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Profile",
        name: "🌹🚗",
      });
    });
  });

  describe("createAudioAttachment", () => {
    it("returns an ActivityContentAudio with the given parameters", () => {
      const activityContentAudio = createAudioAttachment([
        {
          type: "Link",
          href: "https://upload.wikimedia.org/wikipedia/en/0/01/Hound_Dog_%26_intro_%28live-Ed_Sullivan_2%29.ogg",
          mediaType: "audio/ogg",
          hash: [
            {
              algorithm: "keccak256",
              value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
            },
          ],
        },
      ]);

      expect(activityContentAudio).toMatchObject({
        type: "Audio",
        url: [
          {
            type: "Link",
            href: "https://upload.wikimedia.org/wikipedia/en/0/01/Hound_Dog_%26_intro_%28live-Ed_Sullivan_2%29.ogg",
            mediaType: "audio/ogg",
            hash: [
              {
                algorithm: "keccak256",
                value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
              },
            ],
          },
        ],
      });
    });
  });

  describe("createAudioLink", () => {
    it("returns an ActivityContentAudioLink with the given parameters", () => {
      const activityContentAudioLink = createAudioLink(
        "https://upload.wikimedia.org/wikipedia/en/0/01/Hound_Dog_%26_intro_%28live-Ed_Sullivan_2%29.ogg",
        "audio/ogg",
        [
          {
            algorithm: "keccak256",
            value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
          },
        ]
      );

      expect(activityContentAudioLink).toMatchObject({
        type: "Link",
        href: "https://upload.wikimedia.org/wikipedia/en/0/01/Hound_Dog_%26_intro_%28live-Ed_Sullivan_2%29.ogg",
        mediaType: "audio/ogg",
        hash: [
          {
            algorithm: "keccak256",
            value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
          },
        ],
      });
    });
  });

  describe("createImageAttachment", () => {
    it("returns an ActivityContentImage with the given parameters", () => {
      const activityContentImage = createImageAttachment([
        {
          type: "Link",
          href: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Canmania_Car_show_-_Wimborne_%289589569829%29.jpg",
          mediaType: "image/jpg",
          hash: [
            {
              algorithm: "keccak256",
              value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
            },
          ],
          height: 1564,
          width: 2782,
        },
      ]);

      expect(activityContentImage).toMatchObject({
        type: "Image",
        url: [
          {
            type: "Link",
            href: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Canmania_Car_show_-_Wimborne_%289589569829%29.jpg",
            mediaType: "image/jpg",
            hash: [
              {
                algorithm: "keccak256",
                value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
              },
            ],
            height: 1564,
            width: 2782,
          },
        ],
      });
    });
  });

  describe("createImageLink", () => {
    it("returns an ActivityContentImageLink with the given parameters", () => {
      const activityContentImageLink = createImageLink(
        "https://upload.wikimedia.org/wikipedia/commons/b/bb/Canmania_Car_show_-_Wimborne_%289589569829%29.jpg",
        "image/jpg",
        [
          {
            algorithm: "keccak256",
            value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
          },
        ]
      );

      expect(activityContentImageLink).toMatchObject({
        type: "Link",
        href: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Canmania_Car_show_-_Wimborne_%289589569829%29.jpg",
        mediaType: "image/jpg",
        hash: [
          {
            algorithm: "keccak256",
            value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
          },
        ],
      });
    });
  });

  describe("createLinkAttachment", () => {
    it("returns an ActivityContentLink with the given parameters", () => {
      const activityContentLink = createLinkAttachment("https://dsnp.org");

      expect(activityContentLink).toMatchObject({
        type: "Link",
        href: "https://dsnp.org",
      });
    });
  });

  describe("createVideoAttachment", () => {
    it("returns an ActivityContentVideo with the given parameters", () => {
      const activityContentVideo = createVideoAttachment([
        {
          type: "Link",
          href: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
          mediaType: "video/webm",
          hash: [
            {
              algorithm: "keccak256",
              value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
            },
          ],
          height: 2250,
          width: 4000,
        },
      ]);

      expect(activityContentVideo).toMatchObject({
        type: "Video",
        url: [
          {
            type: "Link",
            href: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
            mediaType: "video/webm",
            hash: [
              {
                algorithm: "keccak256",
                value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
              },
            ],
            height: 2250,
            width: 4000,
          },
        ],
      });
    });
  });

  describe("createVideoLink", () => {
    it("returns an ActivityContentVideoLink with the given parameters", () => {
      const activityContentVideoLink = createVideoLink(
        "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
        "video/webm",
        [
          {
            algorithm: "keccak256",
            value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
          },
        ]
      );

      expect(activityContentVideoLink).toMatchObject({
        type: "Link",
        href: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
        mediaType: "video/webm",
        hash: [
          {
            algorithm: "keccak256",
            value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
          },
        ],
      });
    });
  });

  describe("createLocation", () => {
    it("returns an ActivityContentLocation with the given parameters", () => {
      const activityContentLocation = createLocation({
        name: "Earth",
      });

      expect(activityContentLocation).toMatchObject({
        type: "Place",
        name: "Earth",
      });
    });
  });

  describe("createHashtag", () => {
    it("returns an ActivityContentHashtag with the given parameters", () => {
      const activityContentTag = createHashtag("YOLO");

      expect(activityContentTag).toMatchObject({
        name: "YOLO",
      });
    });
  });

  describe("createMention", () => {
    it("returns an ActivityContentMention with the given parameters", () => {
      const activityContentMention = createMention("dsnp://1234");

      expect(activityContentMention).toMatchObject({
        type: "Mention",
        id: "dsnp://1234",
      });
    });
  });

  describe("createHash", () => {
    it("returns an ActivityContentHash with the given parameters", () => {
      const activityContentHash = createHash("Lorem ipsum");

      expect(activityContentHash).toMatchObject({
        algorithm: "keccak256",
        value: "0x4a63a2902ad43de8c568bb4a8acbe12e95e8fbfb3babf985ea871e9fccf2dadb",
      });
    });
  });
});
