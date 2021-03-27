"use strict";

const pkgJSON = require('../../package.json');
const title = pkgJSON.name;
process.title = title;

const { options: coloretteOptions } = require('colorette');
const levenshtein = require('fastest-levenshtein');

const { CLIHelpProvider } = require('./utils/CLIHelpProvider');
const { ArgParser } = require('./utils/ArgParser');
const { EXIT_CODES } = require('./utils/errors');
const logger = require('./utils/logging').getSingleton('json-trim');
const { flags, groups } = require('./trim/cli-options');
const JsonTrim = require('./JsonTrim');

const runCLI = (cliArgs) => {

    CLIHelpProvider
        .configure(pkgJSON, flags, logger)
        .handle(cliArgs);

    const parsedArgs = ArgParser
        .configure(title, flags, groups, logger)
        .parse(cliArgs, true);

    logger.setOptions(parsedArgs.opts);

    logger.mark('runCLI::runCLI');
    logger.debug('Initializing json-trim...');

    // Enable/Disable colors
    if (typeof parsedArgs.opts.color !== 'undefined') {
        coloretteOptions.enabled = Boolean(parsedArgs.opts.color);
    }

    try {
        const trim = new JsonTrim();

        // handle unknown args
        if (parsedArgs.unknownArgs.length > 0) {
            parsedArgs.unknownArgs.forEach(async (unknown) => {
                const message = `Unknown argument: ${ unknown }`;
                logger.error(message);
                // console.error(message);

                const strippedFlag = unknown.substr(2);
                const found = flags.find((flag) => levenshtein.distance(strippedFlag, flag.name) < 3);
                if (found) {
                    logger.raw(`Did you mean --${ found.name }?`);
                }
            });

            return process.exit(EXIT_CODES.INVALID_COMMAND_LINE);
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

        return process.exit(exitCode);
    }
}

module.exports = { runCLI };
