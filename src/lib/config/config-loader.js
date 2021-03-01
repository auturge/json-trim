const fs = require("fs");
const path = require("path");
const configResolver = require('@auturge/config-resolver');
const throwError = require("../errors/throw-error");
const throwException = require("../errors/throw-exception");
const EXIT_CODES = require("../errors/EXIT_CODES");
const { isFunction } = require("../utils/isFunction");

// reads a config file
function loadConfigFile(logger, options) {

    var configPath = options.config;
    const absolutePath = configPath ? path.join(process.cwd(), configPath) : '';

    // provide the 'default' path for the config file (always a 'function'-type configuration)
    const resolverOptions = { alternatives: [ { path: './trim.config.js', type: 'function' } ] };

    if (configPath) {
        configPath = configPath.trim();
        logger.trace(`Checking config path: [${ configPath }]`);
        if (!fs.existsSync(absolutePath)) {
            throwError(`ERROR: Config file [${ absolutePath }] does not exist.`);
        }

        logger.debug(`Using config at: [${ configPath }]`);
        resolverOptions.explicit = { path: absolutePath, type: 'function' }
    }

    // use these options to TRY to get the config file.
    let config;
    try {

        logger.trace('  Attempting to resolve config file with options:', JSON.stringify(resolverOptions, null, 2));

        config = configResolver.resolveConfig(resolverOptions);
    } catch (error) {
        throwError(`ERROR: Could not load config file [${ absolutePath }].`, error, EXIT_CODES.EXTERNAL_ERROR);
    }

    // if the user didn't specify a config file, and we couldn't find an alternative, then return null.
    if (!resolverOptions.explicit && !config) {
        logger.debug('No config file found.');
        return null;
    }

    // json-trim only supports function-type config files. Validate this.
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

module.exports = (logger, options) => {
    return loadConfigFile(logger, options);
}
