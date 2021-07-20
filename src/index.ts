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

import * as generatorsImport from "./generators";
export const generators = generatorsImport;

// Porcelain
export * from "./content";
export * from "./createPublication";
export * from "./handles";
export * from "./network";
export * from "./search";

import * as contentImport from "./content";
export const content = contentImport;
import * as createPublicationImport from "./createPublication";
export const createPublication = createPublicationImport;
import * as handlesImport from "./handles";
export const handles = handlesImport;
import * as networkImport from "./network";
export const network = networkImport;
import * as searchImport from "./search";
export const search = searchImport;

export default {
  ...content,
  ...createPublication,
  ...handles,
  ...network,
  ...search,
  core,
};
