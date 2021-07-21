/**
 * To export a new sub-module:
 * ```
 * import * as fooImport from "./foo";
 * export const foo = fooImport;
 * ```
 * Leads to use like:
 *   - `import { foo } from "@dsnp/sdk/core";`
 *   - `import foo from "@dsnp/sdk/core/foo";`
 */

import * as activityContentImport from "./activityContent";
export const activityContent = activityContentImport;

import * as batchImport from "./batch";
export const batch = batchImport;

import * as contractsImport from "./contracts";
export const contracts = contractsImport;

import * as configImport from "./config";
export const config = configImport;

import * as announcementsImport from "./announcements";
export const announcements = announcementsImport;

import * as storeImport from "./store";
export const store = storeImport;

import * as utilitiesImport from "./utilities";
export const utilities = utilitiesImport;
