// const { Logger } = require('../../utils/logging');
const { defaultCommands } = require('../commands');
const { isCommandUsed } = require('../arg-utils');
const { commands, allNames, hasUnknownArgs } = require('../unknown-args');

const logger = require('../../utils/logging').getSingleton('json-trim');

const outputVersion = (args) => {
    // This is used to throw err when there are multiple command along with version
    const commandsUsed = args.filter((val) => commands.includes(val));

    // The command with which version is invoked
    const commandUsed = isCommandUsed(args);
    const invalidArgs = hasUnknownArgs(args, allNames);
    if (commandsUsed && commandsUsed.length === 1 && invalidArgs.length === 0) {
        try {
            if ([ commandUsed.alias, commandUsed.name ].some((pkg) => commandsUsed.includes(pkg))) {
                const { name, version } = require(`json-trim/${ defaultCommands[ commandUsed.name ] }/package.json`);
                logger.raw(`\n${ name } ${ version }`);
            } else {
                const { name, version } = require(`${ commandUsed.name }/package.json`);
                logger.raw(`\n${ name } ${ version }`);
            }
        } catch (e) {
            logger.error('Error: External package not found.');
            return process.exit(2);
        }
    }

    if (commandsUsed.length > 1) {
        logger.error('You provided multiple commands. Please use only one command at a time.\n');
        return process.exit(2);
    }

    if (invalidArgs.length > 0) {
        const argType = invalidArgs[ 0 ].startsWith('-') ? 'option' : 'command';
        logger.error(`Error: Invalid ${ argType } '${ invalidArgs[ 0 ] }'.`);
        logger.info('Run json-trim --help to see available commands and arguments.\n');
        return process.exit(2);
    }

    const pkgJSON = require('../../../../package.json');
    logger.raw(`\njson-trim ${ pkgJSON.version }\n`);
};

module.exports = { 'run': outputVersion };
