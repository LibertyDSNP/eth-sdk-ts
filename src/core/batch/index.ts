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

export * from "./batch";
export * from "./batchErrors";

import * as batchMessagesImport from "./batchMessages";
export const batchMessages = batchMessagesImport;

import * as parquetSchemaImport from "./parquetSchema";
export const parquetSchema = parquetSchemaImport;
