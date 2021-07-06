/**
 * Use this to serve the parquetjs bundle at http://localhost:8000/main.js
 * It attaches the parquet.js exports to a "parquetjs" global variable.
 * See the example server for how to use it.
 */
const path = require("path")
const  {ethersBrowserPlugin, parquetJsBrowserPlugin} = require("./esbuild-plugins");


// const {wasmPlugin} = require("./esbuild-plugins");
// esbuild has TypeScript support by default. It will use .tsconfig
require('esbuild')
      .serve({
        servedir: __dirname,
      }, {
        bundle: true,
        entryPoints: [path.resolve(__dirname, "src","index.ts")],
        globalName: 'dsnp',
        define: {
          "process.env.NODE_DEBUG": false,
          "process.env.NODE_ENV": "\"production\"",
          global: "window"
        },
        external: ["ethers"],
        inject: ['./esbuild-shims.js'],
        minify: false,
        outfile: 'main.js',
        platform: 'browser',  // default
        plugins: [ parquetJsBrowserPlugin ],
        sourcemap: "inline",
        target: "esnext",  // default
        tsconfig: "tsconfig.esm.json"
      }).then(server => {
          console.log("serving dsnp", server)
      })
