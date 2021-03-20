const fs = require("fs");
const path = require("path");
const configResolver = require('@auturge/config-resolver');
const { isFunction } = require("./isFunction");

/**
 * Reads a config file, and merges it with the default configuration
 * @param {*} defaultConfig The default config to return if no other can be loaded
 * @param {*} configFnArgs The arguments to pass into the loaded config function
 * @param {*} defaultPath The default path to search if no explicit path is given
 * @param {*} explicitPath The explicit path to search for a config file
 * @returns
 */
function getConfigurationObject(defaultConfig, configFnArgs, defaultPath, explicitPath) {

    validateArgs(defaultConfig, defaultPath, explicitPath);

    // load the config file, if possible and necessary
    const configFile = loadConfigFile(defaultPath, explicitPath, configFnArgs);
    if (configFile.error && !defaultConfig) {
        throw configFile.error;
    }

    // clone the default config, so we don't accidentally overwrite it
    const baseConfigObject = Object.assign({}, defaultConfig);

    // merge the bits that we have
    const config = mergeConfigFileIntoConfigObject(baseConfigObject, configFile.value);

    // return the result
    return config;
}

function validateArgs(defaultConfig, defaultPath, explicitPath) {
    // if the default config isn't passed, then we need a path
    if (!defaultConfig) {
        if (!(defaultPath && defaultPath.length) && !(explicitPath && explicitPath.length))
            throw new Error('Must specify either a default object, or an explicit or alternative config path.');
    }
}

class FileResult {

    value = undefined;
    function = undefined;
    relativePath = "";
    absolutePath = "";
    error = undefined;


    constructor(defaultPath, explicitPath) {
        defaultPath = defaultPath ? defaultPath.trim() : "";
        explicitPath = explicitPath ? explicitPath.trim() : "";
        if (!defaultPath && !explicitPath)
            return;

        this.setPath(explicitPath ? explicitPath : defaultPath);
    }

    setPath(value) {
        this.relativePath = value;

        if (path.isAbsolute(value)) {
            this.absolutePath = value;
        } else {
            this.absolutePath = path.join(process.cwd(), value);
        }
    }

    withError(message, error = undefined) {
        var newErr;
        if (error) {
            newErr = error;
            const oldMessage = error.message;
            const newMessage = message + "\n" + oldMessage;
            newErr.message = newMessage;
        } else {
            newErr = new Error(message);
        }

        this.error = newErr;
        return this;
    }

    exists() {
        return fs.existsSync(this.absolutePath);
    }
}

/** reads a config file */
function loadConfigFile(defaultPath, explicitPath = "", configFnArgs = null) {

    const file = new FileResult(defaultPath, explicitPath);
    if (!defaultPath && !explicitPath)
        return file.withError('No explicit or alternative config paths specified.');

    const resolverOptions = {};
    // provide the 'default' path for the config file (always a 'function'-type configuration)
    if (defaultPath) {
        resolverOptions.alternatives = [ { path: defaultPath, type: 'function' } ]
    }

    if (explicitPath) {
        if (!file.exists()) {
            return file.withError(`Config file [${ file.absolutePath }] does not exist.`);
        }

        resolverOptions.explicit = { path: file.absolutePath, type: 'function' }
    }

    // use these options to TRY to get the config file.
    let config;
    try {
        config = configResolver.resolveConfig(resolverOptions);
    } catch (error) {
        return file.withError(`Could not load config file [${ file.absolutePath }].`);
    }

    // if the user didn't specify a config file, and we couldn't find an alternative, then return null.
    if (!resolverOptions.explicit && !config) {
        return file.withError('No config file specified, could not find default file.');
    }

    // for now, we only support function-type config files. Validate this.
    if (!isFunction(config)) {
        const message = `Config file [${ file.absolutePath }] does not export a function.`;
        return file.withError(message);
    }
    file.function = config;

    // Run the function and return the results.
    let result;
    try {
        result = config(configFnArgs);
    } catch (err) {
        return file.withError('Config function threw an error:', err);
    }

    file.value = result;

    return file;
}

/** Merge config objects in order off the stack.
 * That is, config[2] overwrites config[1] overwrites config[0].
 */
function mergeConfigFileIntoConfigObject(defaultConfig, configFile) {
    return Object.assign({}, defaultConfig, configFile);
}

module.exports = {
    'getConfigurationObject': getConfigurationObject
};
