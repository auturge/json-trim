const { assert } = require('chai');
const { JsonTrim } = require("../../src/index.js");

const { LogLevel } = require('../../src/lib/utils/logging.js');
const logger = require('../../src/lib/utils/logging').getSingleton('unit-test');

describe('json-trim', () => {

    var trimmer;

    beforeEach(() => {
        trimmer = new JsonTrim();
        logger.disable();
    });

    it('run - throws an error when the config object is not specified', () => {
        assert.throws(() => {
            trimmer.run();
        }, `Could not resolve configuration: 'source' is not defined.`);
    })

    it('run - throws an error when the config object does not specify a source file', () => {

        const opts = { 'destination': "./test/objects/test.output.json" };

        assert.throws(() => {
            trimmer.run(opts);
        }, `Could not resolve configuration: 'source' is not defined.`);
    })

    it('run - throws an error when the config object specifies an empty string for the source file', () => {

        const opts = { 'source': "" };

        assert.throws(() => {
            trimmer.run(opts);
        }, `Property 'source' must not be an empty string.`);
    })

    it('run - does not throw an error when the config object is proper', () => {
        // logger.setLevel(LogLevel.DEBUG);

        const opts = {
            'source': "./test/objects/test.package.json"
        };

        trimmer.run(opts);
    })
})
