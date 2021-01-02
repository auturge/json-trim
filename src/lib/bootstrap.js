"use strict";

const argParser = require('./cli/arg-parser');
const { flags } = require('./cli/cli-flags');
const { isCommandUsed } = require('./cli/arg-utils');
const logger = require('./utils/logger');
const JsonTrim = require('./json-trim');

process.title = 'json-trim';

const runCLI = async (cliArgs) => {
  const parsedArgs = argParser(flags, cliArgs, true, process.title);

  // Enable/Disable colors
  if (typeof parsedArgs.opts.color !== 'undefined') {
    coloretteOptions.enabled = Boolean(parsedArgs.opts.color);
  }

  const commandIsUsed = isCommandUsed(cliArgs);
  if (commandIsUsed) {
    return;
  }

  try {
    const trim = new JsonTrim();

    // handle unknown args
    if (parsedArgs.unknownArgs.length > 0) {
      parsedArgs.unknownArgs.forEach(async (unknown) => {
        logger.error(`Unknown argument: ${ unknown }`);

        const strippedFlag = unknown.substr(2);
        const found = flags.find((flag) => leven(strippedFlag, flag.name) < 3);
        if (found) {
          logger.raw(`Did you mean --${ found.name }?`);
        }
      });

      process.exit(2);
    }

    const opts = parsedArgs.opts;

    trim.run(opts);
  }
  catch (error) {
    logger.error(error);
    process.exit(2);
  }
}

module.exports = runCLI;
