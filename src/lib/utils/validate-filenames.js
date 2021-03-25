const path = require("path");
const fs = require("fs");
const isValidPath = require("is-valid-path");
const logger = require('./logging').getSingleton('json-trim');
const { error, success } = require('./results');

function validateFileNames(source, destination) {
    logger.mark('trim::validateFileNames');
    logger.debug('Validating filenames...');

    if (!fs.existsSync(source)) {
        return error(`Could not find source file [${ source }].`);
    }

    // destination might be null or undefined, which means return it in the pipe
    if (destination) {
        if (!isValidPath(destination)) {
            return error(`${ destination } is not a valid path.`);
        }

        // destination might be a folder.
        // if it is, then re-set it to the original filename, at the destination path.
        const destParts = path.parse(destination);
        if (destParts.base == "") {
            destination = getFilenameAtRoot(source, destParts);
        }

        var destinationFolder = path.dirname(destination);

        if (!fs.existsSync(destinationFolder)) {
            return error(`Destination folder [${ destinationFolder }] does not exist.`);
        }
    }

    logger.debug('Filenames are valid.');
    logger.trace(`  Source:      ${ source }`);
    logger.trace(`  Destination: ${ destination || null }`);
    var result = success({ 'source': source, 'destination': destination });
    return result;
}

function getFilenameAtRoot(source, destParts) {
    const sourceParts = path.parse(source);

    if (destParts.root.length == 0 || destParts.root.slice(-1) != path.sep) {
        destParts.root += path.sep;
    }
    if (destParts.dir.length == 0 || destParts.dir.slice(-1) != path.sep) {
        destParts.dir += path.sep;
    }
    destParts.base = sourceParts.base;
    destParts.ext = sourceParts.ext;
    destParts.name = sourceParts.name;
    const destination = path.format(destParts);
    return destination;
}

module.exports = {
    'validateFileNames': validateFileNames
};
