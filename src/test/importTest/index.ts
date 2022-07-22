import assert from "assert";

import sdk from "@dsnp/sdk";
import { generators } from "@dsnp/sdk";
import { buildDSNPContentURI } from "@dsnp/sdk/core/identifiers";
import { subscribeToBatchPublications } from "@dsnp/sdk/core/contracts/subscription";

Object.entries({
  // Add imports that should exist
  sdk,
  generators,
  dsnpGenerators: generators.dsnp.generateBroadcast,
  contractSubscription: subscribeToBatchPublications,
  buildDSNPContentURI: buildDSNPContentURI,
}).forEach(([key, value]) => {
  assert.notStrictEqual(value, undefined, `Was unable to import ${key}`);
});

assert(sdk.setConfig({}));
assert(sdk.createPublication);
