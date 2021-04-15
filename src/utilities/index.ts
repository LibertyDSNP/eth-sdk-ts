/**
 * To export at the top level of the module:
 * ```
 * export * from "./foo"
 * ```
 * Leads to use like:
 *   - `import { functionInFoo } from "@unfinishedlabs/sdk/utilities";`
 *   - `import util from "@unfinishedlabs/sdk/utilities"; util.functionInFoo();`
 *
 * To export at a nested level:
 * ```
 * import * as fooImport from "./foo";
 * export const foo = fooImport;
 * ```
 * Leads to use like:
 *   - `import util from "@unfinishedlabs/sdk/utilities"; util.foo.functionInFoo();`
 *   - `import { foo } from "@unfinishedlabs/sdk/utilities"; foo.functionInFoo();`
 */

export * from "./errors";
