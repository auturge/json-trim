const src = "../../../src/lib";
const testObjects = "../../objects";

const path = require('path');
const fs = require("fs");
const sinon = require('sinon');
const { assert } = require('chai');
const { AnyRandom, CharacterSet } = require('@auturge/testing');
const {
    existingSource, invalidDestination,
    validDestination, existingJS
} = require(testObjects + '/paths');

const { unwrap } = require(testObjects + "/helpers");
const json = require(existingSource)

const { load } = require(src + '/utils/json-loader');

describe('json-loader', () => {

    describe('load', () => {
        [
            { key: 'empty string', value: "" },
            { key: 'null', value: null },
            { key: 'undefined', value: undefined }
        ].forEach(({ key, value }) => {
            it(`load - throws an error if absolutePath is ${ key }`, () => {
                var absolutePath = value;

                const result = load(absolutePath);

                assert.equal(result.content, undefined);
                assert.equal(result.error, 'Argument [absolutePath] must not be null, undefined, or empty string.');
            });
        });

        it(`load - returns an error when the absolutePath does not exist`, () => {
            const absolutePath = validDestination + AnyRandom.char(CharacterSet.ALPHA);

            const result = load(absolutePath);

            assert.equal(result.content, undefined);
            assert.equal(result.error, `File [${ absolutePath }] does not exist.`);
        });

        it(`load - returns an error when the absolutePath is not a valid path`, () => {
            const absolutePath = invalidDestination;
            const expected = `Argument [absolutePath] is not a valid path: ${ absolutePath }`;

            const result = load(invalidDestination);

            assert.equal(result.content, undefined);
            assert.equal(result.error, expected);
        });


        it(`load - returns an error when it cannot read the file`, () => {
            sinon.stub(fs, "readFileSync").throws();
            const absolutePath = existingSource;

            const result = load(absolutePath);

            assert.equal(result.content, undefined);
            assert.equal(result.error, `Could not load file [${ absolutePath }].`);

            unwrap(fs.readFileSync);
        });

        it(`load - returns an error when the file is not JSON`, () => {
            const absolutePath = existingJS;

            const result = load(absolutePath);

            assert.equal(result.content, undefined);
            assert.equal(result.error, `File [${ absolutePath }] is not JSON.`);
        });

        it(`load - returns the file content when the file exists and is JSON`, () => {
            const absolutePath = existingSource;

            const result = load(absolutePath);

            assert.equal(result.error, undefined, result.error);
            assert.isNotNull(result.content);
            assert.equal(JSON.stringify(result.content), JSON.stringify(json));
        });
    });
})
