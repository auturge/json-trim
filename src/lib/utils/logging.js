const util = require('util');
const { red, cyan, yellow, green, white, magenta } = require('colorette');

/** Constructor options that the `Logger` will consider. */
class LoggerOptions {
    name = "";

    debug = false;
    quiet = false;
    silent = false;
    verbose = false;

    static get DEFAULT() {
        return Object.freeze(new LoggerOptions());
    }

    constructor(opts) {
        if (!opts) return;
        if (opts.name) { this.name = opts.name; }
        if (opts.debug) { this.debug = true; }
        if (opts.quiet) { this.quiet = true; }
        if (opts.silent) { this.silent = true; }
        if (opts.verbose) { this.verbose = true; }
    }
}

/** Defines logging severity levels. */
class LogLevel {

    name = "";
    index = -1;
    color = white;

    constructor(name, index, colorFunc) {
        if (name == null || !name.length) {
            throw new Error(`Cannot create a LogLevel with no name.`);
        }
        if (index == null) {
            throw new Error(`Cannot create a LogLevel with no index.`);
        }
        if (colorFunc == null) {
            throw new Error(`Cannot create a LogLevel with no color function.`);
        }

        this.name = Object.freeze(name.toUpperCase());
        this.index = Object.freeze(index);
        this.color = Object.freeze((...val) => util.format(colorFunc(...val)));

        this.valueOf = function () {
            return this.index;
        }

        this.toString = function () {
            return this.name;
        }
    }

    /** A log level used in the rare event that all output should be suppressed, as in unit testing. */
    static SILENT = Object.freeze(new LogLevel("SILENT", 0, white));

    /** A log level used when one or more key business functionalities are not working and the whole system doesn’t fulfill the business functionalities. */
    static FATAL = Object.freeze(new LogLevel("FATAL", 1, red));

    /** A log level used when one or more functionalities are not working, preventing some functionalities from working correctly. */
    static ERROR = Object.freeze(new LogLevel("ERROR", 2, red));

    /** A log level used when unexpected behavior happened inside the application, but it is continuing its work and the key business features are operating as expected. */
    static WARN = Object.freeze(new LogLevel("WARN", 3, yellow));

    /** A log level used when an event happened, the event is purely informative and can be ignored during normal operations. */
    static INFO = Object.freeze(new LogLevel("INFO", 4, white));

    /** A log level used for events considered to be useful during software debugging when more granular information is needed. */
    static DEBUG = Object.freeze(new LogLevel("DEBUG", 5, cyan));

    /** A log level describing events showing step by step execution of your code that can be ignored during the standard operation, but may be useful during extended debugging sessions. */
    static TRACE = Object.freeze(new LogLevel("TRACE", 6, white));

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

function validateLogLevelOptions(loggerOptions) {

    if (loggerOptions && loggerOptions.verbose && loggerOptions.quiet) {
        throw new Error('Logger cannot be both quiet and verbose.');
    }

    if (loggerOptions && loggerOptions.verbose && loggerOptions.silent) {
        throw new Error('Logger cannot be both silent and verbose.');
    }

    if (loggerOptions && loggerOptions.quiet && loggerOptions.silent) {
        throw new Error('Logger cannot be both quiet and silent.');
    }
}

function getLogLevel(loggerOptions, defaultLogLevel = DEFAULT_LOG_LEVEL) {
    validateLogLevelOptions(loggerOptions);

    var logLevel = defaultLogLevel;

    if (loggerOptions != null) {
        if (loggerOptions.quiet) {
            logLevel = LogLevel.ERROR;
        }
        else if (loggerOptions.debug) {
            logLevel = LogLevel.DEBUG;
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
        if (name == null || !name.length) {
            throw new Error(`Cannot create a LogEntryState with no name.`);
        }
        if (index == null) {
            throw new Error(`Cannot create a LogEntryState with no index.`);
        }
        if (colorFunc == null) {
            throw new Error(`Cannot create a LogEntryState with no color function.`);
        }

        this.name = Object.freeze(name.toUpperCase());
        this.index = Object.freeze(index);
        this.color = Object.freeze((...val) => util.format(colorFunc(...val)));

        this.valueOf = function () {
            return this.index;
        }

        this.toString = function () {
            return this.name;
        }
    }

    /** A log state used when no state is declared. */
    static NONE = Object.freeze(new LogEntryState("NONE", -1, white));

    /** A log state that describes a successful operation. */
    static SUCCESS = Object.freeze(new LogEntryState("SUCCESS", 0, green));

    /** A log state used when something has failed. Not necessarily an error. */
    static FAILURE = Object.freeze(new LogEntryState("FAILURE", 2, red));

    /** A log state used when unexpected behavior happened inside the application, but it is continuing its work and the key business features are operating as expected. */
    static WARN = Object.freeze(new LogEntryState("WARN", 1, yellow));

    /** A log state used when one or more functionalities are not working, preventing some functionalities from working correctly. */
    static ERROR = Object.freeze(new LogEntryState("ERROR", 3, red));

    static list = Object.freeze([ LogEntryState.NONE, LogEntryState.SUCCESS, LogEntryState.FAILURE, LogEntryState.WARN, LogEntryState.ERROR ]);
}

/** A class used to perform simple console logging. */
class Logger {

    /** Should the logger output anything at all? */
    enabled = true;

    /** Is the logger waiting to complete a line of text? */
    isPartialOpen = false;

    /** The log level */
    logLevel = DEFAULT_LOG_LEVEL;

    static getInstance(name, options) {
        options = options || new LoggerOptions();
        options.name = name;
        return new Logger(options);
    }

    static _singleton = null;
    static getSingleton(name, options = new LoggerOptions()) {
        if (!Logger._singleton) {
            Logger._singleton = this.getInstance(name, options);
        }
        return Logger._singleton;
    }

    constructor(options) {
        if (!options) {
            return;
        }
        const logLevel = getLogLevel(options);
        this.name = options.name || '';
        this.setLevel(logLevel);
    }

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

    /** Sets the log level. */
    setLevel(logLevel) {
        if (!logLevel) {
            throw new Error(`Argument [logLevel] must not be null or undefined.`);
        }
        this.logLevel = logLevel;
        this.enabled = (this.logLevel != LogLevel.SILENT);
        return this;
    }

    /** Sets the log level using `LoggerOptions`. */
    setOptions(options) {
        const opts = new LoggerOptions(options);
        this.logLevel = getLogLevel(opts);
    }

    /** Checks if the logger can/should display output at the given level. */
    canOutputAtLevel(logLevel) {
        return (this.logLevel >= logLevel && this.enabled);
    }

    /** Formats and writes a fatal log message.
     *
     * This is best applied when one or more key business functionalities are not working
     * and the whole system doesn’t fulfill the business functionalities.
    */
    fatal(...val) {
        if (this.canOutputAtLevel(LogLevel.FATAL)) {
            console.error(`[${ this.name }] ${ red(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes an error log message.
     *
     * This is best applied when one or more functionalities are not working, preventing some functionalities from working correctly.
    */
    error(...val) {
        if (this.canOutputAtLevel(LogLevel.ERROR)) {
            console.error(`[${ this.name }] ${ red(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes a warning log message.
     *
     * This is best applied when unexpected behavior happened inside the application, but it is continuing its work and the key business features are operating as expected. */
    warn(...val) {
        if (this.canOutputAtLevel(LogLevel.WARN)) {
            console.warn(`[${ this.name }] ${ yellow(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes an informational log message.
     *
     * This is best applied when an event happened, the event is purely informative and can be ignored during normal operations.
    */
    info(...val) {
        if (this.canOutputAtLevel(LogLevel.INFO)) {
            console.info(`[${ this.name }] ${ white(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes a debug log message.
     *
     * This is best used for events considered to be useful during software debugging when more granular information is needed.
    */
    debug(...val) {
        if (this.canOutputAtLevel(LogLevel.DEBUG)) {
            console.info(`[${ this.name }] ${ cyan(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes a trace log message.
     *
     * This is best used to describe events showing step by step execution of your code that can be ignored during the standard operation, but may be useful during extended debugging sessions.
    */
    trace(...val) {
        if (this.canOutputAtLevel(LogLevel.TRACE)) {
            console.info(`[${ this.name }] ${ white(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes a trace log marker.
     *
     * This is best used to highlight specific operations or points in the code, which may be useful during extended debugging sessions.
    */
    mark(...val) {
        if (this.canOutputAtLevel(LogLevel.TRACE)) {
            console.info(`[${ this.name }] ${ magenta(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes a success log message.
     *
     * This is best used to highlight a successful operation.
    */
    success(...val) {
        if (this.canOutputAtLevel(LogLevel.INFO)) {
            console.info(`[${ this.name }] ${ green(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    /** Writes an informational log message without formatting.
     *
     * This is best applied when an event happened, the event is purely informative and can be ignored during normal operations.
    */
    log(...val) { this.raw(...val); }

    /** Writes an informational log message without formatting.
     *
     * This is best applied when an event happened, the event is purely informative and can be ignored during normal operations.
    */
    raw(...val) {
        if (this.canOutputAtLevel(LogLevel.INFO)) {
            console.log(...val);
            this.isPartialOpen = false;
        }
    }

    /** Formats and writes the first portion of a message, using the given state. */
    beginPartial(level, text, state) {
        if (!this.canOutputAtLevel(level))
            return;

        const color = (state == null) ? level.color : state.color;
        process.stdout.write(`[${ this.name }] ${ color(text) }`);
        this.isPartialOpen = true;
    }

    /** Formats and writes the last portion of a message, on the same line as the first portion, using the given state. */
    endPartial(level, text, state) {
        if (!this.canOutputAtLevel(level))
            return;

        const color = (state == null) ? level.color : state.color;

        var message;
        if (text && text.length) {
            message = `${ color(text) }\n`;
        } else {
            message = `\n`;
        }

        if (this.isPartialOpen) {
            process.stdout.write(message);
        }
        else {
            if (text && text.length) {
                console.info(`[${ this.name }] ${ message }`);
            }
            else {
                console.info(`${ message }`);
            }
        }
        this.isPartialOpen = false;
    }
}

module.exports = {
    LogEntryState: LogEntryState,
    Logger: Logger,
    LoggerOptions: LoggerOptions,
    LogLevel: LogLevel,
    getLogLevel: getLogLevel,
    DEFAULT_LOG_LEVEL: DEFAULT_LOG_LEVEL,
    getInstance: Logger.getInstance,
    getSingleton: Logger.getSingleton
}
