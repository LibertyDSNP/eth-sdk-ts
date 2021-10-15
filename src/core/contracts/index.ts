/**
 * To export at the top level of the module:
 * ```
 * export * from "./foo"
 * ```
 * Leads to use like:
 *   - `import { functionInFoo } from "@dsnp/sdk/contracts";`
 *   - `import contracts from "@dsnp/sdk/contracts"; contracts.functionInFoo();`
 *
 * To export at a nested level:
 * ```
 * import * as fooImport from "./foo";
 * export const foo = fooImport;
 * ```
 * Leads to use like:
 *   - `import contracts from "@dsnp/sdk/contracts"; contracts.foo.functionInFoo();`
 *   - `import { foo } from "@dsnp/sdk/contracts"; foo.functionInFoo();`
 */

import * as publisherImport from "./publisher";
export const publisher = publisherImport;

import * as registryImport from "./registry";
export const registry = registryImport;

import * as identityImport from "./identity";
export const identity = identityImport;

import * as subscriptionImport from "./subscription";
export const subscription = subscriptionImport;
