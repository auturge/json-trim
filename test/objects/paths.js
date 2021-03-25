
const path = require('path');
const fs = require("fs");
const { AnyRandom, CharacterSet } = require('@auturge/testing');

const _existingSource = path.resolve(process.cwd(), './test/objects/test.package.json');

const _validDestination = path.resolve(process.cwd(), './test/objects/test.output.json');

const _invalidSource = (() => {
    var invalidSource = _existingSource;
    while (fs.existsSync(invalidSource)) {
        invalidSource += AnyRandom.string(1, 1, CharacterSet.ALPHANUMERIC);
    }
    return invalidSource;
})();

const _invalidDestination = '!' + _validDestination;

const _invalidFolder = (() => {
    const existingFolder = process.cwd();
    var fakeFolder = existingFolder;
    while (fs.existsSync(fakeFolder)) {
        fakeFolder += AnyRandom.string(2, 2, CharacterSet.ALPHANUMERIC);
    };
    return fakeFolder;
})();

const _validDriveRoot = (() => {
    return path.parse(process.cwd()).root;
})();

module.exports = {
    existingSource: _existingSource,
    validDestination: _validDestination,
    invalidSource: _invalidSource,
    invalidDestination: _invalidDestination,
    driveRoot: _validDriveRoot,
    invalidFolder: _invalidFolder,
    separator: path.sep
}
