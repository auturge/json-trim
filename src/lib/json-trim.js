"use strict";

const generateRuntimeConfiguration = require('./config/config-builder');
const execute = require('./trim/trim');
const getLogger = require('./logging/get-logger');

class JsonTrim {

    logger = null;

    constructor(logger) {
        const loggerSource = 'json-trim';
        this.logger = logger || getLogger(loggerSource, args, false);
    }

    run(args) {
        // args may be empty, since it could all be handled by the default config file.
        this.logger.mark('json-trim::run');
        this.logger.debug('Starting json-trim.');

        const options = generateRuntimeConfiguration(this.logger, args);
        return execute(this.logger, options);
    }
}

module.exports = JsonTrim;
