const src = "../../../src/lib";
const testObjects = "../../objects";

const path = require('path');
const sinon = require('sinon');
const { assert } = require('chai');
const { AnyRandom, CharacterSet } = require('@auturge/testing');

const { unwrap } = require(testObjects + "/helpers");
const config = require(src + '/utils/config');
const JSONLoader = require(src + '/utils/json-loader');
const { LogLevel, DEFAULT_LOG_LEVEL } = require(src + '/utils/logging.js');
const logger = require(src + '/utils/logging').getSingleton('unit-test');

const getConfigObject = require(src + '/trim/getConfigObject.js');

describe('getConfigObject', () => {

    const relativeSource = './package.json';
    const relativeDestination = './dist/package.json';

    const absoluteSource = path.resolve(process.cwd(), relativeSource);
    const absoluteDestination = path.resolve(process.cwd(), relativeDestination);

    const jsonFile = {
        "name": "json-trim",
        "description": "Copies a json file, trimming out all but a select list of keys.",
        "version": "0.1.0",
        "author": "auturge",
        "license": "MIT"
    };

    var configObject;
    var getConfigurationObject, getJSONFile;

    beforeEach(() => {
        logger.setLevel(DEFAULT_LOG_LEVEL);
        logger.disable();
        configObject = {
            source: absoluteSource,
            destination: absoluteDestination,
            loglevel: 'info',
            keeplist: [ 'author', 'name', 'version', 'license' ]
        };
        getConfigurationObject = sinon.stub(config, 'getConfigurationObject').returns(configObject);
        getJSONFile = sinon.stub(JSONLoader, 'load').returns({ content: jsonFile });
    });

    afterEach(() => {
        unwrap(getConfigurationObject);
        unwrap(getJSONFile);
    })

    it(`getConfigObject - golden path - gets the config object`, () => {
        const cliOptions = {
            config: './test/objects/test.config.js',
            env: { dist: true },
            verbose: true
        };
        const expected = {
            source: absoluteSource,
            destination: absoluteDestination,
            keylist: configObject.keeplist,
            loglevel: LogLevel.TRACE
        };

        var result = getConfigObject(cliOptions);

        sinon.assert.calledOnce(getConfigurationObject);
        assert.deepEqual(result, expected);
    });

    it(`getConfigObject - returns the config when no options are provided`, () => {
        const expected = {
            source: configObject.source,
            destination: configObject.destination,
            loglevel: LogLevel.INFO,
            keylist: configObject.keeplist
        };

        var result = getConfigObject();

        assert.deepEqual(result, expected);
        sinon.assert.calledOnce(getConfigurationObject);
    });

    it(`getConfigObject - QUIET - returns the proper config`, () => {
        const opts = { quiet: true };
        const expected = {
            source: configObject.source,
            destination: configObject.destination,
            loglevel: LogLevel.ERROR,
            keylist: configObject.keeplist
        };

        var result = getConfigObject(opts);

        assert.deepEqual(result, expected);
        sinon.assert.calledOnce(getConfigurationObject);
    });

    it(`getConfigObject - DEBUG - returns the proper config`, () => {
        const opts = { debug: true };
        const expected = {
            source: configObject.source,
            destination: configObject.destination,
            loglevel: LogLevel.DEBUG,
            keylist: configObject.keeplist
        };

        var result = getConfigObject(opts);

        assert.deepEqual(result, expected);
        sinon.assert.calledOnce(getConfigurationObject);
    });

    it(`getConfigObject - VERBOSE - returns the proper config`, () => {
        const opts = { verbose: true };
        const expected = {
            source: configObject.source,
            destination: configObject.destination,
            loglevel: LogLevel.TRACE,
            keylist: configObject.keeplist
        };

        var result = getConfigObject(opts);

        assert.deepEqual(result, expected);
        sinon.assert.calledOnce(getConfigurationObject);
    });

    it(`getConfigObject - KEEPLIST - keeps only the specified keys, if they exist`, () => {
        const opts = { keeplist: [ 'name', 'bag' ] };
        const expected = {
            source: configObject.source,
            destination: configObject.destination,
            loglevel: LogLevel.INFO,
            keylist: [ 'name' ]
        };

        var result = getConfigObject(opts);

        assert.deepEqual(result, expected);
        sinon.assert.calledOnce(getConfigurationObject);
    });

    it(`getConfigObject - SOURCE - sets the proper source file`, () => {
        var source = AnyRandom.string(5, 8, CharacterSet.ALPHANUMERIC);
        const opts = { 'source': source };
        var absoluteSource = path.resolve(process.cwd(), source);
        const expected = {
            source: absoluteSource,
            destination: configObject.destination,
            loglevel: LogLevel.INFO,
            keylist: configObject.keeplist
        };

        var result = getConfigObject(opts);

        assert.deepEqual(result, expected);
        sinon.assert.calledOnce(getConfigurationObject);
    });

    it(`getConfigObject - DESTINATION - sets the proper destination file`, () => {
        var destination = AnyRandom.string(5, 8, CharacterSet.ALPHANUMERIC);
        const opts = { 'destination': destination };
        var absoluteDestination = path.resolve(process.cwd(), destination);
        const expected = {
            source: configObject.source,
            destination: absoluteDestination,
            loglevel: LogLevel.INFO,
            keylist: configObject.keeplist
        };

        var result = getConfigObject(opts);

        assert.deepEqual(result, expected);
        sinon.assert.calledOnce(getConfigurationObject);
    });

    it(`getConfigObject - no source - throws an error if no source is defined`, () => {
        const opts = { verbose: true };
        configObject = {
            destination: absoluteDestination,
            loglevel: 'info',
            keeplist: [ 'author', 'name', 'version', 'license' ]
        };
        getConfigurationObject.returns(configObject);

        assert.throws(() => {
            getConfigObject(opts);
        }, `Could not resolve configuration: 'source' is not defined.`);

        sinon.assert.calledOnce(getConfigurationObject);
    });

    it(`getConfigObject - load failure - exits if no source is defined`, () => {
        var exited = false;
        const opts = { verbose: true };
        var errorObject = { content: jsonFile, error: "err" };
        getJSONFile.returns(errorObject);
        var exit = sinon.stub(process, 'exit').callsFake(() => {
            exited = true;
        })

        getConfigObject(opts);

        assert.isTrue(exited);
        sinon.assert.calledOnce(getConfigurationObject);
        sinon.assert.calledOnce(getJSONFile);
        unwrap(exit);
    });

    it(`getConfigObject - KEYLIST - overwrites keylist property`, () => {
        const opts = {};
        configObject = {
            source: absoluteSource,
            destination: absoluteDestination,
            loglevel: 'info',
            keylist: [ 'bones' ],
            keeplist: [ 'author', 'name', 'version', 'license' ]
        };
        getConfigurationObject.returns(configObject);
        const expected = {
            source: configObject.source,
            destination: absoluteDestination,
            loglevel: LogLevel.INFO,
            keylist: configObject.keeplist
        };

        var result = getConfigObject(opts);

        sinon.assert.calledOnce(getConfigurationObject);
        assert.deepEqual(result, expected);
    });

    it(`getConfigObject - TRIMLIST - removes items from the trimlist`, () => {
        const opts = {};
        configObject = {
            source: absoluteSource,
            destination: absoluteDestination,
            loglevel: 'info',
            trimlist: [ 'name' ]
        };
        getConfigurationObject.returns(configObject);
        const expected = {
            source: configObject.source,
            destination: absoluteDestination,
            loglevel: LogLevel.INFO,
            keylist: [ 'description', 'version', 'author', 'license' ]
        };

        var result = getConfigObject(opts);

        sinon.assert.calledOnce(getConfigurationObject);
        assert.deepEqual(result, expected);
    });

    it(`getConfigObject - TRIMLIST - removes items from the trimlist, takes precedence over keeplist`, () => {
        const opts = {};
        configObject = {
            source: absoluteSource,
            destination: absoluteDestination,
            loglevel: 'info',
            trimlist: [ 'name' ],
            keeplist: [ 'author', 'name', 'version', 'license' ]
        };
        getConfigurationObject.returns(configObject);
        const expected = {
            source: configObject.source,
            destination: absoluteDestination,
            loglevel: LogLevel.INFO,
            keylist: [ 'author', 'version', 'license' ]
        };

        var result = getConfigObject(opts);

        sinon.assert.calledOnce(getConfigurationObject);
        assert.deepEqual(result, expected);
    });

    it(`getConfigObject - empty source - throws an error`, () => {
        const opts = { source: '' };

        assert.throws(() => {
            getConfigObject(opts);
        }, `Property 'source' must not be an empty string.`);

        sinon.assert.calledOnce(getConfigurationObject);
    });

    it(`getConfigObject - no config - throws an error`, () => {
        const opts = {};
        getConfigurationObject.returns(null);

        assert.throws(() => {
            getConfigObject(opts);
        }, `Could not resolve configuration.`);

        sinon.assert.calledOnce(getConfigurationObject);
    });
});
