import { hash } from "./activityPub";

describe("#activityPubHash", () => {
  it("returns a valid hash for an object", () => {
    const sampleActivityPub = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Person",
      id: "https://social.example/alyssa/",
      name: "Alyssa P. Hacker",
      preferredUsername: "alyssa",
      summary: "Lisp enthusiast hailing from MIT",
      inbox: "https://social.example/alyssa/inbox/",
      outbox: "https://social.example/alyssa/outbox/",
      followers: "https://social.example/alyssa/followers/",
      following: "https://social.example/alyssa/following/",
      liked: "https://social.example/alyssa/liked/",
    };

    expect(hash(sampleActivityPub)).toEqual("f828f3aa5d76779dc49efa69556ba89d0789cdd26ffe5d79be85da05c0afa842");
  });

  it("returns the same hash for activityPubs in different orders", () => {
    const sampleActivityPubA = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Person",
      id: "https://social.example/alyssa/",
      name: "Alyssa P. Hacker",
      preferredUsername: "alyssa",
      summary: "Lisp enthusiast hailing from MIT",
      inbox: "https://social.example/alyssa/inbox/",
      outbox: "https://social.example/alyssa/outbox/",
      followers: "https://social.example/alyssa/followers/",
      following: "https://social.example/alyssa/following/",
      liked: "https://social.example/alyssa/liked/",
    };
    const sampleActivityPubB = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Person",
      name: "Alyssa P. Hacker",
      id: "https://social.example/alyssa/",
      preferredUsername: "alyssa",
      liked: "https://social.example/alyssa/liked/",
      summary: "Lisp enthusiast hailing from MIT",
      inbox: "https://social.example/alyssa/inbox/",
      outbox: "https://social.example/alyssa/outbox/",
      following: "https://social.example/alyssa/following/",
      followers: "https://social.example/alyssa/followers/",
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
      summary: "Lisp enthusiast hailing from MIT",
      inbox: "https://social.example/alyssa/inbox/",
      outbox: "https://social.example/alyssa/outbox/",
      followers: "https://social.example/alyssa/followers/",
      following: "https://social.example/alyssa/following/",
      liked: "https://social.example/alyssa/liked/",
    };
    const sampleActivityPubB = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Person",
      id: "https://social.example/alyssa/",
      name: "Alyssa P. Hacker",
      preferredUsername: "hacker",
      summary: "Lisp enthusiast hailing from MIT",
      inbox: "https://social.example/alyssa/inbox/",
      outbox: "https://social.example/alyssa/outbox/",
      followers: "https://social.example/alyssa/followers/",
      following: "https://social.example/alyssa/following/",
      liked: "https://social.example/alyssa/liked/",
    };

    expect(hash(sampleActivityPubA)).not.toEqual(hash(sampleActivityPubB));
  });
});
