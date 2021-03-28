
const path = require('path');
const isValidPath = require('is-valid-path');
const JSONLoader = require('./json-loader');

const ExpectedGetResult = {
    "name": null,
    "description": null,
    "version": null,
    "author": null,
    "license": null,
    "bugs": null,
    "homepage": null,
    "repository": null,
}

/** A class for dealing with metadata stored in package.json. */
class PackageMetadata {

    static get SHOULDLOG() { return false; }

    /**
     * Gets the package.json metadata, using the given options.
     * @param {String|String[]} location The location (or locations) to use.
     */
    static get = (location) => {
        if (!location) {
            throw new Error("Argument [location] must not be null or undefined.");
        }
        if (typeof (location) === "string") {
            return this._getFromSingleLocation(location);
        }
        if (Array.isArray(location)) {
            return this._getFromArray(location);
        }
        throw new Error("Argument [location] must be a string or an array of strings.")

    }

    static _getFromSingleLocation(filePath) {
        if (Array.isArray(filePath)) {
            throw new Error("Argument [filePath] must be a single string value.");
        }
        if (!(filePath && filePath.length)) {
            throw new Error("Argument [filePath] must not be null, undefined, or empty string.");
        }

        var valid = isValidPath(filePath);
        if (!valid) {
            throw new Error('Argument [filePath] is not a valid path.');
        }

        var absolute = path.resolve(process.cwd(), filePath);

        var loadResult = JSONLoader.load(absolute);
        if (loadResult.error) {
            throw new Error(loadResult.error);
        }

        const content = loadResult.content;
        this._log(`Found it!  ${ absolute }`);
        this._log(`content`);
        this._log(content);

        const format = ExpectedGetResult;
        var result = Object.assign({}, ExpectedGetResult);
        for (var property in format) {
            if (content[ property ]) { result[ property ] = content[ property ]; }
        }

        this._log(`Got result:`);
        this._log(result);

        return result;
    }

    static _log(value) {
        if (!this.SHOULDLOG)
            return;

        console.log(value);
    }

    static _getFromArray(locations) {
        if (typeof (locations) === "string") {
            throw new Error("Argument [locations] must be an array of strings.");
        }
        if (!(locations && locations.length)) {
            throw new Error("Argument [locations] must not be null, undefined, or empty array.");
        }

        var result = null;
        locations.forEach(location => {
            try {
                result = this._getFromSingleLocation(location);
            } catch (err) {
                this._log(`Error loading ${ location }:`);
                this._log(err);
            }
            if (result) return;
        })

        if (!result)
            throw new Error("Could not load package.json.");

        return result;
    }
}

module.exports = {
    PackageMetadata
};
