const EXIT_CODES = require("./EXIT_CODES");

function throwError(message, error, exitCode = EXIT_CODES.INTERNAL_ERROR) {
    var errorToThrow = error || new Error(message);
    errorToThrow.exitCode = exitCode || EXIT_CODES.INTERNAL_ERROR;
    errorToThrow.internal = true;
    errorToThrow.exceptional = false;
    throw errorToThrow;
}

module.exports = (message, error, exitCode) => throwError(message, error, exitCode);
