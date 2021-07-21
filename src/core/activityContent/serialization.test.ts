import { ActivityContentPerson } from "./factories";
import { serialize } from "./serialization";

describe("serialize", () => {
  it("returns a serialized version of the activity content object", () => {
    const sampleActivityPub: ActivityContentPerson = {
      "@context": "https://www.w3.org/ns/activitystreams",
      published: "2021-07-15T18:33:08+00:00",
      type: "Person",
      name: "Alyssa P. Hacker",
    };

    expect(serialize(sampleActivityPub)).toEqual(
      '{"@context":"https://www.w3.org/ns/activitystreams","name":"Alyssa P. Hacker","published":"2021-07-15T18:33:08+00:00","type":"Person"}'
    );
  });
});
