/**
 * To export a new sub-module:
 * ```
 * import * as fooImport from "./foo";
 * export const foo = fooImport;
 * ```
 * Leads to use like:
 *   - `import { foo } from "@dsnp/sdk";`
 *   - `import foo from "@dsnp/sdk/foo";`
 */

import * as coreImport from "./core";
export const core = coreImport;

// Porcelain
export * from "./config";
export * from "./content";
export * from "./handles";
export * from "./network";
export * from "./search";

import * as config from "./config";
import * as content from "./content";
import * as handles from "./handles";
import * as network from "./network";
import * as search from "./search";

export default {
  ...config,
  ...content,
  ...handles,
  ...network,
  ...search,
  core,
};
