const loadConfigFile = require("./config-loader");
const mergeConfigInfo = require("./config-merger");
const resolveKeyList = require("./keylist-resolver");
const DEFAULT_CONFIG = require('./DEFAULT_CONFIG');

function generateConfig(opts) {
  const defaultConfig = Object.assign({}, DEFAULT_CONFIG);


  const configFile = loadConfigFile(opts.config, opts.env);


  const config = mergeConfigInfo(defaultConfig, configFile, opts);


  resolveKeyList(config);


  return config;
}

module.exports = (opts) => {
  return generateConfig(opts);
}
