
const path = require("path");
const fs = require("fs");
const isValid = require("is-valid-path");
const { exit } = require("process");
const LogLevel = require("../logging/LogLevel");
const LogState = require("../logging/LogState");

function validateFileNames(logger, source, target) {
    logger.mark('trim::validateFileNames');
    logger.debug('Validating filenames...');

    if (!fs.existsSync(source)) {
        logger.error(`Could not find source file [${ source }].`);
        exit(1);
    }

    // target might be null or undefined, which means return it in the pipe
    if (target) {
        if (!isValid(target)) {
            logger.error(`${ target } is not a valid path.`);
            exit(1);
        }

        // const targetFolder = target.match(/(.*)[\/\\]/)[ 1 ] || '';
        const targetFolder = target.match(/(.*)[\\]/)[ 1 ] || '';
        if (!fs.existsSync(targetFolder)) {
            console.error(`Target folder [${ targetFolder }] does not exist.`);
            exit(1);
        }
    }

    logger.debug('Filenames are valid.');
    logger.trace(`  Source: ${ source }`);
    logger.trace(`  Target: ${ target || "<return as function return value>" }`);
}

function execute(logger, config) {
    logger.mark('trim::execute');
    logger.debug('Preparing the trim engine...');
    logger.trace('config:', config);
    validateFileNames(logger, config.source, config.destination);
    return trim(logger, config.source, config.destination, config.keylist);
}

function trim(logger, source, target, keylist) {
    logger.mark('trim::trim');
    logger.debug('Starting the trim engine.');

    if (!source) {
        logger.error('No source filename provided.');
        exit(1);
    }
    // if target is missing, then don't try to write a file: return the result in the pipe.

    // resolve the relative paths
    let sourceFilePath = path.resolve(source);
    let targetFilePath = target ? path.resolve(target) : null;

    logger.beginPartial(LogLevel.WARN, "Trimming json... ");
    logger.endPartial(LogLevel.DEBUG);

    logger.debug(` `);
    logger.debug(`    SOURCE:    ${ sourceFilePath }`);
    logger.debug(`    TARGET:    ${ targetFilePath }`);
    logger.debug(`    KEYS:      ${ keylist }`);

    // get the source
    logger.debug(` `);
    logger.debug(`    Reading file at '${ sourceFilePath }'.`);
    let sourceFile = fs.readFileSync(sourceFilePath, 'utf8');

    logger.trace(`   Source File:`, sourceFile);

    // create a clone in memory, keeping only the desired parts
    let clone = JSON.parse(sourceFile);
    if (keylist) {
        for (let key in clone) {
            if (Object.prototype.hasOwnProperty.call(clone, key)) {
                if (!keylist.includes(key)) {
                    logger.debug(`      Removing key '${ key }'.`);
                    delete clone[ key ];
                }
            }
        }
    } else {
        logger.debug('      No parts specified. Cloning the entire file.');
    }

    let json = JSON.stringify(clone, null, 2);

    // save the clone
    if (targetFilePath) {
        logger.debug(`    Writing file to '${ targetFilePath }'.`);
        logger.trace(`   Output json:`, json);
        fs.writeFileSync(targetFilePath, json, 'utf8');
    }

    // done!
    logger.endPartial(LogLevel.ERROR, " done!", LogState.SUCCESS);

    return json;
}

module.exports = (logger, config) => execute(logger, config);
