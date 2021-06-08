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

import * as storageImport from "./storage";
export const storage = storageImport;

import * as s3NodeImport from "./s3Node";
export const s3Node = s3NodeImport;
