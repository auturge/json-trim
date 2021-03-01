const ensureRuntimeOptionsHaveTheRightShape = require('./marshal-options');
const loadConfigFile = require("./config-loader");
const mergeConfigInfo = require("./config-merger");
const resolveKeyList = require("./keylist-resolver");
const DEFAULT_CONFIG = require('./DEFAULT_CONFIG');

function generateRuntimeConfiguration(logger, parsedOpts) {

    logger.mark('config-builder::generateRuntimeConfiguration');
    logger.debug('Generating a runtime configuration object.');

    logger.trace('parsedOpts:', parsedOpts);

    // ensure the parsed options object has all the required properties
    const options = ensureRuntimeOptionsHaveTheRightShape(parsedOpts);

    logger.trace('options:', options);

    // load the config file, if possible and necessary
    const configFile = loadConfigFile(logger, options);

    // merge the bits that we have
    const defaultConfig = Object.assign({}, DEFAULT_CONFIG);
    const config = mergeConfigInfo(logger, defaultConfig, configFile, options);

    // identify the keys to keep
    resolveKeyList(logger, config);

    // return the result
    return config;
}

module.exports = (logger, parsedOpts) => {
    return generateRuntimeConfiguration(logger, parsedOpts);
}
