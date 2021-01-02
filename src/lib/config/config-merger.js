const path = require("path");
const DEFAULT_CONFIG = require('./DEFAULT_CONFIG');
const LOG_LEVEL = require("./LOG_LEVEL");
const validateConfig = require("./config-validator");

/** Merge config objects in order off the stack.
 * That is, config[2] overwrites config[1] overwrites config[0].
 */
function merge(defaultConfig, configFile, cliOpts) {

  var config = defaultConfig ? defaultConfig : DEFAULT_CONFIG;
  mergeFile(config, configFile);
  applyOverrides(config, cliOpts);

  // ensure that the merged config is valid
  validateConfig(config);

  return config;
}

/** Merge the config file into the config */
function mergeFile(config, file) {
  return Object.assign(config, file);
}

/** Apply the CLI options to the config */
function applyOverrides(config, opts) {
  // merge on the command-line options
  if (opts.source) {
    config.source = path.resolve(process.cwd(), opts.source);
  }
  if (opts.target) {
    config.source = path.resolve(process.cwd(), opts.target);
  }
  if (opts.whitelist) {
    config.whitelist = opts.whitelist;
  }
  if (opts.quiet) {
    config.loglevel = LOG_LEVEL.ERROR;
  }
  if (opts.verbose) {
    config.loglevel = LOG_LEVEL.VERBOSE;
  }

  return config;
}

module.exports = (base, file, cliOpts) => merge(base, file, cliOpts);
