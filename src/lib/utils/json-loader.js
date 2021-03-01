const fs = require("fs");
const { exit } = require("process");

function load(logger, absolutePath) {
    if (!fs.existsSync(absolutePath)) {
        logger.error(`\nERROR: File [${ absolutePath }] does not exist.`);
        exit(1);
    }

    try {
        var content = require(absolutePath);
    } catch (ex) {
        logger.info(ex);
        logger.error(`\nERROR: File [${ absolutePath }] is not JSON.`);
        exit(1);
    }

    return content;
}

module.exports = (logger, absolutePath) => load(logger, absolutePath);
