const EXIT_CODES = {

    // Unix/POSIX - success
    SUCCESS: 0,

    // Unix/POSIX - internal error (i.e., exception)
    FAILURE: 1,

    // Unix/POSIX - invalid command-line usage
    INVALID_COMMAND_LINE: 2,

    // An error was thrown by a call to an external library
    EXTERNAL_ERROR: 10,

    // A user error from providing invalid configuration options
    CONFIGURATION_ERROR: 20,

    // A user error from providing an invalid configuration file
    INVALID_CONFIG_FILE: 21,

    // An error was thrown when executing the function of a .js config file.
    CONFIG_FUNCTION_ERROR: 22,

    // An internal error without explanantion
    EXCEPTIONAL_ERROR: 128
};

function throwError(message, error, exitCode = EXIT_CODES.INTERNAL_ERROR) {
    var errorToThrow = error || new Error(message);
    errorToThrow.exitCode = exitCode || EXIT_CODES.INTERNAL_ERROR;
    errorToThrow.internal = true;
    errorToThrow.exceptional = false;
    throw errorToThrow;
}

function throwException(message, error, exitCode) {
    var exception = error || new Error(message);
    exception.exitCode = exitCode || EXIT_CODES.EXCEPTIONAL_ERROR;
    exception.internal = true;
    exception.exceptional = true;
    throw exception;
}

module.exports = {
    throwError: throwError,
    throwException: throwException,
    EXIT_CODES: EXIT_CODES
}
