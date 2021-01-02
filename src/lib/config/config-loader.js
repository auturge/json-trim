const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const logger = require('../utils/logger');
const configResolver = require('@auturge/config-resolver');

// reads a config file
function loadConfigFile(configPath, options) {

  const absolutePath = configPath ? path.join(process.cwd(), configPath) : '';

  // provide the 'default' path for the config file (always a 'function'-type configuration)
  const resolverOptions = { alternatives: [ { path: './trim.config.js', type: 'function' } ] };

  if (configPath) {
    configPath = configPath.trim();
    logger.trace(`Checking config path: [${ configPath }]`);
    if (!fs.existsSync(absolutePath)) {
      logger.error(`ERROR: Config file [${ absolutePath }] does not exist.`);
      exit(2);
    }
    logger.success(`Using config at: [${ configPath }]`);
    resolverOptions.explicit = { path: absolutePath, type: 'function' }
  }

  // use these options to TRY to get the config file.
  let config;
  try {
    config = configResolver.resolveConfig(resolverOptions);
  } catch (error) {
    logger.error(`ERROR: Could not load config file [${ absolutePath }].`);
    logger.error(error);
    exit(1);
  }

  // if the user didn't specify a config file, and we couldn't find an alternative, then return null.
  if (!resolverOptions.explicit && !config) {
    return null;
  }

  // json-trim only supports function-type config files. Validate this.
  if (!isFunction(config)) {
    const message = configPath ? `ERROR: Config file [${ absolutePath }] does not export a function.` : `ERROR: Config file does not export a function.`;
    logger.error(message);
    exit(2);
  }

  // Run the function and return the results.
  let result;
  try {
    result = config(options);
  } catch (error) {
    logger.error(`ERROR: Config function threw an error.`);
    logger.error(error);
    exit(2);
  }

  return result;
}

function isFunction(toCheck) {
  return toCheck && {}.toString.call(toCheck) === '[object Function]';
}

module.exports = (configPath, options) => {
  return loadConfigFile(configPath, options);
}
