# DSNP SDK TypeScript Development

## Library Development Notes
- `.js` files are not allowed in the root directory. For more information why see `scripts/multimodules.js`.
- Update the docs folder as needed by running `npm run docs:markdown`

### Styleguide

This SDK is linted with `Prettier` and `ESlint`.

- All functions should be documented using typedoc
- Booleans should be named `isFoo`
- Functions should begin with verbs
- Getters and Setters should always be prefixed with `get` and `set`
- Only unused variables should be prefixed with an `_`
- Global constants and enums should be in all caps with underscores: `HELLO_WORLD`
- Don't use really short variable names except for loop indices or functions less than 3 lines.
- :hourglass: For callbacks, prefix name with `do`


### Local Development Library Use

1. sdk-ts: `npm install`
2. sdk-ts: `npm run build`
3. sdk-ts: `npm link`
4. In other project: `npm link @LibertyDSNP/sdk`
5. The other project now uses the sdk-ts folder as the node_modules folder for the SDK
6. sdk-ts: `npm run watch`

### Documentation Generation Notes

- `npm run docs` generates HTML documentation in `dist`
- `npm run docs:markdown` generates markdown documentation in `docs`
- Edit the list of excluded files in `tsconfig.json` -> `typedocOptions` -> `exclude`

### How to Release

1. Commit version update in package.json following [Semver 2.0](https://semver.org/)
2. Draft New Release on GitHub.com
3. Set tag to v[package.json version]
4. Set title to "v[package.json version] Major Feature Name"
5. Set contents to follow [KeepAChangeLog.com 1.0](https://keepachangelog.com/en/1.0.0/), but limited to just the new release information
    ```markdown
    ## [0.1.0] - 2017-06-20
    ### Added
    - New thing
    ### Changed
    - Different thing
    ### Removed
    - Not a thing anymore
    ```
6. Publish
7. TODO: CI will build and publish to the npm repository
