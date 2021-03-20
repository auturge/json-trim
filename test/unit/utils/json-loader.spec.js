const sinon = require('sinon');
const { assert } = require('chai');
const { unwrap } = require("../../objects/helpers");

const fs = require("fs");
const { AnyRandom } = require('@auturge/testing');
const { load } = require('../../../src/lib/utils/json-loader');
const json = require('../../objects/test.package.json')

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
            const absolutePath = AnyRandom.string(5, 10);

            const result = load(absolutePath);

            assert.equal(result.content, undefined);
            assert.equal(result.error, `File [${ absolutePath }] does not exist.`);
        });

        it(`load - returns an error when it cannot read the file`, () => {
            const stub = sinon.stub(fs, "readFileSync").throws();

            const absolutePath = './src/lib/utils/json-loader.js';

            const result = load(absolutePath);

            assert.equal(result.content, undefined);
            assert.equal(result.error, `Could not load file [${ absolutePath }].`);

            unwrap(fs.readFileSync);
        });

        it(`load - returns an error when the file is not JSON`, () => {
            const absolutePath = './src/lib/utils/json-loader.js';

            const result = load(absolutePath);

            assert.equal(result.content, undefined);
            assert.equal(result.error, `File [${ absolutePath }] is not JSON.`);
        });

        it(`load - returns the file content when the file exists and is JSON`, () => {
            const absolutePath = './test/objects/test.package.json';

            const result = load(absolutePath);

            assert.equal(result.error, undefined, result.error);
            assert.isNotNull(result.content);
            assert.equal(JSON.stringify(result.content), JSON.stringify(json));
        });
    });
})
