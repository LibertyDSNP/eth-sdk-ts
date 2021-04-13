/**
 * To export a new sub-module:
 * ```
 * import * as fooImport from "./foo";
 * export const foo = fooImport;
 * ```
 * Leads to use like:
 *   - `import { foo } from "@unfinishedlabs/sdk";`
 *   - `import foo from "@unfinishedlabs/sdk/foo";`
 */

import * as contractsImport from "./contracts";
export const contracts = contractsImport;

import * as utilitiesImport from "./utilities";
export const utilities = utilitiesImport;

import * as socialContent from "./social/content";
export const content = socialContent;
