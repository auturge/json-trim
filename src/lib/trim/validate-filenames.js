const path = require("path");
const fs = require("fs");
const isValidPath = require("is-valid-path");
const logger = require('../utils/logging').getSingleton('json-trim');
const { error, success } = require('../utils/results');

function validateFileNames(source, destination) {
    logger.mark('validate-filenames::validateFileNames');
    logger.debug('Validating filenames...');

    console.log('source', source);
    console.log('destination', destination);

    if (!fs.existsSync(source)) {
        return error(`Could not find source file [${ source }].`);
    }
    logger.trace(`  Source:      ${ source }`);

    // destination might be null or undefined, which is fine.
    // That just means we should return the result in the pipe.
    if (!destination) {
        logger.trace(`  Destination: <pipe>`);
        return success({ 'source': source, 'destination': null });
    }

    if (!isValidPath(destination)) {
        return error(`${ destination } is not a valid path.`);
    }

    // destination might be a folder.
    // if it is, then re-set it to the original filename,
    // at the destination path.
    const sourceParts = path.parse(source);
    var destParts = path.parse(destination);
    if (destParts.base == "") {
        destParts = getFileAtDestinationFolder(sourceParts, destParts);
    }

    destParts = addPathSeparatorsIfNecessary(destParts);

    if (!fs.existsSync(destParts.dir)) {
        return error(`Destination folder [${ destParts.dir }] does not exist.`);
    }

    destination = path.format(destParts);

    logger.trace(`  Destination: ${ destination }`);
    var result = success({ 'source': source, 'destination': destination });
    return result;
}

function getFileAtDestinationFolder(sourceParts, destParts) {
    destParts.base = sourceParts.base;
    destParts.ext = sourceParts.ext;
    destParts.name = sourceParts.name;
    return destParts;
}

function addPathSeparatorsIfNecessary(destParts) {
    var result = Object.assign({}, destParts);
    if (process.platform === "win32") {
        if (destParts.root.length == 0 || destParts.root.slice(-1) != path.sep) {
            result.root += path.sep;
            result.dir += path.sep;
        }
    }
    return result;
}

module.exports = {
    'validateFileNames': validateFileNames
};
