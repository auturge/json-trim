const fs = require("fs");
const isValidPath = require("is-valid-path");

class LoadResult {
    content = undefined;
    error = undefined;
}

function load(absolutePath) {
    var result = new LoadResult();

    if (absolutePath == null || !absolutePath.length) {
        result.error = "Argument [absolutePath] must not be null, undefined, or empty string.";
        return result;
    }

    if (!isValidPath(absolutePath)) {
        result.error = `Argument [absolutePath] is not a valid path: ${ absolutePath }`;
        return result;
    }

    if (!fs.existsSync(absolutePath)) {
        result.error = `File [${ absolutePath }] does not exist.`;
        return result;
    }

    try {
        var file = fs.readFileSync(absolutePath, 'utf-8');
    } catch (ex) {
        result.error = `Could not load file [${ absolutePath }].`;
        return result;
    }

    try {
        var content = JSON.parse(file);
    } catch (ex) {
        result.error = `File [${ absolutePath }] is not JSON.`;
        return result;
    }

    result.content = content;
    return result;
}

module.exports = { load: load };
