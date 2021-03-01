const EXIT_CODES = require("./EXIT_CODES");

function throwException(message, error, exitCode) {
    var exception = error || new Error(message);
    exception.exitCode = exitCode || EXIT_CODES.EXCEPTIONAL_ERROR;
    exception.internal = true;
    exception.exceptional = true;
    throw exception;
}

module.exports = (message, error, exitCode) => throwException(message, error, exitCode);
