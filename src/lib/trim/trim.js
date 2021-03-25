
const path = require("path");
const fs = require("fs");
const { validateFileNames } = require('../utils/validate-filenames');
const { LogLevel, LogEntryState } = require("../utils/logging");
const { error } = require('../utils/results');
const JSONLoader = require('../utils/json-loader');

const logger = require('../utils/logging').getSingleton('json-trim');

function execute(config) {
    logger.mark('trim::execute');
    logger.debug('Preparing the trim engine...');
    logger.trace('config:', config);

    var validated = validateFileNames(config.source, config.destination);
    if (validated.error)
        return validated;

    return trim(validated.source, validated.destination, config.keylist);
}

function trim(source, destination, keylist) {
    logger.mark('trim::trim');
    logger.debug('Starting the trim engine.');

    // if destination is missing, then don't try to write a file: return the result in the pipe.

    // resolve the relative paths
    let sourceFilePath = path.resolve(source);
    let destinationFilePath = destination ? path.resolve(destination) : null;

    logger.beginPartial(LogLevel.INFO, "Trimming json... ", LogEntryState.NONE);

    logger.endPartial(LogLevel.DEBUG);
    logger.debug(` `);
    logger.debug(`    SOURCE:      ${ sourceFilePath }`);
    logger.debug(`    DESTINATION: ${ destinationFilePath }`);
    logger.debug(`    KEYS:        ${ keylist }`);

    // get the source
    logger.debug(` `);
    logger.debug(`    Reading file at '${ sourceFilePath }'.`);
    let loadResult = JSONLoader.load(sourceFilePath);
    if (loadResult.error) {
        return error(`${ loadResult.error }`);
    }

    logger.trace(`   Source File:`, loadResult.content);

    // create a clone in memory, keeping only the desired parts
    let clone = JSON.parse(JSON.stringify(loadResult.content));
    if (keylist) {
        for (let key in clone) {
            if (!keylist.includes(key)) {
                logger.debug(`      Removing key '${ key }'.`);
                delete clone[ key ];
            }
        }
    } else {
        logger.debug('      No parts specified. Cloning the entire file.');
    }

    let jsonString = JSON.stringify(clone, null, 2);

    // save the clone
    if (destinationFilePath) {
        logger.debug(`    Writing file to '${ destinationFilePath }'.`);
        logger.trace(`   Output json:`, jsonString);
        fs.writeFileSync(destinationFilePath, jsonString, 'utf8');
    }

    // done!
    logger.endPartial(LogLevel.INFO, " done!", LogEntryState.SUCCESS);

    return clone;
}

module.exports = (config) => execute(config);
