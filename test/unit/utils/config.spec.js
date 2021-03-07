const fs = require("fs");
const path = require('path');
const sinon = require('sinon');
const { assert } = require('chai');
const { unwrap } = require("../../objects/helpers");
const { AnyRandom, CharacterSet } = require('@auturge/testing');
const configResolver = require('@auturge/config-resolver');
const getConfigurationObject = require('../../../src/lib/utils/config');

describe('getConfigurationObject', () => {

    it('getConfigurationObject - throws an error if no arguments are provided', () => {
        var result;

        assert.throws(() => {
            result = getConfigurationObject();
        }, 'Must specify either a default object, or an explicit or alternative config path.');
    });

    it('getConfigurationObject - returns the default object if only the default object is provided', () => {
        var result;
        var obj = { robble: true };

        assert.doesNotThrow(() => {
            result = getConfigurationObject(obj);
        });

        assert.deepEqual(result, obj);
    });

    it('getConfigurationObject - returns the default object if no config can be found', () => {
        var result;
        var obj = { robble: true };
        var args = {};
        var defaultConfigPath = AnyRandom.string(5, 10, CharacterSet.ALPHA);
        var configPath = AnyRandom.string(5, 10, CharacterSet.ALPHA);

        assert.doesNotThrow(() => {
            result = getConfigurationObject(obj, args, defaultConfigPath, configPath);
        });

        assert.deepEqual(result, obj);
    });

    [
        { key: 'an empty string', value: "" },
        { key: 'null', value: null },
        { key: 'undefined', value: undefined }
    ].forEach(({ key, value }) => {
        it(`getConfigurationObject - throws an error if no default object is given, no explicit path is given, and the default path is ${ key }`, () => {
            var defaultPath = value;

            assert.throws(() => {
                getConfigurationObject(null, null, defaultPath);
            }, 'Must specify either a default object, or an explicit or alternative config path.');
        });
    });

    it('getConfigurationObject - throws an error if no default object is given and the default config cannot be found', () => {
        var defaultPath = AnyRandom.string(5, 10, CharacterSet.ALPHA);

        assert.throws(() => {
            getConfigurationObject(null, null, defaultPath);
        }, 'No config file specified, could not find default file.');
    });

    it('getConfigurationObject - throws an error if no default object is given and the explicitly-stated config cannot be found', () => {
        var result;
        var defaultPath = AnyRandom.string(5, 10, CharacterSet.ALPHA);
        var explicitPath = AnyRandom.string(5, 10, CharacterSet.ALPHA);
        const expected = path.join(process.cwd(), explicitPath);

        assert.throws(() => {
            result = getConfigurationObject(null, null, defaultPath, explicitPath);
        }, `Config file [${ expected }] does not exist.`);

    });

    it('getConfigurationObject - throws an error when the config file exists and cannot be loaded', () => {
        var result;
        const relativePath = AnyRandom.string(5, 10, CharacterSet.ALPHA);
        const explicitPath = path.join(process.cwd(), relativePath);
        sinon.stub(fs, 'existsSync').returns(true);
        sinon.stub(configResolver, 'resolveConfig').throws("Robble");

        assert.throws(() => {
            result = getConfigurationObject(null, null, null, explicitPath);
        }, `Could not load config file [${ explicitPath }].`);

        unwrap(fs.existsSync);
        unwrap(configResolver.resolveConfig);
    });

    it('getConfigurationObject - throws an error when the config file exists and does not export a function', () => {
        var result;
        const relativePath = AnyRandom.string(5, 10, CharacterSet.ALPHA);
        const explicitPath = path.join(process.cwd(), relativePath);
        sinon.stub(fs, 'existsSync').returns(true);
        sinon.stub(configResolver, 'resolveConfig').returns({ foo: "Robble" });

        assert.throws(() => {
            result = getConfigurationObject(null, null, null, explicitPath);
        }, `Config file [${ explicitPath }] does not export a function.`);

        unwrap(fs.existsSync);
        unwrap(configResolver.resolveConfig);
    });

    it('getConfigurationObject - throws an error when the exported config function throws', () => {
        var result;
        var expectedError = new Error('derp');
        var derpFn = (...val) => { throw expectedError; }

        const relativePath = AnyRandom.string(5, 10, CharacterSet.ALPHA);
        const explicitPath = path.join(process.cwd(), relativePath);
        sinon.stub(fs, 'existsSync').returns(true);
        sinon.stub(configResolver, 'resolveConfig').returns(derpFn);

        assert.throws(() => {
            result = getConfigurationObject(null, null, null, explicitPath);
        }, `Config function threw an error:\nderp`);

        unwrap(fs.existsSync);
        unwrap(configResolver.resolveConfig);
    });

    it('getConfigurationObject - merges the default config when provided', () => {
        var result;
        var value = AnyRandom.bool();
        const defaultConfig = { robble: 'foo' };
        const PROJECT_ROOT = path.resolve(__dirname, '../../');
        const DESTINATION = './temp/{0}/package.json'.replace('{0}', value ? 'prod' : 'dev');
        const expected = path.join(PROJECT_ROOT, DESTINATION);

        result = getConfigurationObject(defaultConfig, { prod: value }, './test/objects/test.config.js');

        assert.isNotNull(result);
        assert.equal(result.robble, 'foo');
        assert.equal(result.destination, expected);
    });

    [
        { key: 'dev', value: false },
        { key: 'prod', value: true }

    ].forEach(({ key, value }) => {
        it(`getConfigurationObject - (golden path) - returns the parsed js function/file [prod: ${ key }]`, () => {
            var result;
            const PROJECT_ROOT = path.resolve(__dirname, '../../');
            const DESTINATION = './temp/{0}/package.json'.replace('{0}', value ? 'prod' : 'dev');
            const expected = path.join(PROJECT_ROOT, DESTINATION);

            result = getConfigurationObject({}, { prod: value }, './test/objects/test.config.js');

            assert.isNotNull(result);
            assert.equal(result.destination, expected);
        });
    });

    it(`getConfigurationObject - (golden path) - accepts an absolute default path`, () => {
        var result;
        var value = AnyRandom.bool();
        const PROJECT_ROOT = path.resolve(__dirname, '../../');
        const DESTINATION = './temp/{0}/package.json'.replace('{0}', value ? 'prod' : 'dev');
        const expected = path.join(PROJECT_ROOT, DESTINATION);
        const relative = './test/objects/test.config.js';
        const absolute = path.join(process.cwd(), relative);

        result = getConfigurationObject({}, { prod: value }, absolute);

        assert.isNotNull(result);
        assert.equal(result.destination, expected);
    });

    it(`getConfigurationObject - (golden path) - accepts an absolute explicit path`, () => {
        var result;
        var value = AnyRandom.bool();
        const PROJECT_ROOT = path.resolve(__dirname, '../../');
        const DESTINATION = './temp/{0}/package.json'.replace('{0}', value ? 'prod' : 'dev');
        const expected = path.join(PROJECT_ROOT, DESTINATION);
        const relative = './test/objects/test.config.js';
        const absolute = path.join(process.cwd(), relative);

        result = getConfigurationObject({}, { prod: value }, null, absolute);

        assert.isNotNull(result);
        assert.equal(result.destination, expected);
    });
});
