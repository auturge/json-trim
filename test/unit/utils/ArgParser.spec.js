const src = "../../../src/lib";
const testObjects = "../../objects";

const sinon = require('sinon');
const { assert } = require('chai');
const { AnyRandom, CharacterSet } = require('@auturge/testing');

const { enableTrace, unwrap } = require(testObjects + "/helpers");

const logger = require(src + "/utils/logging").getSingleton('unit-test');
const { flags, groups } = require(src + '/trim/cli-options');
const { ArgParser } = require(src + '/utils/ArgParser');

describe('ArgParser', () => {

    var argParser;
    var title = AnyRandom.string(5, 8, CharacterSet.ALPHA);

    // TODO figure out why I'm only getting 13/16 "functions" coverage

    describe('configure', () => {
        it('configure - sets properties correctly', () => {
            var parser = ArgParser.configure(title, flags, groups, logger);

            assert.equal(parser.options.title, title);
            assert.deepEqual(parser.options.groups, groups);
            assert.deepEqual(parser.options.flags, flags);
            assert.equal(parser.logger, logger);
        });

        it('configure - uses console as the default logger', () => {
            var parser = ArgParser.configure(title, flags, groups);

            assert.equal(parser.logger, console);
        });
    });

    describe('ctor', () => {
        it('ctor - sets properties correctly', () => {
            var parser = new ArgParser(title, flags, groups, logger);

            assert.equal(parser.options.title, title);
            assert.deepEqual(parser.options.groups, groups);
            assert.deepEqual(parser.options.flags, flags);
            assert.equal(parser.logger, logger);
        });

        it('configure - uses correct defaults', () => {
            var parser = new ArgParser(title);

            assert.equal(parser.logger, console);
            assert.isTrue(Array.isArray(parser.options.flags));
            assert.isTrue(Array.isArray(parser.options.groups));
            assert.equal(parser.options.flags.length, 0);
            assert.equal(parser.options.groups.length, 0);
        });

        [
            { key: 'null', value: null },
            { key: 'undefined', value: undefined },
            { key: 'empty string', value: "" },
        ].forEach(({ key, value }) => {
            it(`ctor - throws if title argument is ${ key }`, () => {

                assert.throws(() => {
                    new ArgParser(value, flags, groups, logger);
                }, 'Argument [title] must not be null, undefined, or empty string.');
            });
        });
    });

    describe('parse', () => {

        function getParser(newFlags) {
            return ArgParser.configure(title, newFlags, groups, logger);
        };

        beforeEach(() => {
            title = AnyRandom.string(5, 8, CharacterSet.ALPHANUMERIC);
            logger.disable();

            argParser = getParser(flags);
        });

        afterEach(() => {
            logger.enable();
        });

        it(`parse - handles string values`, () => {

            const cliArgs = `-c ./conf/trim.config.js`;
            const args = cliArgs.split(' ');
            const expected = {
                unknownArgs: [],
                opts: { 'config': './conf/trim.config.js' }
            };

            var parsed = argParser.parse(args, true);

            assert.deepEqual(parsed, expected);
        });

        it(`parse - handles flags`, () => {

            const cliArgs = `-q`;
            const args = cliArgs.split(' ');
            const expected = {
                unknownArgs: [],
                opts: { 'quiet': true }
            };

            var parsed = argParser.parse(args, true);

            assert.deepEqual(parsed, expected);
        });

        it(`parse - handles negation of flags`, () => {

            const cliArgs = `--no-quiet`;
            const args = cliArgs.split(' ');
            const expected = {
                unknownArgs: [],
                opts: {
                    quiet: false
                }
            };

            var parsed = argParser.parse(args, true);

            assert.deepEqual(parsed, expected);
        });

        it(`parse - handles negated and aliased flags`, () => {

            const cliArgs = `--no-quiet -q`;
            const args = cliArgs.split(' ');
            const expected = {
                unknownArgs: [],
                opts: {
                    quiet: true
                }
            };

            var parsed = argParser.parse(args, true);

            // console.log('parsed', parsed);
            assert.deepEqual(parsed, expected);
        });

        it(`parse - logs a warning if a flag is both provided and negated`, () => {
            const warn = sinon.stub(logger, 'warn').callsFake(() => { });
            const cliArgs = `--quiet --no-quiet`;
            const args = cliArgs.split(' ');
            const expected = {
                unknownArgs: [],
                opts: {
                    quiet: false
                }
            };

            var parsed = argParser.parse(args, true);

            sinon.assert.calledOnce(warn);
            // console.log('parsed', parsed);
            assert.deepEqual(parsed, expected);
            unwrap(warn);
        });

        it(`parse - handles multiple-type arguments`, () => {

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

            var parsed = argParser.parse(args, true);

            // console.log('parsed', parsed);
            assert.deepEqual(parsed, expected);
        });

        it(`parse - handles multiple-type arguments with multiple values`, () => {

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

            var parsed = argParser.parse(args, true);

            assert.deepEqual(parsed, expected);
        });

        it(`parse - handles multiple-type arguments with properties and multiple values`, () => {

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

            var parsed = argParser.parse(args, true);

            assert.deepEqual(parsed, expected);
        });

        it(`parse - handles string array arguments`, () => {

            const cliArgs = `-k foo bar baz`;
            const args = cliArgs.split(' ');
            const expected = {
                unknownArgs: [],
                opts: {
                    keeplist: [ 'foo', 'bar', 'baz' ]
                }
            };

            var parsed = argParser.parse(args, true);

            // console.log('parsed', parsed);
            assert.deepEqual(parsed, expected);
        });

        it(`parse - handles number values`, () => {

            const flags = [
                {
                    name: 'times',
                    usage: '--times <number of times>',
                    alias: 't',
                    type: Number
                }
            ];
            argParser = getParser(flags);

            const cliArgs = `-t 14`;
            const args = cliArgs.split(' ');
            const expected = {
                unknownArgs: [],
                opts: {
                    times: 14
                }
            };

            var parsed = argParser.parse(args, true);

            // console.log('parsed', parsed);
            assert.deepEqual(parsed, expected);
        });

        it(`parse - throws for non-string, non-boolean, non-number values`, () => {

            const flags = [
                {
                    name: 'function',
                    usage: '--function',
                    alias: 'f',
                    type: Function // not a string, boolean, or number.
                }
            ];
            argParser = getParser(flags);
            const cliArgs = `-f 14`;
            const args = cliArgs.split(' ');
            const flagsWithType = '-f, --function <value>';

            assert.throws(() => {
                argParser.parse(args, true);
            }, `Option type [${ flagsWithType }] not supported.`);
        });

        it(`parse - handles argsOnly = false (i.e., the entire process.argv)`, () => {

            const flags = [
                {
                    name: 'times',
                    usage: '--times <number of times>',
                    alias: 't',
                    type: Number
                }
            ];
            argParser = getParser(flags);
            const cliArgs = `node /path/to/... -t 14`;
            const args = cliArgs.split(' ');
            const expected = {
                unknownArgs: [],
                opts: {
                    times: 14
                }
            };

            var parsed = argParser.parse(args, false);

            // console.log('parsed', parsed);
            assert.deepEqual(parsed, expected);
        });

        it(`parse - assumes you're passing in the entire process.argv`, () => {

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

            var parsed = argParser.parse(args);

            assert.deepEqual(parsed, expected);
        });

        it(`parse - handles args passed as non-strings`, () => {

            const flags = [
                {
                    name: 'times',
                    usage: '--times <number of times>',
                    alias: 't',
                    type: Number
                }
            ];
            argParser = getParser(flags);
            const args = [ '-t', 14 ];
            const expected = {
                unknownArgs: [],
                opts: {
                    times: 14
                }
            };

            var parsed = argParser.parse(args, true);

            // console.log('parsed', parsed);
            assert.deepEqual(parsed, expected);
        });
    });
});
