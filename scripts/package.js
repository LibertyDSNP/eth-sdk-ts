/**
 * Build the package.json for the actual publishing
 */
// eslint-disable-next-line
const fs = require("fs");
// eslint-disable-next-line
const path = require("path");

// eslint-disable-next-line
const rootPackage = require("../package.json");

// Remove test related work
delete rootPackage["jest-junit"];
delete rootPackage["jest"];

// Don't keep scripts
rootPackage["scripts"] = {
  "prepare": "typechain --target=ethers-v5 ./node_modules/@dsnp/contracts/abi/**/*.json --out-dir ./types/typechain"
};

// Setup the main and types correctly
rootPackage["main"] = "index.js";
rootPackage["types"] = "index.d.ts";

// Write it out
fs.writeFileSync(
  `${path.join(__dirname, "../dist", "package.json")}`,
  JSON.stringify(rootPackage, null, 2),
  (err) => { if (err) throw new Error(err); }
);
