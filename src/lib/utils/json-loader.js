const fs = require("fs");
const logger = require("./logger");
const { exit } = require("process");

function load(absolutePath) {
    if (!fs.existsSync(absolutePath)) {
        logger.error(`\nERROR: File [${absolutePath}] does not exist.`);
        exit(1);
    }

    try {
        var content = require(absolutePath);
    } catch (ex) {
        logger.info(ex);
        logger.error(`\nERROR: File [${absolutePath}] is not JSON.`);
        exit(1);
    }

    return content;
}

function isJSON(content) {
    // All JSON objects are objects.
    // this basically asks, is this of type object (and not null)

    console.log('content', content);

    var isObj = typeof content === 'object' && content !== null;
    console.log('is object', isObj);

    return isObj;
}

module.exports = (absolutePath) => load(absolutePath);
