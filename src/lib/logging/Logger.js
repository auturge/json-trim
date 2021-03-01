const util = require('util');
const { red, cyan, yellow, green, white, magenta } = require('colorette');
const LogLevel = require('./LogLevel');
const LogState = require('./LogState');

// TODO Figure out logging
// Verbose should show any level
// default should show success, error, warn, info, log
// "quiet" should show only error

// TODO parse log level from string, not number


class Logger {

    /** The default log level (INFO) */
    static DEFAULT_LOG_LEVEL = LogLevel.INFO;

    isPartialOpen = false;

    /** The log level */
    logLevel = Logger.DEFAULT_LOG_LEVEL;

    makeQuiet = () => { this.logLevel = LogLevel.ERROR; }
    makeVerbose = () => { this.logLevel = LogLevel.TRACE; }

    configure = (source, loglevel) => {
        this.source = source || '';
        this.logLevel = loglevel || this.logLevel;
    }

    error = (...val) => {
        if (this.logLevel >= LogLevel.ERROR) {
            console.error(`[${ this.source }] ${ red(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    warn = (...val) => {
        if (this.logLevel >= LogLevel.WARN) {
            console.warn(`[${ this.source }] ${ yellow(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    info = (...val) => {
        if (this.logLevel >= LogLevel.INFO) {
            console.info(`[${ this.source }] ${ white(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    debug = (...val) => {
        if (this.logLevel >= LogLevel.DEBUG) {
            console.info(`[${ this.source }] ${ cyan(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    trace = (...val) => {
        if (this.logLevel >= LogLevel.TRACE) {
            console.info(`[${ this.source }]  ${ white(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    beginPartial = (minLevel, text) => {
        if (this.logLevel >= minLevel) {
            process.stdout.write(`[${ this.source }] ${ text }`);
            this.isPartialOpen = true;
        }
    }

    endPartial = (minLevel, text, state) => {
        if (this.logLevel < minLevel)
            return;

        if (!this.isPartialOpen) {
            console.info(`[${ this.source }]  ${ state.color(text) }\n`);
            this.isPartialOpen = false;
            return;
        }

        if (text && text.length) {
            state = state || LogState.NONE;
            process.stdout.write(`${ state.color(text) }\n`);
        } else {
            process.stdout.write(`\n`);
        }
    }

    mark = (...val) => {
        if (this.logLevel >= LogLevel.TRACE) {
            console.info(`[${ this.source }] ${ magenta(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    success = (...val) => {
        if (this.logLevel >= LogLevel.INFO) {
            console.log(`[${ this.source }] ${ green(util.format(...val)) }`);
            this.isPartialOpen = false;
        }
    }

    log = (...val) => { this.raw(...val); }

    raw = (...val) => {
        if (this.logLevel >= LogLevel.INFO) {
            console.log(...val);
            this.isPartialOpen = false;
        }
    }
}

module.exports = Logger;
