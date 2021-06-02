/**
 * To export at the top level of the module:
 * ```
 * export * from "./foo"
 * ```
 * Leads to use like:
 *   - `import { functionInFoo } from "@unfinishedlabs/sdk/contracts";`
 *   - `import contracts from "@unfinishedlabs/sdk/contracts"; contracts.functionInFoo();`
 *
 * To export at a nested level:
 * ```
 * import * as fooImport from "./foo";
 * export const foo = fooImport;
 * ```
 * Leads to use like:
 *   - `import contracts from "@unfinishedlabs/sdk/contracts"; contracts.foo.functionInFoo();`
 *   - `import { foo } from "@unfinishedlabs/sdk/contracts"; foo.functionInFoo();`
 */

import * as activityPubImport from "./activityPub";
export const activityPub = activityPubImport;
