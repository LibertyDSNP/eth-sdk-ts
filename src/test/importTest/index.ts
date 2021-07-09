import assert from "assert";

import sdk from "@dsnp/sdk";
import { generators } from "@dsnp/sdk";
import { subscribeToBatchAnnounceEvents } from "@dsnp/sdk/core/contracts/subscription";

Object.entries({
  // Add imports that should exist
  sdk,
  generators,
  dsnpGenerators: generators.dsnp.generateBroadcast,
  contractSubscription: subscribeToBatchAnnounceEvents,
}).forEach(([key, value]) => {
  assert.notStrictEqual(value, undefined, `Was unable to import ${key}`);
});

assert(sdk.setConfig({}));
assert(sdk.createAnnouncements);
