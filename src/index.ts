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

import * as configImport from "./config";
export const config = configImport;
import * as contentImport from "./content";
export const content = contentImport;
import * as handlesImport from "./handles";
export const handles = handlesImport;
import * as networkImport from "./network";
export const network = networkImport;
import * as searchImport from "./search";
export const search = searchImport;

export default {
  ...config,
  ...content,
  ...handles,
  ...network,
  ...search,
  core,
};
