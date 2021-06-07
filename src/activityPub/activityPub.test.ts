import { create, hash, serialize, validate, ActivityPub } from "./activityPub";

describe("activityPub", () => {
  describe("#create", () => {
    it("returns an activity pub object with the given parameters", () => {
      const activityPub = create({
        attachments: [
          "http://placekitten.com/100/200",
          "http://placekitten.com/300/400",
          "http://placekitten.com/500/600",
        ],
        author: "0x0123456789ABCDEF",
        body: "Look at these cats!",
        title: "Some Cats",
        url: "http://placekitten.com",
        inReplyTo: "0x0123456789ABCDEF",
      });

      expect(activityPub).toMatchObject({
        "@context": "https://www.w3.org/ns/activitystreams",
        attachments: [
          "http://placekitten.com/100/200",
          "http://placekitten.com/300/400",
          "http://placekitten.com/500/600",
        ],
        attributedTo: "0x0123456789ABCDEF",
        content: "Look at these cats!",
        inReplyTo: "0x0123456789ABCDEF",
        name: "Some Cats",
        type: "Note",
        url: "http://placekitten.com",
      });
    });

    it("returns an activity pub object with a valid published timestamp", () => {
      const activityPub = create({
        body: "Look at the time!",
        title: "Time",
      });

      expect(activityPub["published"]).toMatch(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    });
  });

  describe("#validate", () => {
    it("return true for valid activity pub objects with valid published fields", () => {
      const activityPub = {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Note",
        url: "http://placekitten.com",
        published: "2015-02-10T15:04:55Z",
      };

      expect(validate(activityPub)).toBeTruthy();
    });

    it("return true for valid activity pub objects with no published field", () => {
      const activityPub = {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Note",
        url: "http://placekitten.com",
      };

      expect(validate(activityPub)).toBeTruthy();
    });

    it("return false for activity pubs with incorrect published fields", () => {
      const activityPub = {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Note",
        url: "http://placekitten.com",
        published: "Yesterday",
      };

      expect(validate(activityPub)).toBeFalsy();
    });

    it("return false for activity pubs with incorrect contexts fields", () => {
      const activityPub = {
        "@context": "https://www.w3.org/ns/activitystream",
        type: "Note",
        url: "http://placekitten.com",
      };

      expect(validate(activityPub)).toBeFalsy();
    });

    it("return false for activity pubs with missing types", () => {
      const activityPub = {
        "@context": "https://www.w3.org/ns/activitystream",
        url: "http://placekitten.com",
      };

      expect(validate(activityPub as ActivityPub)).toBeFalsy();
    });
  });

  describe("#serialize", () => {
    it("returns a serialized version of the activity pub object", () => {
      const sampleActivityPub = {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Person",
        id: "https://social.example/alyssa/",
        name: "Alyssa P. Hacker",
        preferredUsername: "alyssa",
      };

      expect(serialize(sampleActivityPub)).toEqual(
        '{"@context":"https://www.w3.org/ns/activitystreams","id":"https://social.example/alyssa/","name":"Alyssa P. Hacker","preferredUsername":"alyssa","type":"Person"}'
      );
    });
  });

  describe("#hash", () => {
    it("returns a valid hash for an object", () => {
      const sampleActivityPub = {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Person",
        id: "https://social.example/alyssa/",
        name: "Alyssa P. Hacker",
        preferredUsername: "alyssa",
      };

      expect(hash(sampleActivityPub)).toEqual("2dd6859177d8068ac42cab7eda31da723012951ee38cba65a6880302a6afd91a");
    });

    it("returns the same hash for activityPubs in different orders", () => {
      const sampleActivityPubA = {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Person",
        id: "https://social.example/alyssa/",
        name: "Alyssa P. Hacker",
        preferredUsername: "alyssa",
      };
      const sampleActivityPubB = {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Person",
        name: "Alyssa P. Hacker",
        id: "https://social.example/alyssa/",
        preferredUsername: "alyssa",
      };

      expect(hash(sampleActivityPubA)).toEqual(hash(sampleActivityPubB));
    });

    it("returns the different hashes for activityPubs with different content", () => {
      const sampleActivityPubA = {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Person",
        id: "https://social.example/alyssa/",
        name: "Alyssa P. Hacker",
        preferredUsername: "alyssa",
      };
      const sampleActivityPubB = {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Person",
        id: "https://social.example/alyssa/",
        name: "Alyssa P. Hacker",
        preferredUsername: "hacker",
      };

      expect(hash(sampleActivityPubA)).not.toEqual(hash(sampleActivityPubB));
    });
  });
});
