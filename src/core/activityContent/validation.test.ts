import { ActivityContent } from "./factories";
import { isValid } from "./validation";

describe("activity content validations", () => {
  describe("isValid", () => {
    const validActivityContents: Record<string, ActivityContent> = {
      "a valid link object": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Link",
        published: "2021-07-14T14:09:05+00:00",
        href: "https://spec.dsnp.org",
      },
      "a valid link object with media type": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Link",
        published: "2021-07-14T14:09:05+00:00",
        href: "https://spec.dsnp.org",
        mediaType: "text/html",
      },
      "a valid note object": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Note",
        published: "2021-07-14T14:09:05+00:00",
        content: "Hello world!",
      },
      "a valid note object with media type": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Note",
        published: "2021-07-14T14:09:05+00:00",
        content: "#Hello world!",
        mediaType: "text/markdown",
      },
      "a valid person object": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Person",
        published: "2021-07-14T14:09:05+00:00",
        name: "🌹🚗",
      },
      "a valid audio object": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Audio",
        published: "2021-07-14T14:09:05+00:00",
        url: "https://upload.wikimedia.org/wikipedia/en/0/01/Hound_Dog_%26_intro_%28live-Ed_Sullivan_2%29.ogg",
        mediaType: "audio/ogg",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
      },
      "a valid audio object with link sub-object": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Audio",
        published: "2021-07-14T14:09:05+00:00",
        url: {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Link",
          published: "2021-07-14T14:09:05+00:00",
          href: "https://upload.wikimedia.org/wikipedia/en/0/01/Hound_Dog_%26_intro_%28live-Ed_Sullivan_2%29.ogg",
          mediaType: "audio/ogg",
        },
        mediaType: "audio/ogg",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
      },
      "a valid image object": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Image",
        published: "2021-07-14T14:09:05+00:00",
        url: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Canmania_Car_show_-_Wimborne_%289589569829%29.jpg",
        mediaType: "image/jpg",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
        height: 1564,
        width: 2782,
      },
      "a valid image object with link sub-object": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Image",
        published: "2021-07-14T14:09:05+00:00",
        url: {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Link",
          published: "2021-07-14T14:09:05+00:00",
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
      },
      "a valid profile object": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Profile",
        published: "2021-07-14T14:09:05+00:00",
        describes: {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Person",
          published: "2021-07-14T14:09:05+00:00",
          name: "🌹🚗",
        },
        summary: "I'm a small kitten who does software engineering. See my profile pic.",
        icon: {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Image",
          published: "2021-07-14T14:09:05+00:00",
          url: "https://placekitten.com/64/64",
          mediaType: "image/jpg",
          hash: {
            algorithm: "keccak256",
            value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
          },
          height: 64,
          width: 64,
        },
      },
      "a valid video object": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Video",
        published: "2021-07-14T14:09:05+00:00",
        url: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
        mediaType: "video/webm",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
        height: 2250,
        width: 4000,
      },
      "a valid video object with link sub-object": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Video",
        published: "2021-07-14T14:09:05+00:00",
        url: {
          "@context": "https://www.w3.org/ns/activitystreams",
          type: "Link",
          published: "2021-07-14T14:09:05+00:00",
          href: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
          mediaType: "video/webm",
        },
        mediaType: "video/webm",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
        height: 1564,
        width: 2782,
      },
    };

    for (const key in validActivityContents) {
      it(`returns true for ${key}`, () => {
        expect(isValid(validActivityContents[key])).toEqual(true);
      });
    }

    const invalidActivityContents: Record<string, unknown> = {
      "a link object without a publish timestamp": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Link",
        href: "https://spec.dsnp.org",
        mediaType: "text/html",
      },
      "an audio object without a mediaType": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Audio",
        published: "2021-07-14T14:09:05+00:00",
        url: "https://upload.wikimedia.org/wikipedia/en/0/01/Hound_Dog_%26_intro_%28live-Ed_Sullivan_2%29.ogg",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
      },
      "an audio object without a hash": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Audio",
        published: "2021-07-14T14:09:05+00:00",
        url: "https://upload.wikimedia.org/wikipedia/en/0/01/Hound_Dog_%26_intro_%28live-Ed_Sullivan_2%29.ogg",
        mediaType: "audio/ogg",
      },
      "an image object without a mediaType": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Image",
        published: "2021-07-14T14:09:05+00:00",
        url: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Canmania_Car_show_-_Wimborne_%289589569829%29.jpg",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
        height: 1564,
        width: 2782,
      },
      "an image object without a hash": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Image",
        published: "2021-07-14T14:09:05+00:00",
        url: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Canmania_Car_show_-_Wimborne_%289589569829%29.jpg",
        mediaType: "image/jpg",
        height: 1564,
        width: 2782,
      },
      "an image object without height and width": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Image",
        published: "2021-07-14T14:09:05+00:00",
        url: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Canmania_Car_show_-_Wimborne_%289589569829%29.jpg",
        mediaType: "image/jpg",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
      },
      "a video object without a mediaType": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Video",
        published: "2021-07-14T14:09:05+00:00",
        url: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
        height: 2250,
        width: 4000,
      },
      "a video without height and width": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Video",
        published: "2021-07-14T14:09:05+00:00",
        url: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
        mediaType: "video/webm",
        hash: {
          algorithm: "keccak256",
          value: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        },
      },
      "a video object without a hash": {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Video",
        published: "2021-07-14T14:09:05+00:00",
        url: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm",
        mediaType: "video/webm",
        height: 2250,
        width: 4000,
      },
    };

    for (const key in invalidActivityContents) {
      it(`returns false for ${key}`, () => {
        expect(isValid(invalidActivityContents[key])).toEqual(false);
      });
    }
  });
});
