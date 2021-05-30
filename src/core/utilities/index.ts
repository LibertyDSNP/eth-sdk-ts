/**
 * To export at the top level of the module:
 * ```
 * export * from "./foo"
 * ```
 * Leads to use like:
 *   - `import { functionInFoo } from "@dsnp/sdk/utilities";`
 *   - `import util from "@dsnp/sdk/utilities"; util.functionInFoo();`
 *
 * To export at a nested level:
 * ```
 * import * as fooImport from "./foo";
 * export const foo = fooImport;
 * ```
 * Leads to use like:
 *   - `import util from "@dsnp/sdk/utilities"; util.foo.functionInFoo();`
 *   - `import { foo } from "@dsnp/sdk/utilities"; foo.functionInFoo();`
 */

export * from "./errors";
export * from "./random";
