const src = "../../src/lib";
const testObjects = "../objects";

const path = require('path');
const sinon = require('sinon');
const { assert } = require('chai');
const { options: coloretteOptions } = require('colorette');
const { AnyRandom, CharacterSet } = require('@auturge/testing');
const jsonLoader = require('../../src/lib/utils/json-loader');

const { unwrap } = require(testObjects + '/helpers');
const { runCLI } = require(src + '/runCLI');

const { flags } = require(src + '/trim/cli-options');

const logger = require(src + "/utils/logging").getSingleton('e2e-test');
const { LogLevel } = require(src + '/utils/logging');
const { EXIT_CODES } = require(src + '/utils/errors');

describe('runCLI', () => {

    const source = path.resolve(process.cwd(), './test/objects/test.package.json');
    const baseArgs = [ '--source', source ];

    var error, raw, exit, exitCode;

    function oneOf(array) {
        return array[ array.length * Math.random() << 0 ];
    };

    beforeEach(() => {
        exited = undefined;
        logger.disable();
        error = sinon.stub(logger, 'error');
        raw = sinon.stub(logger, 'raw');
        exit = sinon.stub(process, 'exit').callsFake((code) => { exitCode = code; });
    });

    afterEach(() => {
        logger.enable();
        unwrap(error);
        unwrap(raw);
        unwrap(exit);
    });

    [
        { key: 'quiet', arg: '-q', logLevel: LogLevel.ERROR },
        { key: 'verbose', arg: '-v', logLevel: LogLevel.TRACE }
    ].forEach(({ key, arg, logLevel }) => {
        it(`runCLI - [${ key }] - sets the log level appropriately`, () => {
            const args = [].concat(baseArgs, arg);

            const result = runCLI(args);

            assert.equal(logger.logLevel, logLevel);
            assert.isNotNull(result);
        })
    });

    [
        { arg: '--color', enabled: true },
        { arg: '--no-color', enabled: false }
    ].forEach(({ arg, enabled }) => {
        it(`runCLI - [${ arg }] - sets the 'color' attribute appropriately`, () => {
            const args = [].concat(baseArgs, arg);

            const result = runCLI(args);

            assert.equal(coloretteOptions.enabled, enabled);
            assert.isNotNull(result);
        })
    });

    it(`runCLI - logs warnings and exits when user uses unknown args - NOT close`, () => {
        const arg = '--' + AnyRandom.string(30, 35, CharacterSet.ALPHA);
        const args = [].concat(baseArgs, arg);
        const errMessage = `Unknown argument: ${ arg.toLowerCase() }`;

        const result = runCLI(args);

        sinon.assert.calledOnceWithExactly(error, errMessage);
        sinon.assert.notCalled(raw);
        sinon.assert.calledOnceWithExactly(exit, EXIT_CODES.INVALID_COMMAND_LINE);
        assert.isUndefined(result);
    });

    it(`runCLI - logs warnings and exits when user uses unknown args - close`, () => {
        const found = oneOf(flags);
        const arg = '--' + found.name + AnyRandom.string(1, 1, CharacterSet.ALPHA);
        const args = [].concat(baseArgs, arg);
        const errMessage = `Unknown argument: ${ arg.toLowerCase() }`;
        const rawMessage = `Did you mean --${ found.name }?`;

        const result = runCLI(args);

        sinon.assert.calledOnceWithExactly(error, errMessage);
        sinon.assert.calledOnceWithExactly(raw, rawMessage);
        sinon.assert.calledOnceWithExactly(exit, EXIT_CODES.INVALID_COMMAND_LINE);
        assert.isUndefined(result);
    });

    it(`runCLI - on error - logs errors and exits with an internal exit code`, () => {
        const args = {
            '--source': 'C:\\:://+-? What a Horrible Filename! >.<'
                + '\n' + 'This Will Break!'
        };

        const result = runCLI(args);

        sinon.assert.calledOnceWithExactly(error, "Could not resolve configuration: 'source' is not defined.");
        sinon.assert.calledOnceWithExactly(exit, 20);
        assert.isUndefined(result);
    });

    it(`runCLI - on error - logs errors and exits due to something exceptional`, () => {
        // suppose the file cannot be loaded.
        const args = [].concat(baseArgs);
        const message = AnyRandom.string(30, 40, CharacterSet.ALPHA);
        const err = new Error(message);
        var load = sinon.stub(jsonLoader, 'load').throws(err);

        const result = runCLI(args);

        sinon.assert.calledOnceWithExactly(error, err);
        sinon.assert.calledOnceWithExactly(exit, EXIT_CODES.FAILURE);
        assert.isUndefined(result);
        unwrap(load);
    });
});
