const { assert } = require('chai');
const { AnyRandom, CharacterSet } = require('@auturge/testing');

const path = require('path');

const {
    existingSource, invalidSource, invalidDestination,
    validDestination, invalidFolder, driveRoot, separator
} = require('../../objects/paths');

const logger = require("../../../src/lib/utils/logging").getSingleton('unit-test');
const { validateFileNames } = require('../../../src/lib/utils/validate-filenames');

describe('validate-filenames', () => {


    beforeEach(() => {
        logger.disable();
    });

    afterEach(() => {
        logger.enable();
    })

    it('validateFileNames - returns an error object when the source file does not exist', () => {
        const source = invalidSource;
        const destination = validDestination;

        const result = validateFileNames(source, destination);

        assert.deepEqual(result,
            { error: `Could not find source file [${ source }].`, code: 1 }
        );
    });

    [
        { key: 'null', value: null },
        { key: 'undefined', value: undefined }
    ].forEach(({ key, value }) => {
        it(`validateFileNames - ${ key } destination is fine, return it in the pipe`, () => {
            const source = existingSource;
            const destination = value;

            result = validateFileNames(source, destination);

            assert.isNotNull(result);
        });
    });

    it(`validateFileNames - missing destination is fine, return it in the pipe`, () => {
        const source = existingSource;

        result = validateFileNames(source);

        assert.isNotNull(result);
    });

    it('validateFileNames - returns an error object when the destination is not a valid path', () => {
        const source = existingSource;
        const destination = invalidDestination;

        const result = validateFileNames(source, destination);

        assert.deepEqual(result,
            { error: `${ destination } is not a valid path.`, code: 1 }
        );
    });

    it(`validateFileNames - returns an error object when the destination folder path does not exist`, () => {
        const source = existingSource;
        const destinationFolder = invalidFolder;
        const pathParts = [
            destinationFolder,
            separator,
            AnyRandom.string(5, 8, CharacterSet.ALPHANUMERIC),
            ".json"
        ];
        const destination = pathParts.join('');

        const result = validateFileNames(source, destination);

        assert.deepEqual(result,
            { error: `Destination folder [${ destinationFolder }] does not exist.`, code: 1 }
        );
    });

    it(`validateFileNames - setting the destination path to the drive root without a path separator sets the destination to the source filename at the drive root`, () => {
        const source = existingSource;
        var root = driveRoot.slice(0, 2);  // e.g., 'E:'

        const result = validateFileNames(source, root);

        assert.deepEqual(result,
            {
                error: null,
                code: 0,
                source: existingSource,
                destination: root + separator + path.basename(source)
            }
        );
    });

    it(`validateFileNames - setting the destination path to the drive root with a path separator sets the destination to the source filename at the drive root`, () => {
        const source = existingSource;
        var root = driveRoot;  // e.g., 'E:\'

        const result = validateFileNames(source, root);

        assert.deepEqual(result,
            {
                error: null,
                code: 0,
                source: existingSource,
                destination: root + path.basename(source)
            }
        );
    });
})
