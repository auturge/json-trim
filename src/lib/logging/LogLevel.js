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

module.exports = LogLevel;
