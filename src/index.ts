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

import * as configImport from "./config/config";
export const config = configImport;

import * as contractsImport from "./contracts";
export const contracts = contractsImport;

import * as utilitiesImport from "./utilities";
export const utilities = utilitiesImport;

import * as socialContentImport from "./social/content";
export const socialContent = socialContentImport;

import * as socialHandlesImport from "./social/handles";
export const socialHandles = socialHandlesImport;

import * as socialNetworkImport from "./social/network";
export const socialNetwork = socialNetworkImport;

import * as socialSearchImport from "./social/search";
export const socialSearch = socialSearchImport;
