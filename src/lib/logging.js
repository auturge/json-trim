const util = require('util');
const { red, cyan, yellow, green, white, magenta } = require('colorette');

// TODO Figure out logging
// Verbose should show any level
// default should show success, error, warn, info, log
// "quiet" should show only error

/** Constructor options that the `Logger` will consider. */
class LoggerOptions {
    verbose = false;
    quiet = false;
    silent = false;

    static get DEFAULT() {
        return Object.freeze(new LoggerOptions());
    }
}

/** Defines logging severity levels. */
class LogLevel {

    name = "";
    index = 0;

    constructor(name, index) {
        this.name = Object.freeze((name && name.length) ? name.toUpperCase() : "");
        this.index = Object.freeze(index);

        this.valueOf = function () {
            return this.index;
        }

        this.toString = function () {
            return this.name;
        }
    }

    /** A log level used in the rare event that all output should be suppressed, as in unit testing. */
    static SILENT = Object.freeze(new LogLevel("SILENT", 0));

    /** A log level used when one or more key business functionalities are not working and the whole system doesn’t fulfill the business functionalities. */
    static FATAL = Object.freeze(new LogLevel("FATAL", 1));

    /** A log level used when one or more functionalities are not working, preventing some functionalities from working correctly. */
    static ERROR = Object.freeze(new LogLevel("ERROR", 2));

    /** A log level used when unexpected behavior happened inside the application, but it is continuing its work and the key business features are operating as expected. */
    static WARN = Object.freeze(new LogLevel("WARN", 3));

    /** A log level used when an event happened, the event is purely informative and can be ignored during normal operations. */
    static INFO = Object.freeze(new LogLevel("INFO", 4));

    /** A log level used for events considered to be useful during software debugging when more granular information is needed. */
    static DEBUG = Object.freeze(new LogLevel("DEBUG", 5));

    /** A log level describing events showing step by step execution of your code that can be ignored during the standard operation, but may be useful during extended debugging sessions. */
    static TRACE = Object.freeze(new LogLevel("TRACE", 6));

    static list = Object.freeze([ LogLevel.SILENT, LogLevel.FATAL, LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE ]);

    /** Takes a value and tries to coerce it into a LogLevel. */
    static coerce = function (value) {
        if (value == null)
            return null;

        if (typeof value === "object" && value instanceof LogLevel)
            return value;

        /** Coerces the index of a log level into the corresponding `LogLevel`. */
        function fromIndex(index) {
            for (var i = 0, size = LogLevel.list.length; i < size; i++) {
                var item = LogLevel.list[ i ];
                if (item.index == index) { return item; }
            }

            // not found
            throw new Error(`No LogLevel exists with index [${ index }].`);
        }

        /** Coerces the name of a log level into the corresponding `LogLevel`. */
        function fromName(name) {
            for (var i = 0, size = LogLevel.list.length; i < size; i++) {
                var item = LogLevel.list[ i ];
                if (item.name.toLowerCase() == name.toLowerCase()) { return item; }
            }

            // not found
            throw new Error(`No LogLevel exists with name [${ name }].`);
        }

        if (typeof value === "string" || value instanceof String)
            return fromName(value);

        if (typeof value === "number" || value instanceof Number)
            return fromIndex(value);

        // not found
        throw new Error(`Could not normalize loglevel value [${ value }].`);
    }
}

const DEFAULT_LOG_LEVEL = LogLevel.INFO;

function getLogLevel(loggerOptions) {

    var logLevel = DEFAULT_LOG_LEVEL;

    if (loggerOptions != null) {
        if (loggerOptions.quiet) {
            logLevel = LogLevel.ERROR;
        }
        else if (loggerOptions.verbose) {
            logLevel = LogLevel.TRACE;
        }

        // override the loglevel if we've sent in the silent argument
        if (loggerOptions.silent) {
            logLevel = LogLevel.SILENT;
        }
    }

    return logLevel;
}

/** Defines states for log entry messages, e.g., `SUCCESS`, `FAILURE`, `ERROR`, or `WARN`. */
class LogEntryState {

    name = "";
    index = -1;
    color = white;

    constructor(name, index, colorFunc) {
        this.name = Object.freeze((name && name.length) ? name.toUpperCase() : "");
        this.index = Object.freeze(index);
        this.color = Object.freeze(colorFunc);

        this.valueOf = function () {
            return this.index;
        }

        this.toString = function () {
            return this.name;
        }
    }

    /** A log state used when no state is declared. */
    static NONE = Object.freeze(new LogEntryState("NONE", -1, (...val) => util.format(white(...val))));

    /** A log state that describes a successful operation. */
    static SUCCESS = Object.freeze(new LogEntryState("SUCCESS", 0, (...val) => util.format(green(...val))));

    /** A log state used when something has failed. Not necessarily an error. */
    static FAILURE = Object.freeze(new LogEntryState("FAILURE", 2, (...val) => util.format(red(...val))));

    /** A log state used when unexpected behavior happened inside the application, but it is continuing its work and the key business features are operating as expected. */
    static WARN = Object.freeze(new LogEntryState("WARN", 1, (...val) => util.format(yellow(...val))));

    /** A log state used when one or more functionalities are not working, preventing some functionalities from working correctly. */
    static ERROR = Object.freeze(new LogEntryState("ERROR", 3, (...val) => util.format(red(...val))));
}

/** A class used to perform simple console logging. */
class Logger {

    /** Is the logger configured to be silent? */
    isSilent = false;

    /** Is the logger waiting to complete a line of text? */
    isPartialOpen = false;

    /** The log level */
    logLevel = DEFAULT_LOG_LEVEL;

    static getInstance(source, options) {
        source = source || '';
        options = options || new LoggerOptions();

        const logLevel = getLogLevel(options);
        const logger = new Logger();
        logger.configure(source, logLevel);
        return logger;
    }

    enabled = true;

    /** Disables/silences the logger. */
    disable() {
        this.enabled = false;
        return this;
    }

    /** Enables the logger. */
    enable() {
        this.enabled = true;
        return this;
    }

    /** (Re-)configures the `source` and `logLevel` properties. */
    configure = (source, loglevel) => {
        this.source = source || '';
        this.logLevel = loglevel || this.logLevel;
        this.enabled = (this.logLevel != LogLevel.SILENT);
        return this;
    }

    /** Checks if the logger can/should display output at the given level. */
    canOutputAtLevel(logLevel) {
        return (this.logLevel >= logLevel && !this.isSilent);
    }

    /** Formats and writes an error log message.
     *
     * This is best applied when one or more functionalities are not working, preventing some functionalities from working correctly.
    */
    error = (...val) => {
        if (this.canOutputAtLevel(LogLevel.ERROR)) {
            console.error(`[${ this.source }] ${ red(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes a warning log message.
     *
     * This is best applied when unexpected behavior happened inside the application, but it is continuing its work and the key business features are operating as expected. */
    warn = (...val) => {
        if (this.canOutputAtLevel(LogLevel.WARN)) {
            console.warn(`[${ this.source }] ${ yellow(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes an informational log message.
     *
     * This is best applied when an event happened, the event is purely informative and can be ignored during normal operations.
    */
    info = (...val) => {
        if (this.canOutputAtLevel(LogLevel.INFO)) {
            console.info(`[${ this.source }] ${ white(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes a debug log message.
     *
     * This is best used for events considered to be useful during software debugging when more granular information is needed.
    */
    debug = (...val) => {
        if (this.canOutputAtLevel(LogLevel.DEBUG)) {
            console.info(`[${ this.source }] ${ cyan(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes a trace log message.
     *
     * This is best used to describe events showing step by step execution of your code that can be ignored during the standard operation, but may be useful during extended debugging sessions.
    */
    trace = (...val) => {
        if (this.canOutputAtLevel(LogLevel.TRACE)) {
            console.info(`[${ this.source }]  ${ white(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }


    /** Formats and writes the first portion of a message, using the given state. */
    beginPartial = (minLevel, text, state = LogEntryState.NONE) => {
        if (this.canOutputAtLevel(minLevel)) {
            process.stdout.write(`[${ this.source }] ${ state.color(text) }`);
            this.isPartialOpen = true;
        }
    }

    /** Formats and writes the last portion of a message, on the same line as the first portion, using the given state. */
    endPartial = (minLevel, text, state) => {
        if (!this.canOutputAtLevel(minLevel))
            return;

        if (!this.isPartialOpen) {
            console.info(`[${ this.source }]  ${ state.color(text) }\n`);
            this.isPartialOpen = false;
            return;
        }

        if (text && text.length) {
            state = state || LogEntryState.NONE;
            process.stdout.write(`${ state.color(text) }\n`);
        } else {
            process.stdout.write(`\n`);
        }
    }

    /** Formats and writes a trace log marker.
     *
     * This is best used to highlight specific operations or points in the code, which may be useful during extended debugging sessions.
    */
    mark = (...val) => {
        if (this.canOutputAtLevel(LogLevel.TRACE)) {
            console.info(`[${ this.source }] ${ magenta(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes a success log message.
     *
     * This is best used to highlight a successful operation.
    */
    success = (...val) => {
        if (this.canOutputAtLevel(LogLevel.INFO)) {
            console.log(`[${ this.source }] ${ green(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Writes an informational log message without formatting.
     *
     * This is best applied when an event happened, the event is purely informative and can be ignored during normal operations.
    */
    log = (...val) => { this.raw(...val); }

    /** Writes an informational log message without formatting.
     *
     * This is best applied when an event happened, the event is purely informative and can be ignored during normal operations.
    */
    raw = (...val) => {
        if (this.canOutputAtLevel(LogLevel.INFO)) {
            console.log(...val);
            this.isPartialOpen = false;
        }
    }
}

module.exports = {
    LogEntryState: LogEntryState,
    Logger: Logger,
    LoggerOptions: LoggerOptions,
    LogLevel: LogLevel,
}
