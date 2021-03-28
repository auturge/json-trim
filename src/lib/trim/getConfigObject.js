const path = require('path');
const gco = require('../utils/config');
const JSONLoader = require('../utils/json-loader');
const { Logger, LogLevel, LogEntryState } = require("../utils/logging");
const { throwError, EXIT_CODES } = require("../utils/errors");
const filter = require('../utils/filter');

const DEFAULT_CONFIG = {
    source: undefined,
    destination: undefined,
    loglevel: LogLevel.INFO
};

const logger = Logger.getSingleton('json-trim');

/** Load and parse a configuration file, then merge in command-line options */
function getConfigObject(cliOptions) {
    logger.mark('getConfigObject::getConfigObject');
    logger.debug('Generating a runtime configuration object.');
    logger.trace('options from the command-line:', cliOptions);

    // ensure the parsed options object has all the required properties
    logger.trace('Marshalling command-line options into base configuration object...');
    const options = marshalParsedOptionsIntoMinimalConfigOptions(cliOptions);

    logger.trace('DEFAULT configuration options:', DEFAULT_CONFIG);
    logger.trace('base configuration options:', options);

    logger.trace('Merging configuration into base options...');
    logger.mark('getConfigObject::getConfigurationObject');
    var config = gco.getConfigurationObject(DEFAULT_CONFIG, null, './trim.config.js', options.config);
    logger.trace('Configured object:', config);

    // apply json-trim specific overrides
    config = applyOverridesToConfig(config, options);

    logger.trace('Final config:', config);

    // validate the final config object
    validateConfigPaths(config);

    // identify the keys to keep - this is json-trim specific
    resolveKeyList(config);

    return config;
}

/** Apply the CLI options to the config */
function applyOverridesToConfig(config, opts) {
    logger.mark('getConfigObject::applyOverridesToConfig');
    logger.debug('Applying the CLI options to the configuration object.');

    logger.beginPartial(LogLevel.DEBUG, 'Applying overrides... ');

    if (!config) {
        // This SHOULD never happen, since this method is called after merging
        // the loaded config with a default config...
        logger.endPartial(LogLevel.DEBUG, "failed.", LogEntryState.FAILURE);
        throwError('Could not resolve configuration.', null, EXIT_CODES.CONFIGURATION_ERROR);
    }

    // update the logger config
    if (opts.quiet) {
        config.loglevel = LogLevel.ERROR;
    }
    if (opts.debug) {
        config.loglevel = LogLevel.DEBUG;
    }
    if (opts.verbose) {
        config.loglevel = LogLevel.TRACE;
    }
    const coercedLogLevel = LogLevel.coerce(config.loglevel);
    logger.debug(`Setting log level to [${ coercedLogLevel }].`);
    config.loglevel = coercedLogLevel;
    logger.logLevel = coercedLogLevel;
    logger.debug(`Log level set to [${ coercedLogLevel }].`);

    // merge on the command-line options
    var optsSource = getAbsolutePath(opts.source);
    if (optsSource != null) { config.source = optsSource; }

    var optsDestination = getAbsolutePath(opts.destination);
    if (optsDestination != null) { config.destination = optsDestination; }

    if (opts.keeplist != null) {
        config.keeplist = opts.keeplist;
    }

    logger.endPartial(LogLevel.DEBUG, 'done.', LogEntryState.SUCCESS);
    return config;
}

function getAbsolutePath(candidate) {
    if (candidate == null || candidate == "")
        return candidate;

    const result = path.resolve(process.cwd(), candidate);
    return result;
}

/** Make sure the options object has all the required properties */
function marshalParsedOptionsIntoMinimalConfigOptions(parsedOpts) {
    logger.mark('getConfigObject::marshalParsedOptionsIntoMinimalConfigOptions');
    logger.debug('Ensuring the config object has the correct shape.');

    // the final output needs/must include:
    //   config  :  string
    //   env     :  string | undefined

    const MINIMAL_CONFIG = Object.freeze(
        {
            config: '',
            env: undefined
        }
    );

    // merge the passed in options
    var config = Object.assign({}, MINIMAL_CONFIG, parsedOpts);

    return config;
}

/** Given a config object, resolves the list of keys */
function resolveKeyList(config) {
    logger.mark('getConfigObject::resolveKeyList');

    logger.beginPartial(LogLevel.DEBUG, 'Resolving the keylist... ');

    // Get the keys that exist in the file
    var loadResult = JSONLoader.load(config.source);
    if (loadResult.error) {
        logger.endPartial(LogLevel.DEBUG, "failed.", LogEntryState.FAILURE);
        logger.error(loadResult.error);
        return process.exit(1);
    }

    var json = loadResult.content;
    var keylist = Object.keys(json);

    // If the config already has a KEYLIST, then delete it.
    // (That's MY property; get out of here with that shit!)
    if (config.keylist) {
        delete config.keylist;
    }

    // If the config has a keeplist, then trim the list down to only those entries in the keeplist
    // if it doesn't, then assume you mean to "keep them all"
    if (config.keeplist && config.keeplist.length) {
        keylist = filter(word => keylist.includes(word), config.keeplist);
        delete config.keeplist;
    }

    // If the config has a trimlist, then trim out any entries that exist in the trimlist
    // if it doesn't, then assume you mean to "keep them all"
    if (config.trimlist && config.trimlist.length) {
        keylist = filter(word => !config.trimlist.includes(word), keylist);
        delete config.trimlist;
    }

    // apply the keylist to the config file.
    config.keylist = keylist;

    logger.endPartial(LogLevel.DEBUG, ' done.', LogEntryState.SUCCESS);

    return config;
}

/** Validate the runtime configuration paths */
function validateConfigPaths(config) {
    logger.mark('getConfigObject::validateConfigPaths');
    logger.trace('  config:', JSON.stringify(config, null, 2));

    logger.beginPartial(LogLevel.DEBUG, 'Validating paths... ');

    function isFieldMissing(field) {
        // determine if the property is null or undefined (unset).
        return config[ field ] == null;
    }

    function throwIfMissing(field) {
        if (isFieldMissing(field)) {
            logger.endPartial(LogLevel.DEBUG, "failed.", LogEntryState.FAILURE);
            throwError(`Could not resolve configuration: '${ field }' is not defined.`, null, EXIT_CODES.CONFIGURATION_ERROR);
        }
    }

    function throwIfEmpty(field) {
        throwIfMissing(field);
        if (config[ field ].trim() === "") {
            logger.endPartial(LogLevel.DEBUG, "failed.", LogEntryState.FAILURE);
            throwError(`Property '${ field }' must not be an empty string.`, null, EXIT_CODES.CONFIGURATION_ERROR);
        }
    }

    throwIfMissing('source');
    throwIfEmpty('source');

    logger.endPartial(LogLevel.DEBUG, 'paths are valid.', LogEntryState.SUCCESS);
}

module.exports = (parsedOpts) => getConfigObject(parsedOpts);
