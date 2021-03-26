const src = "../../../src/lib";
const testObjects = "../../objects";

const sinon = require('sinon');
const { assert } = require('chai');
const { AnyRandom, CharacterSet } = require('@auturge/testing');

const { enableTrace, unwrap } = require(testObjects + "/helpers");

const logger = require(src + "/utils/logging").getSingleton('unit-test');
const { flags, groups } = require(src + '/trim/cli-options');
const { CLIHelpProvider } = require(src + '/utils/CLIHelpProvider');

const packageJSON = require('../../../package.json');

describe('CLIHelpProvider', () => {

    var provider;
    var help, version, exit, exited;


    describe('configure', () => {
        it('configure - sets properties correctly', () => {
            var parser = CLIHelpProvider.configure(packageJSON, flags, groups, logger);

            assert.deepEqual(parser.options.packageJSON, packageJSON);
            assert.equal(parser.options.title, packageJSON.name);
            assert.equal(parser.options.version, packageJSON.version);
            assert.deepEqual(parser.options.groups, groups);
            assert.deepEqual(parser.options.flags, flags);
            assert.equal(parser.logger, logger);
        });

        it('configure - uses console as the default logger', () => {
            var parser = CLIHelpProvider.configure(packageJSON, flags, groups);

            assert.equal(parser.logger, console);
        });
    });

    describe('ctor', () => {
        it('ctor - sets properties correctly', () => {
            var parser = new CLIHelpProvider(packageJSON, flags, groups, logger);

            assert.deepEqual(parser.options.packageJSON, packageJSON);
            assert.equal(parser.options.title, packageJSON.name);
            assert.equal(parser.options.version, packageJSON.version);
            assert.deepEqual(parser.options.groups, groups);
            assert.deepEqual(parser.options.flags, flags);
            assert.equal(parser.logger, logger);
        });

        it('configure - uses console as the default logger', () => {
            var parser = new CLIHelpProvider(packageJSON, flags, groups);

            assert.equal(parser.logger, console);
        });
    });

    describe('handle', () => {
        beforeEach(() => {
            exited = false;
            title = AnyRandom.string(5, 8, CharacterSet.ALPHANUMERIC);

            logger.disable();
            provider = CLIHelpProvider.configure(title, flags, groups, logger);

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

        [ '--help', 'help', '--HELP', 'HELP' ].forEach((argument) => {
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

    });
});
