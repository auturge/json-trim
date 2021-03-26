const src = "../../../src/lib";
const testObjects = "../../objects";

const sinon = require('sinon');
const { assert } = require('chai');
const { enableTrace, unwrap } = require(testObjects + "/helpers");

const logger = require(src + "/utils/logging").getSingleton('unit-test');
const { flags } = require(src + '/cli/cli-flags');
const argParser = require(src + '/cli/arg-parser');
const getHelp = require(src + '/cli/groups/runHelp');
const getVersion = require(src + '/cli/groups/runVersion');

describe.only('arg-parser', () => {

    var exit, help, version;
    var exited = false;

    beforeEach(() => {
        exited = false;
        logger.disable();
        exit = sinon.stub(process, 'exit').callsFake(() => { exited = true; });
        help = sinon.stub(getHelp, 'run').callsFake(() => { });
        version = sinon.stub(getVersion, 'run').callsFake(() => { });;
    });

    afterEach(() => {
        logger.enable();
        unwrap(help);
        unwrap(exit);
        unwrap(version);
    });

    [ '--help', 'help', '--HELP', 'HELP' ].forEach((argument) => {
        it(`argParser - [${ argument }] - runs help and exits`, () => {
            const args = [ argument ];
            const passed = [ argument.toLowerCase() ];

            var parsed = argParser(flags, args, true, "robble");

            sinon.assert.calledOnceWithExactly(help, passed);
            assert.equal(null, parsed);
        });
    });

    [ '--version', '-ver', '--VERSION', '-VER' ].forEach((argument) => {
        it(`argParser - [${ argument }] - runs version and exits`, () => {
            const args = [ argument ];
            const passed = [ argument.toLowerCase() ];

            var parsed = argParser(flags, args, true, "robble");

            sinon.assert.calledOnceWithExactly(version, passed);
            assert.equal(null, parsed);
        });
    });

    it(`argParser - handles string values`, () => {

        const options = [
            {
                name: 'config',
                usage: '--config <path to json-trim configuration file>',
                alias: 'c',
                type: String,
                description: 'Provide path to a json-trim configuration file e.g. ./conf/trim.config.js',
                link: 'https://github.com/auturge/json-trim/readme.md#ConfigurationFiles/',
            }
        ];
        const cliArgs = `-c ./conf/trim.config.js`;
        const args = cliArgs.split(' ');
        const expected = {
            unknownArgs: [],
            opts: { 'config': './conf/trim.config.js' }
        };

        var parsed = argParser(options, args, true, "robble");

        assert.deepEqual(parsed, expected);
    });

    it(`argParser - handles flags`, () => {

        const options = [
            {
                name: 'quiet',
                usage: '--quiet',
                alias: "q",
                type: Boolean,
                negative: true,
                description: 'Toggles quiet mode. Will only output errors',
            }
        ];
        const cliArgs = `-q`;
        const args = cliArgs.split(' ');
        const expected = {
            unknownArgs: [],
            opts: { 'quiet': true }
        };

        var parsed = argParser(options, args, true, "robble");

        assert.deepEqual(parsed, expected);
    });

    it(`argParser - handles negation of flags`, () => {

        const options = [
            {
                name: 'quiet',
                usage: '--quiet',
                alias: "q",
                type: Boolean,
                negative: true
            }
        ];
        const cliArgs = `--no-quiet`;
        const args = cliArgs.split(' ');
        const expected = {
            unknownArgs: [],
            opts: {
                quiet: false
            }
        };

        var parsed = argParser(options, args, true, "robble");

        // console.log('parsed', parsed);
        assert.deepEqual(parsed, expected);
    });

    it(`argParser - handles negated and aliased flags`, () => {

        const options = [
            {
                name: 'quiet',
                alias: 'q',
                type: Boolean,
                negative: true
            }
        ];
        const cliArgs = `--no-quiet -q`;
        const args = cliArgs.split(' ');
        const expected = {
            unknownArgs: [],
            opts: {
                quiet: true
            }
        };

        var parsed = argParser(options, args, true, "robble");

        // console.log('parsed', parsed);
        assert.deepEqual(parsed, expected);
    });

    it(`argParser - logs a warning if a flag is both provided and negated`, () => {
        const warn = sinon.stub(logger, 'warn').callsFake(() => { });
        const options = [
            {
                name: 'quiet',
                usage: '--quiet',
                alias: "q",
                type: Boolean,
                negative: true
            }
        ];
        const cliArgs = `--quiet --no-quiet`;
        const args = cliArgs.split(' ');
        const expected = {
            unknownArgs: [],
            opts: {
                quiet: false
            }
        };

        var parsed = argParser(options, args, true, "robble");

        sinon.assert.calledOnce(warn);
        // console.log('parsed', parsed);
        assert.deepEqual(parsed, expected);
        unwrap(warn);
    });

    it(`argParser - handles multiple-type arguments`, () => {

        const options = [
            {
                name: 'env',
                usage: '--env <environment>',
                type: String,
                multipleType: true,
                description: 'Environment passed to the configuration when it is a function',
            }
        ];
        const cliArgs = `--env platform=staging --env production`;
        const args = cliArgs.split(' ');
        const expected = {
            unknownArgs: [],
            opts: {
                env: {
                    platform: "staging",
                    production: true
                }
            }
        };

        var parsed = argParser(options, args, true, "robble");

        // console.log('parsed', parsed);
        assert.deepEqual(parsed, expected);
    });

    it(`argParser - handles multiple-type arguments with multiple values`, () => {

        const options = [
            {
                name: 'env',
                usage: '--env <environment>',
                type: String,
                multipleType: true
            }
        ];
        const cliArgs = `--env platform=staging --env platform=chicken --env production --env development`;
        const args = cliArgs.split(' ');
        const expected = {
            unknownArgs: [],
            opts: {
                env: {
                    platform: "staging",
                    platform: "chicken",
                    production: true,
                    development: true
                }
            }
        };

        var parsed = argParser(options, args, true, "robble");

        assert.deepEqual(parsed, expected);
    });

    it(`argParser - handles multiple-type arguments with properties and multiple values`, () => {

        const options = [
            {
                name: 'env',
                usage: '--env <environment>',
                type: String,
                multipleType: true
            }
        ];
        const cliArgs = `--env platform.prod=staging --env platform.dev=intg --env smoke=false --env production --env development`;
        const args = cliArgs.split(' ');
        const expected = {
            unknownArgs: [],
            opts: {
                env: {
                    platform: {
                        prod: "staging",
                        dev: "intg"
                    },
                    smoke: "false",
                    production: true,
                    development: true
                }
            }
        };

        var parsed = argParser(options, args, true, "robble");

        assert.deepEqual(parsed, expected);
    });

    it(`argParser - handles multiple-value arguments`, () => {

        const options = [
            {
                name: 'keeplist',
                usage: '--keeplist <list> <of> <keys>',
                alias: 'k',
                type: String,
                multiple: true,
                description: 'List of json keys to copy, e.g., name version description'
            }
        ];
        const cliArgs = `-k foo bar baz`;
        const args = cliArgs.split(' ');
        const expected = {
            unknownArgs: [],
            opts: {
                keeplist: [ 'foo', 'bar', 'baz' ]
            }
        };

        var parsed = argParser(options, args, true, "robble");

        // console.log('parsed', parsed);
        assert.deepEqual(parsed, expected);
    });

    it(`argParser - handles number values`, () => {

        const options = [
            {
                name: 'times',
                usage: '--times <number of times>',
                alias: 't',
                type: Number
            }
        ];
        const cliArgs = `-t 14`;
        const args = cliArgs.split(' ');
        const expected = {
            unknownArgs: [],
            opts: {
                times: 14
            }
        };

        var parsed = argParser(options, args, true, "robble");

        // console.log('parsed', parsed);
        assert.deepEqual(parsed, expected);
    });

    it(`argParser - throws for non-string, non-boolean, non-number values`, () => {

        const options = [
            {
                name: 'function',
                usage: '--function',
                alias: 'f',
                type: Function // not a string, boolean, or number.
            }
        ];
        const cliArgs = `-f 14`;
        const args = cliArgs.split(' ');
        const flagsWithType = '-f, --function <value>';

        assert.throws(() => {
            argParser(options, args, true, "robble");
        }, `Option type [${ flagsWithType }] not supported.`);
    });

    it(`argParser - handles argsOnly = false (i.e., the entire process.argv)`, () => {

        const options = [
            {
                name: 'times',
                usage: '--times <number of times>',
                alias: 't',
                type: Number
            }
        ];
        const cliArgs = `node /path/to/... -t 14`;
        const args = cliArgs.split(' ');
        const expected = {
            unknownArgs: [],
            opts: {
                times: 14
            }
        };

        var parsed = argParser(options, args, false, "robble");

        // console.log('parsed', parsed);
        assert.deepEqual(parsed, expected);
    });

    it(`argParser - assumes you're passing in the entire process.argv`, () => {

        const options = [
            {
                name: 'env',
                usage: '--env <environment>',
                type: String,
                multipleType: true
            }
        ];
        const cliArgs = `node /path/to/... --env platform.prod=staging --env platform.dev=intg --env smoke=false --env production --env development`;
        const args = cliArgs.split(' ');
        const expected = {
            unknownArgs: [],
            opts: {
                env: {
                    platform: {
                        prod: "staging",
                        dev: "intg"
                    },
                    smoke: "false",
                    production: true,
                    development: true
                }
            }
        };

        var parsed = argParser(options, args);

        assert.deepEqual(parsed, expected);
    });

    it(`argParser - handles args passed as non-strings`, () => {

        const options = [
            {
                name: 'times',
                usage: '--times <number of times>',
                alias: 't',
                type: Number
            }
        ];
        const args = [ '-t', 14 ];
        const expected = {
            unknownArgs: [],
            opts: {
                times: 14
            }
        };

        var parsed = argParser(options, args, true, "robble");

        // console.log('parsed', parsed);
        assert.deepEqual(parsed, expected);
    });
});
