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

import * as activityPubImport from "./activityPub";
export const activityPub = activityPubImport;

import * as batchImport from "./batch";
export const batch = batchImport;

import * as contractsImport from "./contracts";
export const contracts = contractsImport;

import * as messagesImport from "./messages";
export const messages = messagesImport;

import * as queueImport from "./queue";
export const queue = queueImport;

import * as storeImport from "./store";
export const store = storeImport;

import * as utilitiesImport from "./utilities";
export const utilities = utilitiesImport;
