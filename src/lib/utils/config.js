const fs = require("fs");
const path = require("path");
const configResolver = require('@auturge/config-resolver');
const { throwError, throwException, EXIT_CODES } = require("./errors");
const { isFunction } = require("./isFunction");

/** Reads a config file, and merges it with the default configuration */
function getConfigurationObject(defaultConfig, defaultConfigPath, options) {

    // load the config file, if possible and necessary
    const configFile = loadConfigFile(defaultConfigPath, options);

    // clone the default config, so we don't accidentally overwrite it
    const baseConfigObject = Object.assign({}, defaultConfig);

    // merge the bits that we have
    const config = mergeConfigFileIntoConfigObject(baseConfigObject, configFile);

    // return the result
    return config;
}

/** reads a config file */
function loadConfigFile(defaultPath, options) {

    var configPath = options.config;
    const absolutePath = configPath ? path.join(process.cwd(), configPath) : '';

    // provide the 'default' path for the config file (always a 'function'-type configuration)
    const resolverOptions = { alternatives: [ { path: defaultPath, type: 'function' } ] };

    if (configPath) {
        configPath = configPath.trim();
        if (!fs.existsSync(absolutePath)) {
            throwError(`ERROR: Config file [${ absolutePath }] does not exist.`);
        }

        resolverOptions.explicit = { path: absolutePath, type: 'function' }
    }

    // use these options to TRY to get the config file.
    let config;
    try {
        config = configResolver.resolveConfig(resolverOptions);
    } catch (error) {
        throwError(`ERROR: Could not load config file [${ absolutePath }].`, error, EXIT_CODES.EXTERNAL_ERROR);
    }

    // if the user didn't specify a config file, and we couldn't find an alternative, then return null.
    if (!resolverOptions.explicit && !config) {
        return null;
    }

    // for now, we only support function-type config files. Validate this.
    if (!isFunction(config)) {
        const message = configPath ? `ERROR: Config file [${ absolutePath }] does not export a function.` : `ERROR: Config file does not export a function.`;
        throwError(message, null, EXIT_CODES.INVALID_CONFIG_FILE);
    }

    // Run the function and return the results.
    let result;
    try {
        result = config(options);
    } catch (error) {
        throwException(`ERROR: Config function threw an error.`, error, EXIT_CODES.CONFIG_FUNCTION_ERROR);
    }

    return result;
}

/** Merge config objects in order off the stack.
 * That is, config[2] overwrites config[1] overwrites config[0].
 */
function mergeConfigFileIntoConfigObject(defaultConfig, configFile) {
    var config = defaultConfig || {};
    mergeFile(config, configFile);
    return config;
}

/** Merge the config file into the config */
function mergeFile(config, file) {
    return Object.assign(config, file);
}

module.exports = (defaultConfig, defaultConfigPath, options) => getConfigurationObject(defaultConfig, defaultConfigPath, options);
