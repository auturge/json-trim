const fs = require("fs");

class LoadResult {
    content = undefined;
    error = undefined;
}

function load(logger, absolutePath) {
    if (!logger) {
        throw new Error("Argument [logger] must not be null or undefined.");
    }
    if (absolutePath == null || !absolutePath.length) {
        throw new Error("Argument [absolutePath] must not be null, undefined, or empty string.");
    }

    var result = new LoadResult();

    logger.trace('checking if file exists...');
    if (!fs.existsSync(absolutePath)) {
        result.error = `File [${ absolutePath }] does not exist.`;
        return result;
    }

    logger.trace('loading file...');
    try {
        var file = fs.readFileSync(absolutePath, 'utf-8');
    } catch (ex) {
        result.error = `Could not load file [${ absolutePath }].`;
        return result;
        // logger.info(ex);
        // logger.error(`\nERROR: Could not load file [${ absolutePath }].`);
        // exit(1);
    }

    logger.trace('parsing loaded file...');
    try {
        var content = JSON.parse(file);
    } catch (ex) {
        result.error = `File [${ absolutePath }] is not JSON.`;
        return result;
        // logger.info(ex);
        // logger.error(`\nERROR: File [${ absolutePath }] is not JSON.`);
        // exit(1);
    }

    logger.trace('JSON parsed successfully.');
    result.content = content;
    return result;
}

module.exports = (logger, absolutePath) => load(logger, absolutePath);
