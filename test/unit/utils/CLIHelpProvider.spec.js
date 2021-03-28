const src = "../../../src/lib";
const testObjects = "../../objects";

const sinon = require('sinon');
const { assert } = require('chai');
const { yellow, bold, underline, options } = require('colorette');
const { AnyRandom, CharacterSet } = require('@auturge/testing');

const { enableTrace, unwrap } = require(testObjects + "/helpers");

const logger = require(src + "/utils/logging").getSingleton('unit-test');
const { flags, groups } = require(src + '/trim/cli-options');
const { CLIHelpProvider } = require(src + '/utils/CLIHelpProvider');

describe('CLIHelpProvider', () => {

    var provider;
    const command = AnyRandom.string(5, 8, CharacterSet.ALPHA);
    const packageName = AnyRandom.string(5, 8, CharacterSet.ALPHA);
    const packageVersion = AnyRandom.int(0, 5).toString();
    var help, version, exit, error, info, log;

    function oneOf(array) {
        return array[ array.length * Math.random() << 0 ];
    }

    function getProvider(flags) {
        return CLIHelpProvider.configure(packageName, command, packageVersion, flags, logger);
    }

    describe('configure', () => {
        it('configure - sets properties correctly', () => {
            var parser = CLIHelpProvider.configure(packageName, command, packageVersion, flags, logger);

            assert.deepEqual(parser.options.packageName, packageName);
            assert.equal(parser.options.command, command);
            assert.equal(parser.options.version, packageVersion);
            assert.deepEqual(parser.options.flags, flags);
            assert.equal(parser.logger, logger);
        });

        it('configure - uses console as the default logger', () => {
            var parser = CLIHelpProvider.configure(packageName, command, packageVersion, flags);

            assert.equal(parser.logger, console);
        });
    });

    describe('ctor', () => {
        it('ctor - sets properties correctly', () => {
            var parser = new CLIHelpProvider(packageName, command, packageVersion, flags, logger);

            assert.deepEqual(parser.options.packageName, packageName);
            assert.equal(parser.options.command, command);
            assert.equal(parser.options.version, packageVersion);
            assert.deepEqual(parser.options.flags, flags);
            assert.equal(parser.logger, logger);
        });

        it('ctor - uses console as the default logger', () => {
            var parser = new CLIHelpProvider(packageName, command, packageVersion, flags);

            assert.equal(parser.logger, console);
        });

        [
            { key: 'null', value: null },
            { key: 'undefined', value: undefined },
            { key: 'empty string', value: "" },
        ].forEach(({ key, value }) => {
            it(`ctor - throws if packageName argument is ${ key }`, () => {

                assert.throws(() => {
                    new CLIHelpProvider(value, command, packageVersion, flags, groups);
                }, 'Argument [packageName] must not be null, undefined, or empty string.');
            });
        });

        [
            { key: 'null', value: null },
            { key: 'undefined', value: undefined },
            { key: 'empty string', value: "" },
        ].forEach(({ key, value }) => {
            it(`ctor - throws if version argument is ${ key }`, () => {

                assert.throws(() => {
                    new CLIHelpProvider(packageName, command, value, flags, groups);
                }, 'Argument [version] must not be null, undefined, or empty string.');
            });
        });

        [
            { key: 'null', value: null },
            { key: 'undefined', value: undefined },
            { key: 'empty string', value: "" },
        ].forEach(({ key, value }) => {
            it(`ctor - throws if command argument is ${ key }`, () => {

                assert.throws(() => {
                    new CLIHelpProvider(packageName, value, packageVersion, flags, groups);
                }, 'Argument [command] must not be null, undefined, or empty string.');
            });
        });

        [
            { key: 'null', value: null },
            { key: 'undefined', value: undefined }
        ].forEach(({ key, value }) => {
            it(`ctor - throws if flags argument is ${ key }`, () => {

                assert.throws(() => {
                    new CLIHelpProvider(packageName, command, packageVersion, value, groups);
                }, 'Must specify a set of flags/options.');
            });
        });

        it(`ctor - does not throw if flags argument is an empty array`, () => {

            assert.doesNotThrow(() => {
                new CLIHelpProvider(packageName, command, packageVersion, [], groups);
            });
        });
    });

    describe('handle', () => {

        beforeEach(() => {
            exited = false;

            logger.disable();
            provider = getProvider(flags);

            exit = sinon.stub(process, 'exit').callsFake((code) => { exited = true; });
            help = sinon.stub(provider, '_outputHelp').callsFake(() => { });
            version = sinon.stub(provider, '_outputVersion').callsFake(() => { });
        });

        afterEach(() => {
            logger.enable();
            unwrap(exit);
            unwrap(help);
            unwrap(version);
        });

        [ '--help', 'help', '--HELP', 'HELP', '-h', '-H' ].forEach((argument) => {
            it(`handle - [${ argument }] - runs help and exits`, () => {
                const args = [ argument ];
                const passed = [ argument.toLowerCase() ];

                var parsed = provider.handle(args);

                sinon.assert.calledOnceWithExactly(help, passed);
                sinon.assert.calledOnceWithExactly(exit, 0);
                assert.equal(null, parsed);
            });
        });

        [ '--version', '-ver', '--VERSION', '-VER' ].forEach((argument) => {
            it(`handle - [${ argument }] - runs version and exits`, () => {
                const args = [ argument ];
                const passed = [ argument.toLowerCase() ];

                var parsed = provider.handle(args);

                sinon.assert.calledOnceWithExactly(version, passed);
                sinon.assert.calledOnceWithExactly(exit, 0);
                assert.equal(null, parsed);
            });
        });

        [
            { key: 'null', value: null },
            { key: 'undefined', value: undefined },
            { key: 'empty', value: [] }
        ].forEach(({ key, value }) => {
            it(`handle - throws if args are required but ${ key }`, () => {
                const args = value;
                assert.throws(() => {
                    provider.handle(args, true);
                }, 'Arguments are required.');
            });
        });

        [
            { key: 'null', value: null },
            { key: 'undefined', value: undefined },
            { key: 'empty', value: [] }
        ].forEach(({ key, value }) => {
            it(`handle - does not throw if args are ${ key } and not required`, () => {
                const args = value;
                assert.doesNotThrow(() => {
                    provider.handle(args);
                });
            });
        });

        it('handle - handles lowercase and uppercase and numeric values', () => {
            const args = [ 'foo', true, 'bar', 42, 'baz', 'balloon' ];
            assert.doesNotThrow(() => {
                provider.handle(args);
            });
        });
    });

    describe('_outputHelp', () => {

        var invalidArgWarning;

        beforeEach(() => {
            logger.disable();
            provider = getProvider(flags);

            invalidArgWarning = sinon.stub(provider, '_printInvalidArgWarning').callsFake(() => { });
        });

        afterEach(() => {
            logger.enable();
            unwrap(invalidArgWarning);
        });

        it('_outputHelp - prints invalid argument warnings', () => {
            const cliArgs = [ '-foo' ];

            provider[ '_outputHelp' ](cliArgs);

            sinon.assert.calledOnceWithExactly(invalidArgWarning, cliArgs);
        });

        it('_outputHelp - prints flag help if a flag is passed by name (e.g., help --<flag>)', () => {
            while (!arg || arg == '--help') {
                var arg = '--' + oneOf(flags).name;
            }
            const cliArgs = [ arg ];
            const printSubHelp = sinon.stub(provider, '_printSubHelp').callsFake(() => { });
            // console.log('arg', arg);

            provider[ '_outputHelp' ](cliArgs);

            sinon.assert.calledOnce(printSubHelp);
            sinon.assert.calledWithExactly(printSubHelp, arg);
            unwrap(printSubHelp);
        });

        it('_outputHelp - prints flag help if a flag is passed by alias (e.g., help -<alias>)', () => {
            while (!arg || arg == '-undefined' || arg == '-h') {
                var arg = '-' + oneOf(flags).alias;
            }
            const cliArgs = [ arg ];
            const printSubHelp = sinon.stub(provider, '_printSubHelp').callsFake(() => { });
            // console.log('arg', arg);

            provider[ '_outputHelp' ](cliArgs);

            sinon.assert.calledOnce(printSubHelp);
            sinon.assert.calledWithExactly(printSubHelp, arg);
            unwrap(printSubHelp);
        });
    });

    describe('_outputVersion', () => {
        var log, printInvalidArgError;

        beforeEach(() => {
            logger.disable();
            provider = getProvider(flags);

            printInvalidArgError = sinon.stub(provider, '_printInvalidArgError').callsFake(() => { });
            log = sinon.stub(logger, 'log').callsFake(() => { });
        });

        afterEach(() => {
            logger.enable();

            unwrap(printInvalidArgError);
            unwrap(log);
        });

        it('_outputVersion - prints invalid argument errors', () => {
            const cliArgs = [ '-foo' ];

            provider[ '_outputVersion' ](cliArgs);

            sinon.assert.calledOnceWithExactly(printInvalidArgError, cliArgs);
            unwrap(printInvalidArgError);
        });

        it('_outputVersion - displays the version', () => {
            const cliArgs = [ '--' + oneOf(flags).name ];
            const expected = `\n${ packageName } ${ packageVersion }\n`

            provider[ '_outputVersion' ](cliArgs);

            sinon.assert.calledOnceWithExactly(printInvalidArgError, cliArgs);
            sinon.assert.calledOnceWithExactly(log, expected);
        });
    });

    describe('_displayText', () => {
        beforeEach(() => {
            logger.disable();
            provider = getProvider(flags);
        });

        afterEach(() => {
            logger.enable();
        });

        it('_displayText - displays the provided values, properly formatted', () => {
            const header = AnyRandom.string(5, 8, CharacterSet.ALPHANUMERIC);
            const link = AnyRandom.string(5, 8, CharacterSet.ALPHANUMERIC);
            const expected = `${ bold(underline(header)) }: ${ link }`;
            const log = sinon.stub(logger, 'log');

            provider[ '_displayText' ](header, link);

            sinon.assert.calledOnceWithExactly(log, expected);
            unwrap(log);
        });
    });

    describe('_printSubHelp', () => {

        var subject;
        var _displayText;
        const flagWithLink = {
            name: AnyRandom.string(5, 8, CharacterSet.ALPHA),
            usage: AnyRandom.string(10, 50, CharacterSet.ALPHA),
            alias: AnyRandom.char(CharacterSet.ALPHA),
            type: String,
            description: AnyRandom.string(10, 50, CharacterSet.ALPHA),
            link: AnyRandom.url()
        };
        const flagWithoutLink = {
            name: AnyRandom.string(5, 8, CharacterSet.ALPHA),
            usage: AnyRandom.string(10, 50, CharacterSet.ALPHA),
            alias: AnyRandom.char(CharacterSet.ALPHA),
            type: String,
            description: AnyRandom.string(10, 50, CharacterSet.ALPHA)
        };
        const flagWithoutLinkOrAlias = {
            name: AnyRandom.string(5, 8, CharacterSet.ALPHA),
            usage: AnyRandom.string(10, 50, CharacterSet.ALPHA),
            type: String,
            description: AnyRandom.string(10, 50, CharacterSet.ALPHA)
        };
        const flags = [ flagWithLink, flagWithoutLink ];

        beforeEach(() => {
            while (!subject || subject == '--help') {
                subject = '--' + oneOf(flags).name;
            }

            logger.disable();
        });

        afterEach(() => {
            logger.enable();

            unwrap(_displayText);
        });

        it('_printSubHelp - prints sub-help with documentation link based on name', () => {
            const option = flagWithLink;
            const flags = [ option ];
            provider = getProvider(flags);
            _displayText = sinon.spy(provider, '_displayText');
            const subject = '--' + option.name;
            const expectedUsage = yellow(`${ command } -${ option.alias }, ${ option.usage }`);
            const expectedDescription = option.description;
            const expectedLink = option.link;

            provider[ '_printSubHelp' ](subject);

            assert.equal(_displayText.callCount, 3);
            assert.equal(_displayText.getCall(0).args.length, 2);
            assert.equal(_displayText.getCall(0).args[ 0 ], 'Usage');
            assert.equal(_displayText.getCall(0).args[ 1 ], expectedUsage);
            assert.equal(_displayText.getCall(1).args.length, 2);
            assert.equal(_displayText.getCall(1).args[ 0 ], 'Description');
            assert.equal(_displayText.getCall(1).args[ 1 ], expectedDescription);
            assert.equal(_displayText.getCall(2).args.length, 2);
            assert.equal(_displayText.getCall(2).args[ 0 ], 'Documentation');
            assert.equal(_displayText.getCall(2).args[ 1 ], expectedLink);
        });

        it('_printSubHelp - prints sub-help with documentation link based on alias', () => {
            const option = flagWithLink;
            const flags = [ option ];
            provider = getProvider(flags);
            _displayText = sinon.spy(provider, '_displayText');
            const subject = '-' + option.alias;
            const expectedUsage = yellow(`${ command } -${ option.alias }, ${ option.usage }`);
            const expectedDescription = option.description;
            const expectedLink = option.link;

            provider[ '_printSubHelp' ](subject);

            assert.equal(_displayText.callCount, 3);
            assert.equal(_displayText.getCall(0).args.length, 2);
            assert.equal(_displayText.getCall(0).args[ 0 ], 'Usage');
            assert.equal(_displayText.getCall(0).args[ 1 ], expectedUsage);
            assert.equal(_displayText.getCall(1).args.length, 2);
            assert.equal(_displayText.getCall(1).args[ 0 ], 'Description');
            assert.equal(_displayText.getCall(1).args[ 1 ], expectedDescription);
            assert.equal(_displayText.getCall(2).args.length, 2);
            assert.equal(_displayText.getCall(2).args[ 0 ], 'Documentation');
            assert.equal(_displayText.getCall(2).args[ 1 ], expectedLink);
        });

        it('_printSubHelp - prints sub-help without documentation link based on name', () => {
            const option = flagWithoutLinkOrAlias;
            const flags = [ option ];
            provider = getProvider(flags);
            _displayText = sinon.spy(provider, '_displayText');
            const subject = '--' + option.name;
            const expectedUsage = yellow(`${ command } ${ option.usage }`);
            const expectedDescription = option.description;

            provider[ '_printSubHelp' ](subject);

            assert.equal(_displayText.callCount, 2);

            assert.equal(_displayText.callCount, 2);
            assert.equal(_displayText.getCall(0).args.length, 2);
            assert.equal(_displayText.getCall(0).args[ 0 ], 'Usage');
            assert.equal(_displayText.getCall(0).args[ 1 ], expectedUsage);
            assert.equal(_displayText.getCall(1).args.length, 2);
            assert.equal(_displayText.getCall(1).args[ 0 ], 'Description');
            assert.equal(_displayText.getCall(1).args[ 1 ], expectedDescription);
        });

        it('_printSubHelp - prints sub-help without documentation link based on alias', () => {
            const option = flagWithoutLink;
            const flags = [ option ];
            provider = getProvider(flags);
            _displayText = sinon.spy(provider, '_displayText');
            const subject = '-' + option.alias;
            const expectedUsage = yellow(`${ command } -${ option.alias }, ${ option.usage }`);
            const expectedDescription = option.description;

            provider[ '_printSubHelp' ](subject);

            assert.equal(_displayText.callCount, 2);
            assert.equal(_displayText.getCall(0).args.length, 2);
            assert.equal(_displayText.getCall(0).args[ 0 ], 'Usage');
            assert.equal(_displayText.getCall(0).args[ 1 ], expectedUsage);
            assert.equal(_displayText.getCall(1).args.length, 2);
            assert.equal(_displayText.getCall(1).args[ 0 ], 'Description');
            assert.equal(_displayText.getCall(1).args[ 1 ], expectedDescription);
        });
    });

    describe('_printInvalidArgWarning', () => {

        const flag = {
            name: AnyRandom.string(5, 8, CharacterSet.ALPHA),
            usage: AnyRandom.string(10, 50, CharacterSet.ALPHA),
            alias: AnyRandom.char(CharacterSet.ALPHA),
            type: String,
            description: AnyRandom.string(10, 50, CharacterSet.ALPHA),
            link: AnyRandom.url()
        };
        const flags = [ flag ];

        beforeEach(() => {
            logger.disable();
            provider = getProvider(flags);
        });

        afterEach(() => {
            logger.enable();
        });

        it('_printInvalidArgWarning - does nothing if there are no invalid flags', () => {
            const args = [ '--' + flag.name ];
            var warn = sinon.stub(logger, 'warn').callsFake(() => { });

            provider[ '_printInvalidArgWarning' ](args);

            sinon.assert.notCalled(warn);
            unwrap(warn);
        });

        it('_printInvalidArgWarning - logs a warning message when there are invalid flags', () => {
            const invalidArgs = [ '--' + AnyRandom.string(5, 5, CharacterSet.ALPHA) ];
            const expected = `You provided an invalid option '${ invalidArgs[ 0 ] }'.`
            var warn = sinon.stub(logger, 'warn').callsFake(() => { });

            provider[ '_printInvalidArgWarning' ](invalidArgs);

            sinon.assert.calledOnceWithExactly(warn, expected);
            unwrap(warn);
        });
    });

    describe('_printInvalidArgError', () => {

        beforeEach(() => {
            exited = false;

            logger.disable();
            provider = getProvider(flags);

            exit = sinon.stub(process, 'exit').callsFake((code) => { exited = true; });
            error = sinon.stub(logger, 'error').callsFake(() => { });
            info = sinon.stub(logger, 'info').callsFake(() => { });
            log = sinon.stub(logger, 'log').callsFake(() => { });
        });

        afterEach(() => {
            logger.enable();
            unwrap(exit);
            unwrap(error);
            unwrap(info);
            unwrap(log);
        });

        it('_printInvalidArgError - does nothing if there are no invalid flags', () => {
            const flag = oneOf(flags);
            const args = [ '--' + flag.name ];

            provider[ '_printInvalidArgError' ](args);

            sinon.assert.notCalled(error);
        });

        it('_printInvalidArgError - logs an error and exits when there are invalid flags', () => {
            const invalidArgs = [ '--' + AnyRandom.string(5, 5, CharacterSet.ALPHA) ];
            const errMessage = `Error: Invalid option '${ invalidArgs[ 0 ] }'.`;
            const infoMessage = `Run ${ command } --help to see available commands and arguments.\n`;

            provider[ '_printInvalidArgError' ](invalidArgs);

            sinon.assert.calledOnceWithExactly(error, errMessage);
            sinon.assert.calledOnceWithExactly(info, infoMessage);
            sinon.assert.calledOnceWithExactly(exit, 2);
        });
    });

    describe('_getCommandLineUsageOptions', () => {

        beforeEach(() => {
            logger.disable();
        });

        afterEach(() => {
            logger.enable();
        });

        it('_getCommandLineUsageOptions - gets the correct options, given flags', () => {
            provider = getProvider(flags);
            const negatedFlags = flags
                .filter((flag) => flag.negative)
                .reduce((allFlags, flag) => {
                    return [ ...allFlags, {
                        name: `no-${ flag.name }`,
                        description: `Negates ${ flag.name }`,
                        type: Boolean
                    } ];
                }, []);
            const titleText = bold('⬡                     ') + underline(packageName) + bold('                     ⬡');
            const usage = bold('Usage') + ': ' + '`' + yellow(`${ command } [...options]`) + '`';
            const examples = bold('Example') + ': ' + '`' + yellow(`${ command } help --flag`) + '`';
            const hh = `          ` +
                `${ titleText }` + `\n\n` +
                `${ usage }` + `\n\n` +
                `${ examples }` + `\n\n`;
            const expected = [
                {
                    content: hh,
                    raw: true,
                }
            ];
            expected.push({
                header: 'Options',
                optionList: flags
                    .map((e) => {
                        if (e.type.length > 1) e.type = e.type[ 0 ];
                        e.description = e.description.replace(/[{}\\]/g, '\\$&');
                        return e;
                    })
                    .concat(negatedFlags),
            });

            var result = provider[ '_getCommandLineUsageOptions' ]();

            assert.deepEqual(result, expected);
        });

        it('_getCommandLineUsageOptions - gets the correct options, given NO flags', () => {
            const flags = [];
            provider = getProvider(flags);
            const titleText = bold('⬡                     ') + underline(packageName) + bold('                     ⬡');
            const usage = bold('Usage') + ': ' + '`' + yellow(`${ command } [...options]`) + '`';
            const examples = bold('Example') + ': ' + '`' + yellow(`${ command } help --flag`) + '`';
            const hh = `          ` +
                `${ titleText }` + `\n\n` +
                `${ usage }` + `\n\n` +
                `${ examples }` + `\n\n`;
            const expected = [
                {
                    content: hh,
                    raw: true,
                }
            ];

            var result = provider[ '_getCommandLineUsageOptions' ]();

            assert.deepEqual(result, expected);
        });
    });
});
