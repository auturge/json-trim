"use strict";

const title = 'json-trim';

const { coloretteOptions } = require('colorette');
const levenshtein = require('fastest-levenshtein');

const argParser = require('./cli/arg-parser');
const { flags } = require('./cli/cli-flags');
const { isCommandUsed } = require('./cli/arg-utils');
const getLogger = require('./logging/get-logger');
const JsonTrim = require('./json-trim');
const EXIT_CODES = require('./errors/EXIT_CODES');

process.title = title;

const runCLI = async (cliArgs) => {
    const parsedArgs = argParser(flags, cliArgs, true, process.title);
    const logger = getLogger(title, parsedArgs.opts, parsedArgs.isTestMode);
    logger.mark('runCLI::runCLI');
    logger.debug('Initializing json-trim...');

    // Enable/Disable colors
    if (typeof parsedArgs.opts.color !== 'undefined') {
        coloretteOptions.enabled = Boolean(parsedArgs.opts.color);
    }

    const commandIsUsed = isCommandUsed(cliArgs);
    if (commandIsUsed) {
        return;
    }

    try {
        const trim = new JsonTrim(logger);

        // handle unknown args
        if (parsedArgs.unknownArgs.length > 0) {
            parsedArgs.unknownArgs.forEach(async (unknown) => {
                logger.error(`Unknown argument: ${ unknown }`);

                const strippedFlag = unknown.substr(2);
                const found = flags.find((flag) => levenshtein.distance(strippedFlag, flag.name) < 3);
                if (found) {
                    logger.raw(`Did you mean --${ found.name }?`);
                }
            });

            process.exit(EXIT_CODES.INVALID_COMMAND_LINE);
        }

        const opts = parsedArgs.opts;

        logger.debug('CLI options initialized.');
        return trim.run(opts);
    }
    catch (error) {
        var exitCode = EXIT_CODES.FAILURE;

        if (error.internal) {
            exitCode = error.exitCode;
            logger.error(error.message);
        } else {
            logger.error(error);
        }

        process.exit(exitCode);
    }
}

module.exports = runCLI;
