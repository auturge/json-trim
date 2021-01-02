const { exit } = require("process");
const logger = require("../utils/logger");

/** Validate a config object. */
function validate(config) {

  if (!config) {
    logger.error('ERROR: Could not resolve configuration.');
    exit(2);
  }

  if (!config.source) {
    logger.error('ERROR: Source file not specified.');
    exit(2);
  }

  if (!config.destination) {
    logger.error('ERROR: Destination file not specified.');
    exit(2);
  }

}

module.exports = (config) => validate(config);
