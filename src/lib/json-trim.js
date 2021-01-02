"use strict";

const execute = require('./trim/trim');
const logger = require('./utils/logger');
const configBuilder = require('./config/config-builder');

class JsonTrim {
  constructor() { }

  run(args) {
    try {
      const config = configBuilder(args);

      logger.trace('config');
      logger.trace(JSON.stringify(config, null, 2));

      execute(config);
    }
    catch (error) {
      logger.error('args');
      logger.log(JSON.stringify(args));

      // logger.error(`Failed to load '${ configPath }'`);
      logger.error(error);
      process.exit(2);
    }
  }
}

module.exports = JsonTrim;
