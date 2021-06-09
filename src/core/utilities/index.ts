/**
 * To export at the top level of the module:
 * ```
 * export * from "./foo"
 * ```
 * Leads to use like:
 *   - `import { functionInFoo } from "@dsnp/sdk/utilities.ts";`
 *   - `import util from "@dsnp/sdk/utilities.ts"; util.functionInFoo();`
 *
 * To export at a nested level:
 * ```
 * import * as fooImport from "./foo";
 * export const foo = fooImport;
 * ```
 * Leads to use like:
 *   - `import util from "@dsnp/sdk/utilities.ts"; util.foo.functionInFoo();`
 *   - `import { foo } from "@dsnp/sdk/utilities.ts"; foo.functionInFoo();`
 */

export * from "./errors";
export * from "./identifiers";
