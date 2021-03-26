const src = "../../../src/lib/";
const testObjects = "../../objects/";

const sinon = require('sinon');
const { assert } = require('chai');

const { enableTrace, unwrap } = require(testObjects + "helpers");
const {
    existingSource, invalidSource, invalidDestination, validDestination
} = require(testObjects + "paths");

const JSONLoader = require(src + 'utils/json-loader');
const trim = require(src + 'trim/trim');
const logger = require(src + "utils/logging").getSingleton('unit-test');

describe('trim', () => {

    beforeEach(() => {
        logger.disable();
    });

    afterEach(() => {
        logger.enable();
    });

    it('trim - returns an error object when the source file does not exist', () => {
        var config = {
            'source': invalidSource,
            'destination': validDestination
        };
        var result = trim(config);

        assert.equal(result.error, `Could not find source file [${ config.source }].`);
        assert.equal(1, result.code);
        assert.deepEqual(result,
            { error: `Could not find source file [${ config.source }].`, code: 1 }
        );
    });

    it('trim - empty destination is fine, return it in the pipe', () => {
        var config = { 'source': existingSource };

        result = trim(config);

        assert.isNotNull(result);
    });

    it('trim - returns an error object when the destination is not a valid path', () => {
        var config = {
            'source': existingSource,
            'destination': invalidDestination
        };

        var result = trim(config);

        assert.deepEqual(result,
            { error: `${ config.destination } is not a valid path.`, code: 1 }
        );
    });

    it('trim - returns an error object when the source file cannot be loaded', () => {
        const config = { 'source': existingSource, 'destination': validDestination };
        const errorMessage = 'robble';
        const loadResult = { 'error': errorMessage };
        const load = sinon.stub(JSONLoader, 'load').returns(loadResult);

        const result = trim(config);

        assert.deepEqual(result,
            { error: errorMessage, code: 1 }
        );

        unwrap(load);
    });

    it('trim - includes only the specified list of keys in the output', () => {
        // enableTrace();
        const config = { 'source': existingSource, 'destination': validDestination, keylist: [ 'key2' ] };
        const loadResult = {
            content: {
                'key1': 'foo',
                'key2': 'bar',
                'key3': 'baz'
            }
        };
        const load = sinon.stub(JSONLoader, 'load').returns(loadResult);

        const result = trim(config);

        assert.deepEqual(result,
            { 'key2': 'bar' }
        );

        unwrap(load);
    });
})
