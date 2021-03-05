"use strict";

const getConfigObject = require('./config/getConfigObject');
const execute = require('./trim/trim');
const logger = require('./utils/logging').getSingleton('json-trim');

class JsonTrim {

    run(args) {
        // args may be empty, since it could all be handled by the default config file.
        logger.mark('json-trim::run');
        logger.debug('Starting json-trim.');

        const options = getConfigObject(args);
        return execute(options);
    }
}

module.exports = JsonTrim;
