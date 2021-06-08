/**
 * What is this?
 * Well TypeScript doesn't yet have easy support for multiple modules:
 * https://github.com/microsoft/TypeScript/issues/8305
 * and eventually https://github.com/microsoft/TypeScript/issues/33079
 * Expected to release with TypeScript 4.3 May 2021
 *
 * In the end this allows us to support:
 * `import { getBar } from "@dsnp/sdk/Foo";`
 * in addition to the other way:
 * ```
 * import { Foo } from "@dsnp/sdk";
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

const jsTemplate = (target, name) => `
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
__exportStar(require("${target ? [...Array(target.split("/").length)].map(() => "../").join("") : "./"}dist/cjs/${[target, name]
  .filter((x) => !!x)
  .join("/")}"), exports);
`;

const typesTemplate = (name, typePath) => `export * from "${typePath.trim("/")}/${name}";`;

const createMultiModule = (targetPath, typesPath) => ([moduleName, modulePath]) => {
  if (!moduleName || !modulePath) {
    throw new Error(`${moduleName} from ${modulePath} is broken somehow...`);
  }

  console.log(`Processing Multimodule support for ${moduleName}...`);
  // Types
  fs.writeFileSync(
    `${path.join(__dirname, "..", targetPath, moduleName + ".d.ts")}`,
    typesTemplate(modulePath, typesPath),
    throwOnError
  );
  // commonjs
  fs.writeFileSync(
    `${path.join(__dirname, "..", targetPath, moduleName + ".js")}`,
    jsTemplate(targetPath, modulePath),
    throwOnError
  );
};

const multimoduleFile = (relativeFileAndPath, targetPath, typesPath) => {
  const fileLines = fs.readFileSync(`${path.join(__dirname, relativeFileAndPath)}`, "UTF-8").split(/\r?\n/);

  try {
    fs.mkdirSync(path.join(__dirname, "..", targetPath));
  } catch (e) {
    if (!e.message.match(/file already exists/)) throw e;
  }

  const importAsToExport = Object.fromEntries(
    fileLines
      .map((x) => x.match(/^export const (.*?) = (.*?);/))
      .filter((x) => !!x)
      .map((x) => [x[2], x[1]])
  );

  const recurse = fileLines
    .map((x) => x.match(/^import.* as (.*?) from.*"\.\/(.*?)"/))
    .filter((x) => !!x)
    .filter((x) => !!importAsToExport[x[1]]) // Ignore things that are not re-exported
    .map((x) => [importAsToExport[x[1]], x[2]]);

  recurse.map(createMultiModule(targetPath, typesPath));
  return recurse;
};

const queue = [""];

let item;
while ((item = queue.pop()) !== undefined) {
  const relativeFileAndPath = ["..", "src", item, "index.ts"].filter((x) => !!x).join("/");

  if (!fs.existsSync(`${path.join(__dirname, relativeFileAndPath)}`)) continue;

  const targetHeight = !item ? 0 : [...item].filter((x) => x === "/").length + 1;
  const pathBackout = [...Array(targetHeight)].map(() => "..");
  const typePath = [".", ...pathBackout, "dist", "types", item].filter((x) => !!x).join("/");

  const recurse = multimoduleFile(relativeFileAndPath, item, typePath);
  if (recurse) recurse.forEach((x) => queue.push([item, x[0]].filter((y) => !!y).join("/")));
}
