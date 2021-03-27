const WHITELIST_REQUIRED = [
  "name",
  "version"
];

const WHITELIST_METADATA = WHITELIST_REQUIRED.concat([
  "author",
  "bugs",
  "contributors",
  "description",
  "funding",
  "homepage",
  "keywords",
  "license",
  "private",
  "productName",
  "repository"
]);

const WHITELIST_ELECTRON = WHITELIST_METADATA.concat([
  "cpu",
  "main",
  "os"
]);

const WHITELIST_LIBRARY = WHITELIST_ELECTRON.concat([
  "bin",
  "browser",
  "bundledDependencies",
  "config",
  "dependencies",
  "directories",
  "engines", // The version(s) of node (or whatever runtime) that your stuff works on
  "engineStrict", // If you are sure that your module will definitely not run properly on runtimes other than those specified in the engines object
  "exports",
  "files",
  "jsnext:main",
  "man",
  "module",
  "optionalDependencies",
  "peerDependencies",
  "publishConfig",
  "scripts",
  "type",
  "types",
  "typings",
]);

const WHITELIST_ALL = WHITELIST_LIBRARY.concat([
  "devDependencies",
]);

const KEEPLISTS = {
  REQUIRED: WHITELIST_REQUIRED,
  METADATA: WHITELIST_METADATA,
  ELECTRON: WHITELIST_ELECTRON,
  LIBRARY: WHITELIST_LIBRARY,
  ALL: WHITELIST_ALL
};

module.exports.KEEPLISTS = KEEPLISTS;
