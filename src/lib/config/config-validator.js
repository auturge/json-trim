const throwError = require("../errors/throw-error");
const EXIT_CODES = require("../errors/EXIT_CODES");

/** Validate a config object. */
function validate(logger, config) {

    logger.mark('config-validator::validate');
    logger.debug('Validating the final runtime configuration object.');

    logger.trace('  config:', JSON.stringify(config, null, 2));

    function isFieldMissing(field) {
        // determine if the property is null or undefined (unset).
        if (!config) return true;
        return config[ field ] == null;
    }

    function throwIfMissing(field) {
        if (isFieldMissing(field)) {
            throwError(`Could not resolve configuration: '${ field }' is not defined.`, null, EXIT_CODES.CONFIGURATION_ERROR);
        }
    }

    function throwIfEmpty(field) {
        throwIfMissing(field);
        if (config[ field ].trim() === "") {
            throwError(`Property '${ field }' must not be an empty string.`, null, EXIT_CODES.CONFIGURATION_ERROR);
        }
    }

    if (!config) {
        // This SHOULD never happen, since this method is called after merging
        // the loaded config with a default config...
        throwError('Could not resolve configuration.', null, EXIT_CODES.CONFIGURATION_ERROR);
    }

    throwIfMissing('source');
    throwIfEmpty('source');
}

module.exports = (logger, config) => validate(logger, config);
