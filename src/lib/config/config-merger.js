const path = require("path");
const DEFAULT_CONFIG = require('./DEFAULT_CONFIG');
const { LogLevel } = require("../logging");
const validateConfig = require("./config-validator");

/**
 * Merge config objects in order off the stack.
 * That is, config[2] overwrites config[1] overwrites config[0].
 */
function merge(logger, defaultConfig, configFile, cliOpts) {
    logger.mark('config-merger::merge');
    logger.debug('Merging config objects in order off the stack.');

    logger.trace('  defaultConfig:', defaultConfig);
    logger.trace('  configFile:', configFile);
    logger.trace('  cliOpts:', cliOpts);

    var config = defaultConfig ? defaultConfig : DEFAULT_CONFIG;

    mergeFile(logger, config, configFile);

    config = applyOverridesToConfig(logger, config, cliOpts);

    // Update the logger with the new log level
    logger.logLevel = config.loglevel;

    // ensure that the merged config is valid
    validateConfig(logger, config);

    return config;
}

/** Merge the config file into the config */
function mergeFile(logger, config, file) {
    logger.mark('config-merger::mergeFile');
    logger.debug('Merging the configuration file into the configuration object.');
    return Object.assign(config, file);
}

/** Apply the CLI options to the config */
function applyOverridesToConfig(logger, config, opts) {
    logger.mark('config-merger::applyOverridesToConfig');
    logger.debug('Applying the CLI options to the configuration object.');
    // merge on the command-line options
    if (opts.source != null) {
        config.source = opts.source === "" ? "" :
            path.resolve(process.cwd(), opts.source);
    }
    if (opts.destination != null) {
        config.destination = opts.destination === "" ? "" :
            path.resolve(process.cwd(), opts.destination);
    }
    if (opts.whitelist != null) {
        config.whitelist = opts.whitelist;
    }
    if (opts.quiet) {
        config.loglevel = LogLevel.ERROR;
    }
    if (opts.verbose) {
        config.loglevel = LogLevel.TRACE;
    }

    config.loglevel = LogLevel.coerce(config.loglevel);
    return config;
}

module.exports = (logger, base, file, cliOpts) => merge(logger, base, file, cliOpts);
