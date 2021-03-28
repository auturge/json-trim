const src = "../../../src/lib";
const testObjects = "../../objects";

const sinon = require('sinon');
const { assert } = require('chai');
const { AnyRandom, CharacterSet } = require('@auturge/testing');
const jsonLoader = require('../../../src/lib/utils/json-loader');

const { enableTrace, unwrap } = require(testObjects + "/helpers");
const { invalidPath } = require(testObjects + "/paths");

const logger = require(src + "/utils/logging").getSingleton('unit-test');
const { PackageMetadata } = require(src + '/utils/PackageMetadata');

describe('PackageMetadata', () => {

    var load;

    describe('get', () => {

        beforeEach(() => {
            logger.disable();
            load = sinon.stub(jsonLoader, 'load');
        });
        afterEach(() => {
            logger.enable();
            unwrap(load);
        });

        [
            { key: 'null', value: null },
            { key: 'undefined', value: undefined },
        ].forEach(({ key, value }) => {
            it(`get - throws if location is ${ key }`, () => {
                const location = value;
                assert.throws(() => {
                    PackageMetadata.get(location);
                }, "Argument [location] must not be null or undefined.");
            });
        });


        [
            { key: 'boolean', value: true },
            { key: 'number', value: 42 },
            { key: 'function', value: () => { } },
        ].forEach(({ key, value }) => {
            it(`get - [${ key }] - throws if location is not a string or array`, () => {
                const location = value;
                assert.throws(() => {
                    PackageMetadata.get(location);
                }, "Argument [location] must be a string or an array of strings.");
            });
        });

        it(`get - returns the content of the loaded json`, () => {
            const filePath = 'chicken';
            const expected = { name: 'foo', version: 'bar' };
            const loadResult = { content: expected, error: undefined };
            load.returns(loadResult);

            var result = PackageMetadata.get(filePath);

            assert.deepEqual(result, expected);
        });
    });

    describe('_getFromSingleLocation', () => {

        beforeEach(() => {
            logger.disable();
            load = sinon.stub(jsonLoader, 'load');
        });
        afterEach(() => {
            logger.enable();
            unwrap(load);
        });

        [
            { key: 'null', value: null },
            { key: 'undefined', value: undefined },
            { key: 'empty string', value: "" }
        ].forEach(({ key, value }) => {
            it(`_getFromSingleLocation - throws if filePath is ${ key }`, () => {
                const filePath = value;
                assert.throws(() => {
                    PackageMetadata[ '_getFromSingleLocation' ](filePath);
                });
            });
        });

        it(`_getFromSingleLocation - throws if filePath is not a string`, () => {
            const filePath = [ "bob" ];
            assert.throws(() => {
                PackageMetadata[ '_getFromSingleLocation' ](filePath);
            }, "Argument [filePath] must be a single string value.");
        });

        it(`_getFromSingleLocation - throws if filePath is not a valid path`, () => {
            assert.throws(() => {
                PackageMetadata[ '_getFromSingleLocation' ](invalidPath);
            }, 'Argument [filePath] is not a valid path.');
        });

        it(`_getFromSingleLocation - throws if it cannot load the specified file`, () => {
            const filePath = 'chicken';
            var err = AnyRandom.string(5, 8, CharacterSet.ALPHA);
            load.throws(new Error(err));

            assert.throws(() => {
                PackageMetadata[ '_getFromSingleLocation' ](filePath);
            }, err);
        });

        it(`_getFromSingleLocation - returns the content of the loaded json`, () => {
            const filePath = 'chicken';
            const expected = { name: 'foo', version: 'bar' };
            const loadResult = { content: expected, error: undefined };
            load.returns(loadResult);

            var result = PackageMetadata[ '_getFromSingleLocation' ](filePath);

            assert.deepEqual(result, expected);
        });

    });

    describe('_getFromArray', () => {

        beforeEach(() => {
            logger.disable();
            load = sinon.stub(jsonLoader, 'load');
        });
        afterEach(() => {
            logger.enable();
            unwrap(load);
        });

        [
            { key: 'null', value: null },
            { key: 'undefined', value: undefined },
            { key: 'empty array', value: [] }
        ].forEach(({ key, value }) => {
            it(`_getFromArray - throws if locations argument is ${ key }`, () => {
                const locations = value;
                assert.throws(() => {
                    PackageMetadata[ '_getFromArray' ](locations);
                });
            });
        });

        it(`_getFromArray - given an array, throws if any element of locations argument is not a string`, () => {
            const locations = [ 'chicken', 'noodle', 42 ];

            assert.throws(() => {
                PackageMetadata[ '_getFromArray' ](locations);
            }, "Argument [locations] must be an array of strings.");
        });

        it(`_getFromArray - throws if it cannot load any of the specified files`, () => {
            const locations = [ 'chicken', 'noodle', 'soup' ];
            load.throws(new Error());

            assert.throws(() => {
                PackageMetadata[ '_getFromArray' ](locations);
            }, "Could not load package.json.");
        });
    });
});
