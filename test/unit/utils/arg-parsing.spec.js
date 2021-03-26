// const src = "../../../src/lib";
// const testObjects = "../../objects";

// const sinon = require('sinon');
// const { assert } = require('chai');
// const { enableTrace, unwrap } = require(testObjects + "/helpers");

// const logger = require(src + "/utils/logging").getSingleton('unit-test');

// const { flags } = require(src + '/trim/cli-options');

// const parsing = require(src + '/utils/arg-parsing');
// const argParser = parsing.argParser;
// const isCommandUsed = parsing.isCommandUsed;

// describe('arg-parsing', () => {

//     describe('arg-parser', () => {

//         var help, version, exit, exited;

//         beforeEach(() => {
//             exited = false;
//             logger.disable();
//             exit = sinon.stub(process, 'exit').callsFake((code) => { exited = true; });
//             help = sinon.stub(parsing, 'outputHelp').callsFake(() => { });
//             version = sinon.stub(parsing, 'outputVersion').callsFake(() => { });;
//         });

//         afterEach(() => {
//             logger.enable();
//             unwrap(exit);
//             unwrap(help);
//             unwrap(version);
//         });

//         [ '--help', 'help', '--HELP', 'HELP' ].forEach((argument) => {
//             it(`argParser - [${ argument }] - runs help and exits`, () => {
//                 const args = [ argument ];
//                 const passed = [ argument.toLowerCase() ];

//                 var parsed = argParser(flags, args, logger, true);

//                 sinon.assert.calledOnceWithExactly(help, logger, passed);
//                 sinon.assert.calledOnceWithExactly(exit, 0);
//                 assert.equal(null, parsed);
//             });
//         });

//         [ '--version', '-ver', '--VERSION', '-VER' ].forEach((argument) => {
//             it(`argParser - [${ argument }] - runs version and exits`, () => {
//                 const args = [ argument ];
//                 const passed = [ argument.toLowerCase() ];

//                 var parsed = argParser(flags, args, logger, true);

//                 sinon.assert.calledOnceWithExactly(version, logger, passed);
//                 sinon.assert.calledOnceWithExactly(exit, 0);
//                 assert.equal(null, parsed);
//             });
//         });

//         it(`argParser - handles string values`, () => {

//             const flags = [
//                 {
//                     name: 'config',
//                     usage: '--config <path to json-trim configuration file>',
//                     alias: 'c',
//                     type: String,
//                     description: 'Provide path to a json-trim configuration file e.g. ./conf/trim.config.js',
//                     link: 'https://github.com/auturge/json-trim/readme.md#ConfigurationFiles/',
//                 }
//             ];
//             const cliArgs = `-c ./conf/trim.config.js`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: { 'config': './conf/trim.config.js' }
//             };

//             var parsed = argParser(flags, args, logger, true);

//             assert.deepEqual(parsed, expected);
//         });

//         it(`argParser - handles flags`, () => {

//             const options = [
//                 {
//                     name: 'quiet',
//                     usage: '--quiet',
//                     alias: "q",
//                     type: Boolean,
//                     negative: true,
//                     description: 'Toggles quiet mode. Will only output errors',
//                 }
//             ];
//             const cliArgs = `-q`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: { 'quiet': true }
//             };

//             var parsed = argParser(options, args, logger, true);

//             assert.deepEqual(parsed, expected);
//         });

//         it(`argParser - handles negation of flags`, () => {

//             const options = [
//                 {
//                     name: 'quiet',
//                     usage: '--quiet',
//                     alias: "q",
//                     type: Boolean,
//                     negative: true
//                 }
//             ];
//             const cliArgs = `--no-quiet`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: {
//                     quiet: false
//                 }
//             };

//             var parsed = argParser(options, args, logger, true);

//             // console.log('parsed', parsed);
//             assert.deepEqual(parsed, expected);
//         });

//         it(`argParser - handles negated and aliased flags`, () => {

//             const options = [
//                 {
//                     name: 'quiet',
//                     alias: 'q',
//                     type: Boolean,
//                     negative: true
//                 }
//             ];
//             const cliArgs = `--no-quiet -q`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: {
//                     quiet: true
//                 }
//             };

//             var parsed = argParser(options, args, logger, true);

//             // console.log('parsed', parsed);
//             assert.deepEqual(parsed, expected);
//         });

//         it(`argParser - logs a warning if a flag is both provided and negated`, () => {
//             const warn = sinon.stub(logger, 'warn').callsFake(() => { });
//             const options = [
//                 {
//                     name: 'quiet',
//                     usage: '--quiet',
//                     alias: "q",
//                     type: Boolean,
//                     negative: true
//                 }
//             ];
//             const cliArgs = `--quiet --no-quiet`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: {
//                     quiet: false
//                 }
//             };

//             var parsed = argParser(options, args, logger, true);

//             sinon.assert.calledOnce(warn);
//             // console.log('parsed', parsed);
//             assert.deepEqual(parsed, expected);
//             unwrap(warn);
//         });

//         it(`argParser - handles multiple-type arguments`, () => {

//             const options = [
//                 {
//                     name: 'env',
//                     usage: '--env <environment>',
//                     type: String,
//                     multipleType: true,
//                     description: 'Environment passed to the configuration when it is a function',
//                 }
//             ];
//             const cliArgs = `--env platform=staging --env production`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: {
//                     env: {
//                         platform: "staging",
//                         production: true
//                     }
//                 }
//             };

//             var parsed = argParser(options, args, logger, true);

//             // console.log('parsed', parsed);
//             assert.deepEqual(parsed, expected);
//         });

//         it(`argParser - handles multiple-type arguments with multiple values`, () => {

//             const options = [
//                 {
//                     name: 'env',
//                     usage: '--env <environment>',
//                     type: String,
//                     multipleType: true
//                 }
//             ];
//             const cliArgs = `--env platform=staging --env platform=chicken --env production --env development`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: {
//                     env: {
//                         platform: "staging",
//                         platform: "chicken",
//                         production: true,
//                         development: true
//                     }
//                 }
//             };

//             var parsed = argParser(options, args, logger, true);

//             assert.deepEqual(parsed, expected);
//         });

//         it(`argParser - handles multiple-type arguments with properties and multiple values`, () => {

//             const options = [
//                 {
//                     name: 'env',
//                     usage: '--env <environment>',
//                     type: String,
//                     multipleType: true
//                 }
//             ];
//             const cliArgs = `--env platform.prod=staging --env platform.dev=intg --env smoke=false --env production --env development`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: {
//                     env: {
//                         platform: {
//                             prod: "staging",
//                             dev: "intg"
//                         },
//                         smoke: "false",
//                         production: true,
//                         development: true
//                     }
//                 }
//             };

//             var parsed = argParser(options, args, logger, true);

//             assert.deepEqual(parsed, expected);
//         });

//         it(`argParser - handles string array arguments`, () => {

//             const options = [
//                 {
//                     name: 'keeplist',
//                     usage: '--keeplist <list> <of> <keys>',
//                     alias: 'k',
//                     type: String,
//                     multiple: true,
//                     description: 'List of json keys to copy, e.g., name version description'
//                 }
//             ];
//             const cliArgs = `-k foo bar baz`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: {
//                     keeplist: [ 'foo', 'bar', 'baz' ]
//                 }
//             };

//             var parsed = argParser(options, args, logger, true);

//             // console.log('parsed', parsed);
//             assert.deepEqual(parsed, expected);
//         });

//         it(`argParser - handles number values`, () => {

//             const options = [
//                 {
//                     name: 'times',
//                     usage: '--times <number of times>',
//                     alias: 't',
//                     type: Number
//                 }
//             ];
//             const cliArgs = `-t 14`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: {
//                     times: 14
//                 }
//             };

//             var parsed = argParser(options, args, logger, true);

//             // console.log('parsed', parsed);
//             assert.deepEqual(parsed, expected);
//         });

//         it(`argParser - throws for non-string, non-boolean, non-number values`, () => {

//             const options = [
//                 {
//                     name: 'function',
//                     usage: '--function',
//                     alias: 'f',
//                     type: Function // not a string, boolean, or number.
//                 }
//             ];
//             const cliArgs = `-f 14`;
//             const args = cliArgs.split(' ');
//             const flagsWithType = '-f, --function <value>';

//             assert.throws(() => {
//                 argParser(options, args, logger, true);
//             }, `Option type [${ flagsWithType }] not supported.`);
//         });

//         it(`argParser - handles argsOnly = false (i.e., the entire process.argv)`, () => {

//             const options = [
//                 {
//                     name: 'times',
//                     usage: '--times <number of times>',
//                     alias: 't',
//                     type: Number
//                 }
//             ];
//             const cliArgs = `node /path/to/... -t 14`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: {
//                     times: 14
//                 }
//             };

//             var parsed = argParser(options, args, logger, false);

//             // console.log('parsed', parsed);
//             assert.deepEqual(parsed, expected);
//         });

//         it(`argParser - assumes you're passing in the entire process.argv`, () => {

//             const options = [
//                 {
//                     name: 'env',
//                     usage: '--env <environment>',
//                     type: String,
//                     multipleType: true
//                 }
//             ];
//             const cliArgs = `node /path/to/... --env platform.prod=staging --env platform.dev=intg --env smoke=false --env production --env development`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: {
//                     env: {
//                         platform: {
//                             prod: "staging",
//                             dev: "intg"
//                         },
//                         smoke: "false",
//                         production: true,
//                         development: true
//                     }
//                 }
//             };

//             var parsed = argParser(options, args, logger);

//             assert.deepEqual(parsed, expected);
//         });

//         it(`argParser - uses console by default`, () => {

//             const options = [
//                 {
//                     name: 'env',
//                     usage: '--env <environment>',
//                     type: String,
//                     multipleType: true
//                 }
//             ];
//             const cliArgs = `node /path/to/... --env platform.prod=staging --env platform.dev=intg --env smoke=false --env production --env development`;
//             const args = cliArgs.split(' ');
//             const expected = {
//                 unknownArgs: [],
//                 opts: {
//                     env: {
//                         platform: {
//                             prod: "staging",
//                             dev: "intg"
//                         },
//                         smoke: "false",
//                         production: true,
//                         development: true
//                     }
//                 }
//             };

//             var parsed = argParser(options, args);

//             assert.deepEqual(parsed, expected);
//         });

//         it(`argParser - handles args passed as non-strings`, () => {

//             const options = [
//                 {
//                     name: 'times',
//                     usage: '--times <number of times>',
//                     alias: 't',
//                     type: Number
//                 }
//             ];
//             const args = [ '-t', 14 ];
//             const expected = {
//                 unknownArgs: [],
//                 opts: {
//                     times: 14
//                 }
//             };

//             var parsed = argParser(options, args, logger, true);

//             // console.log('parsed', parsed);
//             assert.deepEqual(parsed, expected);
//         });
//     });

//     describe('isCommandUsed', () => {

//         const commands = [ {
//             name: 'clone',
//             usage: 'clone <source> [destination]',
//             description: 'clone a repository into a newly created directory',
//             option: [ '-p,--port <port_number>', 'web port' ],
//             action: (source, destination) => {
//                 console.log(`clone command called with source [${ source }] and destination [${ destination }].`);
//             }
//         } ];

//         [
//             { key: 'null', value: null },
//             { key: 'undefined', value: undefined },
//             { key: 'empty array', value: [] },
//         ].forEach(({ key, value }) => {
//             it(`isCommandUsed - returns undefined if the argument is ${ key }`, () => {
//                 var args = value;

//                 var result = isCommandUsed(commands, args);

//                 assert.isUndefined(result);
//             });
//         });

//         it(`isCommandUsed - returns the corresponding command if it is specified by name in the args`, () => {
//             var keys = Object.keys(commands);
//             console.log('keys', keys);
//             var command = commands[ keys[ keys.length * Math.random() << 0 ] ];
//             var args = [ command.name ];

//             var result = isCommandUsed(commands, args);

//             assert.equal(result, command);
//         });

//         it(`isCommandUsed - returns the corresponding command if it is specified by alias in the args`, () => {
//             var keys = Object.keys(commands);
//             console.log('keys', keys);
//             var command = commands[ keys[ keys.length * Math.random() << 0 ] ];
//             var args = [ command.alias ];

//             var result = isCommandUsed(commands, args);

//             assert.equal(result, command);
//         });

//     });



// });
