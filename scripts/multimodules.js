/**
 * What is this?
 * Well TypeScript doesn't yet have easy support for multiple modules:
 * https://github.com/microsoft/TypeScript/issues/8305
 * and eventually https://github.com/microsoft/TypeScript/issues/33079
 * Expected to release with TypeScript 4.3 May 2021
 *
 * In the end this allows us to support:
 * `import { getBar } from "@unfinishedlabs/sdk/Foo";`
 * in addition to the other way:
 * ```
 * import { Foo } from "@unfinishedlabs/sdk";
 * const { getBar } = Foo;
 * ```
 *
 * This should allow better tree shaking, but I'm not 100% sure.
 * Easier imports at least.
 *
 * If you want to add a new top level module, just add it to the end of the file
 *
 */
// eslint-disable-next-line
const fs = require("fs");
// eslint-disable-next-line
const path = require("path");

const throwOnError = (err) => {
  if (err) throw new Error(err);
};

const jsTemplate = (name) => `
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
__exportStar(require("./dist/cjs/${name}"), exports);
`;

const typesTemplate = (name) => `export * from "./dist/types/${name}";`;

const createMultiModule = (name) => {
  if (/.*\/.*/.test(name)) {
    throw new Error(`${name} appears to be in a subdirectory.
    FIX: Either move ${name} to the root of src or update scrips/multimodules.js to support this.`);
  }

  console.log(`Processing Multimodule support for ${name}...`);

  // Types
  fs.writeFileSync(`${path.join(__dirname, "..", name + ".d.ts")}`, typesTemplate(name), throwOnError);
  // commonjs
  fs.writeFileSync(`${path.join(__dirname, "..", name + ".js")}`, jsTemplate(name), throwOnError);
};

fs.readFileSync(`${path.join(__dirname, "../src/index.ts")}`, "UTF-8")
  .split(/\r?\n/)
  .flatMap((x) => x.match(/^import.*from.*"\.\/(.*?)"/))
  .filter((x) => !!x && !/^import/.test(x))
  .map(createMultiModule);
