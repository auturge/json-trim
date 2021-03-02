const sinon = require("sinon");
const { unwrap } = require("../objects/helpers.js");
const { assert } = require('chai');
const { JsonTrim } = require("../../src/index.js");
const TestLogger = require("../objects/test.logger");

describe('JsonTrim', () => {

    var logger = new TestLogger().disable();
    var trimmer;
    let mark;

    beforeEach(() => {
        mark = sinon.stub(logger, "mark");
        trimmer = new JsonTrim(logger);
    });

    afterEach(() => {
        unwrap(logger.mark);
    });

    it('ctor - creates a new logger, if one is not provided', () => {
        trimmer = new JsonTrim();

        // the new logger won't be disabled
        // (as it would be if it came from the beforeEach)
        assert.isTrue(trimmer.logger.enabled);
    })

    it('run - throws an error when the config object is not specified', () => {
        assert.throws(() => {
            trimmer.run();
        }, `Could not resolve configuration: 'source' is not defined`);
    })

    it('run - throws an error when the config object does not specify a source file', () => {
        const opts = { 'destination': "your mom's couch" };
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
        const opts = {
            'source': "./test/objects/test.package.json"
        };

        trimmer.run(opts);
    })
})
