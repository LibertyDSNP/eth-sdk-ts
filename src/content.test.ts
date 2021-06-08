import { keccak256 } from "js-sha3";

import * as config from "../config/config";
import * as content from "./content";
import { DSNPType } from "../messages/messages";
import TestStore from "../test/testStore";
import { MissingStoreError, MissingUser } from "../utilities";

describe("content", () => {
  describe("broadcast", () => {
    describe("with a valid storage adapter and user id", () => {
      let store: TestStore;

      beforeEach(() => {
        store = new TestStore();

        config.setConfig({
          store: store,
          currentUserId: "dsnp://0123456789ABCDEF",
        });
      });

      it("uploads an activity pub object matching the provided specifications", async () => {
        await content.broadcast({
          attributedTo: "John Doe <johndoe@sample.org>",
          content: "Lorem ipsum delor blah blah blah",
          name: "Lorem Ipsum",
        });

        const storeContents = store.getStore();
        const keys = Object.keys(storeContents);
        expect(keys.length).toEqual(1);

        expect(storeContents[keys[0]]).toMatch(
          /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","attributedTo":"John Doe <johndoe@sample\.org>","content":"Lorem ipsum delor blah blah blah","name":"Lorem Ipsum","published":"[0-9TZ\-:.]+","type":"Note"\}/
        );
      });

      it("returns a broadcast DSNP message linking to the activity pub object", async () => {
        const message = await content.broadcast({
          attributedTo: "John Doe <johndoe@sample.org>",
          content: "Lorem ipsum delor blah blah blah",
          name: "Lorem Ipsum",
        });

        const storeContents = store.getStore();
        const keys = Object.keys(storeContents);
        expect(keys.length).toEqual(1);

        expect(message).toMatchObject({
          fromId: "dsnp://0123456789ABCDEF",
          type: DSNPType.Broadcast,
          uri: `http://fakestore.org/${keys[0]}`,
          contentHash: keccak256(storeContents[keys[0]] as string),
        });
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreError", async () => {
        config.setConfig({
          currentUserId: "dsnp://0123456789ABCDEF",
        });

        await expect(
          content.broadcast({
            attributedTo: "John Doe <johndoe@sample.org>",
            content: "Lorem ipsum delor blah blah blah",
            name: "Lorem Ipsum",
          })
        ).rejects.toThrow(MissingStoreError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          store: new TestStore(),
        });

        await expect(
          content.broadcast({
            attributedTo: "John Doe <johndoe@sample.org>",
            content: "Lorem ipsum delor blah blah blah",
            name: "Lorem Ipsum",
          })
        ).rejects.toThrow(MissingUser);
      });
    });
  });

  describe("reply", () => {
    describe("with a valid storage adapter and user id", () => {
      let store: TestStore;

      beforeEach(() => {
        store = new TestStore();

        config.setConfig({
          store: store,
          currentUserId: "dsnp://0123456789ABCDEF",
        });
      });

      it("uploads an activity pub object matching the provided specifications", async () => {
        await content.reply(
          {
            attributedTo: "John Doe <johndoe@sample.org>",
            content: "Lorem ipsum delor blah blah blah",
            name: "Lorem Ipsum",
          },
          "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
        );

        const storeContents = store.getStore();
        const keys = Object.keys(storeContents);
        expect(keys.length).toEqual(1);

        expect(storeContents[keys[0]]).toMatch(
          /\{"@context":"https:\/\/www\.w3\.org\/ns\/activitystreams","attributedTo":"John Doe <johndoe@sample\.org>","content":"Lorem ipsum delor blah blah blah","name":"Lorem Ipsum","published":"[0-9TZ\-:.]+","type":"Note"\}/
        );
      });

      it("returns a broadcast DSNP message linking to the activity pub object", async () => {
        const message = await content.reply(
          {
            attributedTo: "John Doe <johndoe@sample.org>",
            content: "Lorem ipsum delor blah blah blah",
            name: "Lorem Ipsum",
          },
          "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
        );

        const storeContents = store.getStore();
        const keys = Object.keys(storeContents);
        expect(keys.length).toEqual(1);

        expect(message).toMatchObject({
          fromId: "dsnp://0123456789ABCDEF",
          type: DSNPType.Reply,
          uri: `http://fakestore.org/${keys[0]}`,
          contentHash: keccak256(storeContents[keys[0]] as string),
          inReplyTo: "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
        });
      });
    });

    describe("without a storage adapter", () => {
      it("throws MissingStoreError", async () => {
        config.setConfig({
          currentUserId: "dsnp://0123456789ABCDEF",
        });

        await expect(
          content.reply(
            {
              attributedTo: "John Doe <johndoe@sample.org>",
              content: "Lorem ipsum delor blah blah blah",
              name: "Lorem Ipsum",
            },
            "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
          )
        ).rejects.toThrow(MissingStoreError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          store: new TestStore(),
        });

        await expect(
          content.reply(
            {
              attributedTo: "John Doe <johndoe@sample.org>",
              content: "Lorem ipsum delor blah blah blah",
              name: "Lorem Ipsum",
            },
            "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
          )
        ).rejects.toThrow(MissingUser);
      });
    });
  });
});
