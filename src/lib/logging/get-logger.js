const Logger = require('./Logger');
const LogLevel = require('./LogLevel');

const DEFAULT_LOG_LEVEL = LogLevel.INFO;

function getLogLevel(loggerOptions, isSilent) {

    var logLevel = DEFAULT_LOG_LEVEL;

    if (loggerOptions && loggerOptions.quiet) {
        logLevel = LogLevel.ERROR;
    }
    else if (loggerOptions && loggerOptions.verbose) {
        logLevel = LogLevel.TRACE;
    }

    // override the loglevel if we've sent in the silent argument
    if (isSilent) {
        logLevel = LogLevel.SILENT;
    }

    return logLevel;
}

/** Get an application-specific logger. */
function getLogger(loggerSource, loggerOptions, isSilent) {

    const logLevel = getLogLevel(loggerOptions, isSilent);

    const logger = new Logger();
    logger.configure(loggerSource, logLevel);

    return logger;
}

module.exports = (loggerSource, loggerOptions, isSilent) => getLogger(loggerSource, loggerOptions, isSilent);
