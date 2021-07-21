import {
  createLink,
  createNote,
  createPerson,
  createAudio,
  createImage,
  createProfile,
  createVideo,
} from "./factories";

describe("activityPub", () => {
  describe("createLink", () => {
    it("returns an activity content link with the given parameters", () => {
      const activityContentLink = createLink("http://placekitten.com", { mediaType: "text/html" });

      expect(activityContentLink).toMatchObject({
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Link",
        href: "http://placekitten.com",
        mediaType: "text/html",
      });
      expect(activityContentLink["published"]).toMatch(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    });
  });

  describe("createNote", () => {
    it("returns an activity content note with the given parameters", () => {
      const activityContentNote = createNote("Hello World!", { mediaType: "text/plain" });

      expect(activityContentNote).toMatchObject({
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Note",
        content: "Hello World!",
        mediaType: "text/plain",
      });
      expect(activityContentNote["published"]).toMatch(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    });
  });

  describe("createPerson", () => {
    it("returns an activity content person with the given parameters", () => {
      const activityContentPerson = createPerson("🌹🚗");

      expect(activityContentPerson).toMatchObject({
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Person",
        name: "🌹🚗",
      });
      expect(activityContentPerson["published"]).toMatch(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    });
  });

  describe("createAudio", () => {
    it("returns an activity content audio with the given parameters", () => {
      const activityContentAudio = createAudio(
        "https://upload.wikimedia.org/wikipedia/en/0/01/Hound_Dog_%26_intro_%28live-Ed_Sullivan_2%29.ogg",
        "audio/ogg",
        {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        }
      );

      expect(activityContentAudio).toMatchObject({
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Audio",
        url: {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Link",
          href: "https://upload.wikimedia.org/wikipedia/en/0/01/Hound_Dog_%26_intro_%28live-Ed_Sullivan_2%29.ogg",
          mediaType: "audio/ogg",
        },
        mediaType: "audio/ogg",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
      });
      expect(activityContentAudio["published"]).toMatch(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    });
  });

  describe("createImage", () => {
    it("returns an activity content image with the given parameters", () => {
      const activityContentImage = createImage(
        "https://upload.wikimedia.org/wikipedia/commons/b/bb/Canmania_Car_show_-_Wimborne_%289589569829%29.jpg",
        "image/jpg",
        {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
        1564,
        2782
      );

      expect(activityContentImage).toMatchObject({
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Image",
        url: {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Link",
          href: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Canmania_Car_show_-_Wimborne_%289589569829%29.jpg",
          mediaType: "image/jpg",
        },
        mediaType: "image/jpg",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
        height: 1564,
        width: 2782,
      });
      expect(activityContentImage["published"]).toMatch(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    });
  });

  describe("createProfile", () => {
    it("returns an activity content profile with the given parameters", () => {
      const activityContentProfile = createProfile("🌹🚗");

      expect(activityContentProfile).toMatchObject({
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Profile",
        describes: {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Person",
          name: "🌹🚗",
        },
      });
      expect(activityContentProfile["published"]).toMatch(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    });
  });

  describe("createVideo", () => {
    it("returns an activity content video with the given parameters", () => {
      const activityContentVideo = createVideo(
        "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
        "video/webm",
        {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
        2250,
        4000
      );

      expect(activityContentVideo).toMatchObject({
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Video",
        url: {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Link",
          href: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
          mediaType: "video/webm",
        },
        mediaType: "video/webm",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
        height: 2250,
        width: 4000,
      });
      expect(activityContentVideo["published"]).toMatch(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    });
  });
});
