const  path = require("path")
const  {parquetJsBrowserPlugin} = require("./esbuild-plugins");

const outfile = 'sdk-bundle.min.js'
require('esbuild')
    .build({
        bundle: true,
        entryPoints: [path.resolve(__dirname, "src","index.ts")],
        define: {
            "process.env.NODE_DEBUG": false,
            "process.env.NODE_ENV": "\"production\"",
            global: "window"
        },
        globalName: 'dsnp',
        inject: ['./esbuild-shims.js'],
        minify: true,
        outdir: path.resolve(__dirname, "dist","browser"),
        platform: 'browser',  // default
        plugins: [ parquetJsBrowserPlugin ],
        target: "esnext"  // default
    })
    .then(res => {
        if (!res.warnings.length) {
            console.log("built with no errors or warnings")
        }
    })
    .catch(e => {
        console.error("Finished with errors: ", e.toString());
    });



