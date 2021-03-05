const sinon = require('sinon');
const { assert, expect } = require('chai');
const { unwrap } = require("../../objects/helpers");
const util = require('util');
const { AnyRandom } = require('@auturge/testing');
const { Logger, LogLevel, LogEntryState, LoggerOptions, getLogLevel, DEFAULT_LOG_LEVEL } = require("../../../src/lib/utils/logging");
const { red, cyan, yellow, green, white, magenta } = require('colorette');

describe('logging', () => {

    describe('Logger', () => {
        var logger;

        describe('ctor', () => {

            beforeEach(() => {
                logger = new Logger();
            });

            it('ctor - does not throw an error if no options are provided', () => {

                assert.doesNotThrow(() => {
                    logger = new Logger();
                });

                assert.isNotNull(logger, "Logger was null, and should not have been.");
            });

            [
                { key: 'normal', options: { quiet: false, silent: false, verbose: false } },
                { key: 'quiet', options: { quiet: true, silent: false, verbose: false } },
                { key: 'silent', options: { quiet: false, silent: true, verbose: false } },
                { key: 'verbose', options: { quiet: false, silent: false, verbose: true } },
            ].forEach(({ key, options }) => {
                it(`ctor - creates a new logger, using the specified options [${ key }]`, () => {
                    options.name = AnyRandom.string(5, 10);

                    logger = new Logger(options);

                    assert.equal(logger.name, options.name);

                    if (options.silent) {
                        assert.isFalse(logger.enabled);
                        assert.equal(logger.logLevel, LogLevel.SILENT);
                    }

                    if (options.quiet) {
                        assert.equal(logger.logLevel, LogLevel.ERROR);
                    }

                    if (options.verbose) {
                        assert.equal(logger.logLevel, LogLevel.TRACE);
                    }
                });
            });

            it(`ctor - throws an error for bad options [quiet & verbose]`, () => {
                const options = { quiet: true, silent: false, verbose: true };
                assert.throws(() => {
                    logger = new Logger(options);
                }, "Logger cannot be both quiet and verbose.");
            });

            it(`ctor - throws an error for bad options [silent & verbose]`, () => {
                const options = { quiet: false, silent: true, verbose: true };

                assert.throws(() => {
                    logger = new Logger(options);
                }, "Logger cannot be both silent and verbose.");
            });

            it(`ctor - throws an error for bad options [quiet & silent]`, () => {
                const options = { quiet: true, silent: true, verbose: false };

                assert.throws(() => {
                    logger = new Logger(options);
                }, "Logger cannot be both quiet and silent.");
            });

            it(`ctor - given no source, sets the source to empty string`, () => {
                const options = { quiet: false, silent: false, verbose: false };

                logger = new Logger(options);

                assert.equal(logger.name, "");
            });
        });

        describe('disable', () => {
            beforeEach(() => {
                logger = new Logger();
            });
            it(`disable - sets enabled to false and returns the logger`, () => {
                logger.enabled = true;

                var result = logger.disable();

                assert.isFalse(logger.enabled, ".disable() failed to disable the logger.");
                assert.isNotNull(result, ".disable() failed to return a value.");
                assert.equal(result, logger, ".disable() failed to return the correct value.");
            });
        });

        describe('enable', () => {
            beforeEach(() => {
                logger = new Logger();
            });
            it(`enable - sets enabled to true and returns the logger`, () => {
                logger.enabled = false;

                var result = logger.enable();

                assert.isTrue(logger.enabled, ".enable() failed to enable the logger.");
                assert.isNotNull(result, ".enable() failed to return a value.");
                assert.equal(result, logger, ".enable() failed to return the correct value.");
            });
        });

        describe('setOptions', () => {
            beforeEach(() => {
                logger = new Logger();
            });

            [
                { level: LogLevel.SILENT, options: { silent: true } },
                { level: LogLevel.ERROR, options: { quiet: true } },
                { level: LogLevel.INFO, options: {} },
                { level: LogLevel.DEBUG, options: { debug: true } },
                { level: LogLevel.TRACE, options: { verbose: true } }
            ].forEach(({ level, options }) => {
                it(`setOptions - given the right options, sets the loglevel to ${ level }`, () => {
                    logger.setOptions(options);

                    assert.equal(logger.logLevel, level);
                })
            });
        });

        describe('setLevel', () => {
            beforeEach(() => {
                logger = new Logger();
            });

            [
                { level: LogLevel.SILENT },
                { level: LogLevel.FATAL },
                { level: LogLevel.ERROR },
                { level: LogLevel.WARN },
                { level: LogLevel.INFO },
                { level: LogLevel.DEBUG },
                { level: LogLevel.TRACE }
            ].forEach(({ level }) => {
                it(`setLevel - [${ level }] - sets the loglevel and returns the logger`, () => {
                    var result = logger.setLevel(level);

                    assert.equal(logger.logLevel, level);
                    assert.equal(logger.enabled, level != LogLevel.SILENT);
                    assert.isNotNull(result, ".setLevel() failed to return a value.");
                    assert.equal(result, logger, ".setLevel() failed to return the correct value.");
                });
            });

            [
                { key: 'null', value: null },
                { key: 'undefined', value: undefined }
            ].forEach(({ key, value }) => {
                it(`setLevel - given ${ key }, throws an error`, () => {

                    assert.throws(() => {
                        logger.setLevel(value);
                    }, `Argument [logLevel] must not be null or undefined.`);
                });
            });
        });

        describe('canOutputAtLevel', () => {

            beforeEach(() => {
                logger = new Logger();
            });


            [
                { level: LogLevel.FATAL },
                { level: LogLevel.ERROR },
                { level: LogLevel.WARN },
                { level: LogLevel.INFO },
                { level: LogLevel.DEBUG },
                { level: LogLevel.TRACE }
            ].forEach(({ level }) => {
                it(`canOutputAtLevel - [${ level }] - returns true when enabled and the same log level`, () => {
                    logger.enabled = true;
                    logger.logLevel = level;

                    var result = logger.canOutputAtLevel(level);

                    assert.isTrue(result);
                });

                it(`canOutputAtLevel - [${ level }] - returns true when enabled and logger is set to a lower level`, () => {
                    logger.enabled = true;
                    logger.logLevel = level;
                    const levelToCheck = LogLevel.coerce(level - 1);

                    var result = logger.canOutputAtLevel(levelToCheck);

                    assert.isTrue(result);
                });

                it(`canOutputAtLevel - [${ level }] - returns FALSE when disabled.`, () => {
                    logger.enabled = false;
                    logger.logLevel = level;
                    const levelToCheck = LogLevel.coerce(level - 1);

                    var result = logger.canOutputAtLevel(levelToCheck);

                    assert.isFalse(result);
                });
            });

            [
                { level: LogLevel.SILENT },
                { level: LogLevel.FATAL },
                { level: LogLevel.ERROR },
                { level: LogLevel.WARN },
                { level: LogLevel.INFO },
                { level: LogLevel.DEBUG }
            ].forEach(({ level }) => {
                it(`canOutputAtLevel - [${ level }] - returns FALSE when logger is set to a higher level.`, () => {
                    logger.enabled = false;
                    logger.logLevel = level;
                    const levelToCheck = LogLevel.coerce(level + 1);

                    var result = logger.canOutputAtLevel(levelToCheck);

                    assert.isFalse(result);
                });
            });
        });

        describe('fatal', () => {
            var consoleStub, message;
            beforeEach(() => {
                logger = new Logger();
                logger.name = AnyRandom.string(5, 10);
                logger.enabled = true;
                consoleStub = sinon.stub(console, "error");
                message = AnyRandom.string(5, 10);
            });

            afterEach(() => {
                unwrap(console.error);
            })

            it(`fatal - does nothing if the logger is set to SILENT`, () => {
                logger.logLevel = LogLevel.SILENT;

                logger.fatal(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`fatal - sends the message to console.error, and closes any partial, when the logger is set to FATAL`, () => {
                logger.logLevel = LogLevel.FATAL;
                logger.isPartialOpen = true;

                logger.fatal(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ red(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`fatal - sends the message to console.error, and closes any partial, when the logger is set to ERROR`, () => {
                logger.logLevel = LogLevel.ERROR;
                logger.isPartialOpen = true;

                logger.fatal(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ red(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`fatal - sends the message to console.error, and closes any partial, when the logger is set to WARN`, () => {
                logger.logLevel = LogLevel.WARN;
                logger.isPartialOpen = true;

                logger.fatal(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ red(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`fatal - sends the message to console.error, and closes any partial, when the logger is set to INFO`, () => {
                logger.logLevel = LogLevel.INFO;
                logger.isPartialOpen = true;

                logger.fatal(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ red(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`fatal - sends the message to console.error, and closes any partial, when the logger is set to DEBUG`, () => {
                logger.logLevel = LogLevel.DEBUG;
                logger.isPartialOpen = true;

                logger.fatal(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ red(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`fatal - sends the message to console.error, and closes any partial, when the logger is set to TRACE`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = true;

                logger.fatal(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ red(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });
        });

        describe('error', () => {
            var consoleStub, message;
            beforeEach(() => {
                logger = new Logger();
                logger.name = AnyRandom.string(5, 10);
                logger.enabled = true;
                consoleStub = sinon.stub(console, "error");
                message = AnyRandom.string(5, 10);
            });

            afterEach(() => {
                unwrap(console.error);
            })

            it(`error - does nothing if the logger is set to SILENT`, () => {
                logger.logLevel = LogLevel.SILENT;

                logger.error(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`error - does nothing if the logger is set to FATAL`, () => {
                logger.logLevel = LogLevel.FATAL;

                logger.error(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`error - sends the message to console.error, and closes any partial, when the logger is set to ERROR`, () => {
                logger.logLevel = LogLevel.ERROR;
                logger.isPartialOpen = true;

                logger.error(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ red(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`error - sends the message to console.error, and closes any partial, when the logger is set to WARN`, () => {
                logger.logLevel = LogLevel.WARN;
                logger.isPartialOpen = true;

                logger.error(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ red(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`error - sends the message to console.error, and closes any partial, when the logger is set to INFO`, () => {
                logger.logLevel = LogLevel.INFO;
                logger.isPartialOpen = true;

                logger.error(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ red(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`error - sends the message to console.error, and closes any partial, when the logger is set to DEBUG`, () => {
                logger.logLevel = LogLevel.DEBUG;
                logger.isPartialOpen = true;

                logger.error(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ red(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`error - sends the message to console.error, and closes any partial, when the logger is set to TRACE`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = true;

                logger.error(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ red(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });
        });

        describe('warn', () => {
            var consoleStub, message;
            beforeEach(() => {
                logger = new Logger();
                logger.name = AnyRandom.string(5, 10);
                logger.enabled = true;
                consoleStub = sinon.stub(console, "warn");
                message = AnyRandom.string(5, 10);
            });

            afterEach(() => {
                unwrap(console.warn);
            })
            it(`warn - does nothing if the logger is set to SILENT`, () => {
                logger.logLevel = LogLevel.SILENT;

                logger.warn(message);

                sinon.assert.notCalled(consoleStub);
            });


            it(`warn - does nothing if the logger is set to FATAL`, () => {
                logger.logLevel = LogLevel.FATAL;

                logger.warn(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`warn - does nothing if the logger is set to ERROR`, () => {
                logger.logLevel = LogLevel.ERROR;

                logger.warn(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`warn - sends the message to console.warn, and closes any partial, when the logger is set to WARN`, () => {
                logger.logLevel = LogLevel.WARN;
                logger.isPartialOpen = true;

                logger.warn(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ yellow(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`warn - sends the message to console.warn, and closes any partial, when the logger is set to INFO`, () => {
                logger.logLevel = LogLevel.INFO;
                logger.isPartialOpen = true;

                logger.warn(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ yellow(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`warn - sends the message to console.warn, and closes any partial, when the logger is set to DEBUG`, () => {
                logger.logLevel = LogLevel.DEBUG;
                logger.isPartialOpen = true;

                logger.warn(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ yellow(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`warn - sends the message to console.warn, and closes any partial, when the logger is set to TRACE`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = true;

                logger.warn(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ yellow(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });
        });

        describe('info', () => {
            var consoleStub, message;
            beforeEach(() => {
                logger = new Logger();
                logger.name = AnyRandom.string(5, 10);
                logger.enabled = true;
                consoleStub = sinon.stub(console, "info");
                message = AnyRandom.string(5, 10);
            });

            afterEach(() => {
                unwrap(console.info);
            })

            it(`info - does nothing if the logger is set to SILENT`, () => {
                logger.logLevel = LogLevel.SILENT;

                logger.info(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`info - does nothing if the logger is set to FATAL`, () => {
                logger.logLevel = LogLevel.FATAL;

                logger.info(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`info - does nothing if the logger is set to ERROR`, () => {
                logger.logLevel = LogLevel.ERROR;

                logger.info(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`info - does nothing if the logger is set to WARN`, () => {
                logger.logLevel = LogLevel.WARN;

                logger.info(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`info - sends the message to console.info, and closes any partial, when the logger is set to INFO`, () => {
                logger.logLevel = LogLevel.INFO;
                logger.isPartialOpen = true;

                logger.info(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ white(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`info - sends the message to console.info, and closes any partial, when the logger is set to DEBUG`, () => {
                logger.logLevel = LogLevel.DEBUG;
                logger.isPartialOpen = true;

                logger.info(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ white(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`info - sends the message to console.info, and closes any partial, when the logger is set to TRACE`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = true;

                logger.info(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ white(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });
        });

        describe('debug', () => {
            var consoleStub, message;
            beforeEach(() => {
                logger = new Logger();
                logger.name = AnyRandom.string(5, 10);
                logger.enabled = true;
                consoleStub = sinon.stub(console, "info");
                message = AnyRandom.string(5, 10);
            });

            afterEach(() => {
                unwrap(console.info);
            })

            it(`debug - does nothing if the logger is set to SILENT`, () => {
                logger.logLevel = LogLevel.SILENT;

                logger.debug(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`debug - does nothing if the logger is set to FATAL`, () => {
                logger.logLevel = LogLevel.FATAL;

                logger.debug(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`debug - does nothing if the logger is set to ERROR`, () => {
                logger.logLevel = LogLevel.ERROR;

                logger.debug(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`debug - does nothing if the logger is set to WARN`, () => {
                logger.logLevel = LogLevel.WARN;

                logger.debug(message);

                sinon.assert.notCalled(consoleStub);
            });


            it(`debug - does nothing if the logger is set to INFO`, () => {
                logger.logLevel = LogLevel.INFO;

                logger.debug(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`debug - sends the message to console.info, and closes any partial, when the logger is set to DEBUG`, () => {
                logger.logLevel = LogLevel.DEBUG;
                logger.isPartialOpen = true;

                logger.debug(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ cyan(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`debug - sends the message to console.info, and closes any partial, when the logger is set to TRACE`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = true;

                logger.debug(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ cyan(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });
        });

        describe('trace', () => {
            var consoleStub, message;
            beforeEach(() => {
                logger = new Logger();
                logger.name = AnyRandom.string(5, 10);
                logger.enabled = true;
                consoleStub = sinon.stub(console, "info");
                message = AnyRandom.string(5, 10);
            });

            afterEach(() => {
                unwrap(console.info);
            })

            it(`trace - does nothing if the logger is set to SILENT`, () => {
                logger.logLevel = LogLevel.SILENT;

                logger.trace(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`trace - does nothing if the logger is set to FATAL`, () => {
                logger.logLevel = LogLevel.FATAL;

                logger.trace(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`trace - does nothing if the logger is set to ERROR`, () => {
                logger.logLevel = LogLevel.ERROR;

                logger.trace(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`trace - does nothing if the logger is set to WARN`, () => {
                logger.logLevel = LogLevel.WARN;

                logger.trace(message);

                sinon.assert.notCalled(consoleStub);
            });


            it(`trace - does nothing if the logger is set to INFO`, () => {
                logger.logLevel = LogLevel.INFO;

                logger.trace(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`trace - does nothing if the logger is set to DEBUG`, () => {
                logger.logLevel = LogLevel.DEBUG;

                logger.trace(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`trace - sends the message to console.info, and closes any partial, when the logger is set to TRACE`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = true;

                logger.trace(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ white(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });
        });

        describe('mark', () => {
            var consoleStub, message;
            beforeEach(() => {
                logger = new Logger();
                logger.name = AnyRandom.string(5, 10);
                logger.enabled = true;
                consoleStub = sinon.stub(console, "info");
                message = AnyRandom.string(5, 10);
            });

            afterEach(() => {
                unwrap(console.info);
            })

            it(`mark - does nothing if the logger is set to SILENT`, () => {
                logger.logLevel = LogLevel.SILENT;

                logger.mark(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`mark - does nothing if the logger is set to FATAL`, () => {
                logger.logLevel = LogLevel.FATAL;

                logger.mark(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`mark - does nothing if the logger is set to ERROR`, () => {
                logger.logLevel = LogLevel.ERROR;

                logger.mark(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`mark - does nothing if the logger is set to WARN`, () => {
                logger.logLevel = LogLevel.WARN;

                logger.mark(message);

                sinon.assert.notCalled(consoleStub);
            });


            it(`mark - does nothing if the logger is set to INFO`, () => {
                logger.logLevel = LogLevel.INFO;

                logger.mark(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`mark - does nothing if the logger is set to DEBUG`, () => {
                logger.logLevel = LogLevel.DEBUG;

                logger.mark(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`mark - sends the message to console.info, and closes any partial, when the logger is set to TRACE`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = true;

                logger.mark(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ magenta(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });
        });

        describe('success', () => {
            var consoleStub, message;
            beforeEach(() => {
                logger = new Logger();
                logger.name = AnyRandom.string(5, 10);
                logger.enabled = true;
                consoleStub = sinon.stub(console, "info");
                message = AnyRandom.string(5, 10);
            });

            afterEach(() => {
                unwrap(console.info);
            })

            it(`success - does nothing if the logger is set to SILENT`, () => {
                logger.logLevel = LogLevel.SILENT;

                logger.success(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`success - does nothing if the logger is set to FATAL`, () => {
                logger.logLevel = LogLevel.FATAL;

                logger.success(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`success - does nothing if the logger is set to ERROR`, () => {
                logger.logLevel = LogLevel.ERROR;

                logger.success(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`success - does nothing if the logger is set to WARN`, () => {
                logger.logLevel = LogLevel.WARN;

                logger.success(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`success - sends the message to console.info, and closes any partial, when the logger is set to INFO`, () => {
                logger.logLevel = LogLevel.INFO;
                logger.isPartialOpen = true;

                logger.success(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ green(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`success - sends the message to console.info, and closes any partial, when the logger is set to DEBUG`, () => {
                logger.logLevel = LogLevel.DEBUG;
                logger.isPartialOpen = true;

                logger.success(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ green(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`success - sends the message to console.info, and closes any partial, when the logger is set to TRACE`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = true;

                logger.success(message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ green(util.format(message)) }`);
                assert.isFalse(logger.isPartialOpen);
            });
        });

        describe('log', () => {
            var consoleStub, message;
            beforeEach(() => {
                logger = new Logger();
                logger.name = AnyRandom.string(5, 10);
                logger.enabled = true;
                consoleStub = sinon.stub(console, "log");
                message = AnyRandom.string(5, 10);
            });

            afterEach(() => {
                unwrap(console.log);
            })

            it(`log - does nothing if the logger is set to SILENT`, () => {
                logger.logLevel = LogLevel.SILENT;

                logger.log(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`log - does nothing if the logger is set to FATAL`, () => {
                logger.logLevel = LogLevel.FATAL;

                logger.log(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`log - does nothing if the logger is set to ERROR`, () => {
                logger.logLevel = LogLevel.ERROR;

                logger.log(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`log - does nothing if the logger is set to WARN`, () => {
                logger.logLevel = LogLevel.WARN;

                logger.log(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`log - sends the message to console.log, and closes any partial, when the logger is set to INFO`, () => {
                logger.logLevel = LogLevel.INFO;
                logger.isPartialOpen = true;

                logger.log(message);

                sinon.assert.calledOnceWithExactly(consoleStub, message);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`log - sends the message to console.log, and closes any partial, when the logger is set to DEBUG`, () => {
                logger.logLevel = LogLevel.DEBUG;
                logger.isPartialOpen = true;

                logger.log(message);

                sinon.assert.calledOnceWithExactly(consoleStub, message);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`log - sends the message to console.log, and closes any partial, when the logger is set to TRACE`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = true;

                logger.log(message);

                sinon.assert.calledOnceWithExactly(consoleStub, message);
                assert.isFalse(logger.isPartialOpen);
            });
        });

        describe('raw', () => {
            var consoleStub, message;
            beforeEach(() => {
                logger = new Logger();
                logger.name = AnyRandom.string(5, 10);
                logger.enabled = true;
                consoleStub = sinon.stub(console, "log");
                message = AnyRandom.string(5, 10);
            });

            afterEach(() => {
                unwrap(console.log);
            })

            it(`raw - does nothing if the logger is set to SILENT`, () => {
                logger.logLevel = LogLevel.SILENT;

                logger.raw(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`raw - does nothing if the logger is set to FATAL`, () => {
                logger.logLevel = LogLevel.FATAL;

                logger.raw(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`raw - does nothing if the logger is set to ERROR`, () => {
                logger.logLevel = LogLevel.ERROR;

                logger.raw(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`raw - does nothing if the logger is set to WARN`, () => {
                logger.logLevel = LogLevel.WARN;

                logger.raw(message);

                sinon.assert.notCalled(consoleStub);
            });

            it(`raw - sends the message to console.log, and closes any partial, when the logger is set to INFO`, () => {
                logger.logLevel = LogLevel.INFO;
                logger.isPartialOpen = true;

                logger.raw(message);

                sinon.assert.calledOnceWithExactly(consoleStub, message);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`raw - sends the message to console.log, and closes any partial, when the logger is set to DEBUG`, () => {
                logger.logLevel = LogLevel.DEBUG;
                logger.isPartialOpen = true;

                logger.raw(message);

                sinon.assert.calledOnceWithExactly(consoleStub, message);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`raw - sends the message to console.log, and closes any partial, when the logger is set to TRACE`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = true;

                logger.raw(message);

                sinon.assert.calledOnceWithExactly(consoleStub, message);
                assert.isFalse(logger.isPartialOpen);
            });
        });

        /** This will NOT output any check marks during the test run, unless it errors */
        describe('beginPartial', () => {
            var consoleStub, message;
            beforeEach(() => {
                logger = new Logger();
                logger.name = AnyRandom.string(5, 10);
                logger.enabled = true;
                consoleStub = sinon.stub(process.stdout, "write");
                message = AnyRandom.string(5, 10);
            });

            afterEach(() => {
                unwrap(process.stdout.write);
            });

            it(`beginPartial - given a level and some text, outputs it using process.stdout.write, in the same color as the level, and sets isPartialOpen to true`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = false;

                logger.beginPartial(LogLevel.DEBUG, message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ LogLevel.DEBUG.color(message) }`);
                assert.isTrue(logger.isPartialOpen);
            });
        });

        /** This will NOT output any check marks during the test run, unless it errors */
        describe('endPartial', () => {
            var consoleStub, processStub, message;
            beforeEach(() => {
                logger = new Logger();
                logger.name = AnyRandom.string(5, 10);
                logger.enabled = true;
                processStub = sinon.stub(process.stdout, "write");
                consoleStub = sinon.stub(console, "info");
                message = AnyRandom.string(5, 10);
            });

            afterEach(() => {
                unwrap(process.stdout.write);
                unwrap(console.info);
            })

            it(`endPartial - given a level and some text, outputs it using process.stdout.write, in the color of the level, and sets isPartialOpen to false`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = true;

                logger.endPartial(LogLevel.DEBUG, message);

                sinon.assert.calledOnceWithExactly(processStub, `${ LogLevel.DEBUG.color(message) }\n`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`endPartial - given a level, outputs it using process.stdout.write, and sets isPartialOpen to false`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = true;

                logger.endPartial(LogLevel.DEBUG);

                sinon.assert.calledOnceWithExactly(processStub, `\n`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`endPartial - if partial isn't open, pass it to info with the header, and sets isPartialOpen to false`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = false;

                logger.endPartial(LogLevel.DEBUG, message);

                sinon.assert.calledOnceWithExactly(consoleStub, `[${ logger.name }] ${ LogLevel.DEBUG.color(message) }\n`);
                assert.isFalse(logger.isPartialOpen);
            });

            it(`endPartial - given no message, if partial isn't open, pass it to info, and sets isPartialOpen to false`, () => {
                logger.logLevel = LogLevel.TRACE;
                logger.isPartialOpen = false;

                logger.endPartial(LogLevel.DEBUG);

                sinon.assert.calledOnceWithExactly(consoleStub, `\n`);
                assert.isFalse(logger.isPartialOpen);
            });
        });
    });

    describe('LogEntryState', () => {

        describe('ctor', () => {
            it('ctor - given no name, throws an error', () => {
                var name;
                const index = AnyRandom.int();
                const color = AnyRandom.oneOf([ red, cyan, yellow, green, white, magenta ]);


                assert.throws(() => {
                    new LogEntryState(name, index, color);
                }, "Cannot create a LogEntryState with no name.");
            });

            it('ctor - given no index, throws an error', () => {
                const name = AnyRandom.string(5, 10);
                var index;
                const color = AnyRandom.oneOf([ red, cyan, yellow, green, white, magenta ]);

                assert.throws(() => {
                    new LogEntryState(name, index, color);
                }, "Cannot create a LogEntryState with no index.");
            });

            it('ctor - given no color function, throws an error', () => {
                const name = AnyRandom.string(5, 10);
                var index = AnyRandom.int();
                var color;

                assert.throws(() => {
                    new LogEntryState(name, index, color);
                }, "Cannot create a LogEntryState with no color function.");
            });
        });

        describe('toString', () => {
            it('toString - returns the uppercased name of the log entry state', () => {
                const name = AnyRandom.string(5, 10);
                const index = AnyRandom.int();
                const colorFunc = () => { return null; };
                const state = new LogEntryState(name, index, colorFunc);

                const result = state.toString();

                assert.equal(result, name.toUpperCase());
            });
        });

        describe('valueOf', () => {
            it('valueOf - returns the name of the log entry state', () => {
                const name = AnyRandom.string(5, 10);
                const index = AnyRandom.int();
                const colorFunc = () => { return null; };
                const state = new LogEntryState(name, index, colorFunc);

                const result = state.valueOf();

                assert.equal(result, index);
            });
        });
    });

    describe('LogLevel', () => {

        describe('ctor', () => {
            it('ctor - given no name, throws an error', () => {
                var name;
                const index = AnyRandom.int();
                const colors = [ red, cyan, yellow, green, white, magenta ];
                const color = colors[ Math.floor(colors.length * Math.random()) ];

                assert.throws(() => {
                    new LogLevel(name, index, color);
                }, "Cannot create a LogLevel with no name.");
            });

            it('ctor - given no index, throws an error', () => {
                const name = AnyRandom.string(5, 10);
                var index;
                const colors = [ red, cyan, yellow, green, white, magenta ];
                const color = colors[ Math.floor(colors.length * Math.random()) ];

                assert.throws(() => {
                    new LogLevel(name, index, color);
                }, "Cannot create a LogLevel with no index.");
            });

            it('ctor - given no color function, throws an error', () => {
                const name = AnyRandom.string(5, 10);
                var index = AnyRandom.int();
                var color;

                assert.throws(() => {
                    new LogLevel(name, index, color);
                }, "Cannot create a LogLevel with no color function.");
            });
        });

        describe('toString', () => {
            it('toString - returns the uppercased name of the log level', () => {
                const level = LogLevel.list[ Math.floor(LogLevel.list.length * Math.random()) ];

                const result = level.toString();

                assert.equal(result, level.name.toUpperCase());
            });
        });

        describe('valueOf', () => {
            it('valueOf - returns the index of the log level', () => {
                const level = AnyRandom.oneOf(LogLevel.list);

                const result = level.valueOf();

                assert.equal(result, level.index);
            });
        });

        describe('coerce', () => {

            [
                { name: 'silent', index: 0, level: LogLevel.SILENT },
                { name: 'fatal', index: 1, level: LogLevel.FATAL },
                { name: 'error', index: 2, level: LogLevel.ERROR },
                { name: 'warn', index: 3, level: LogLevel.WARN },
                { name: 'info', index: 4, level: LogLevel.INFO },
                { name: 'debug', index: 5, level: LogLevel.DEBUG },
                { name: 'trace', index: 6, level: LogLevel.TRACE }
            ].forEach(({ name, index, level }) => {
                it(`coerce - given a name ('${ name }'), returns the proper log level (${ level })`, () => {
                    var result = LogLevel.coerce(name);

                    assert.equal(result, level);
                });

                it(`coerce - given an index (${ index }), returns the proper log level (${ level })`, () => {
                    var result = LogLevel.coerce(index);

                    assert.equal(result, level);
                });
            })

            it(`coerce - given an invalid name, throws an error`, () => {
                var name = LogLevel.TRACE.toString() + AnyRandom.string(5, 10)

                assert.throws(() => {
                    LogLevel.coerce(name);
                }, `No LogLevel exists with name [${ name }].`, `Should have thrown: [${ name }]`);
            });

            it(`coerce - given an invalid index, throws an error`, () => {
                var index = LogLevel.TRACE.valueOf() + 99999999;

                assert.throws(() => {
                    LogLevel.coerce(index);
                }, `No LogLevel exists with index [${ index }].`);
            });


            it(`coerce - given something that's not a string or a number, throws an error`, () => {
                var value = true;

                assert.throws(() => {
                    LogLevel.coerce(value);
                }, `Could not normalize loglevel value [${ value }].`);
            });

            [
                { key: 'null', value: null },
                { key: 'undefined', value: undefined },
            ].forEach(({ key, value }) => {
                it(`coerce - given ${ key }, returns null`, () => {

                    var result = LogLevel.coerce(value);

                    assert.isNull(result);
                });
            });
        });
    });

    describe('LoggerOptions', () => {
        describe('DEFAULT', () => {
            it('DEFAULT - returns the expected object', () => {

                const actual = LoggerOptions.DEFAULT;

                assert.equal(actual.name, "");
                assert.equal(actual.verbose, false);
                assert.equal(actual.quiet, false);
                assert.equal(actual.silent, false);
            });
        });

        describe('ctor', () => {
            it('ctor - given a source, sets the property', () => {
                const name = AnyRandom.string(5, 10);
                const expected = { name: name, verbose: false, quiet: false, silent: false };

                const result = new LoggerOptions(expected);

                assert.equal(result.name, name);
            });
        });
    });

    describe('getLogLevel', () => {

        [
            { options: { debug: false, verbose: false, quiet: false, silent: false }, level: LogLevel.INFO },
            { options: { debug: true, verbose: false, quiet: false, silent: false }, level: LogLevel.DEBUG },
            { options: { debug: false, verbose: true, quiet: false, silent: false }, level: LogLevel.TRACE },
            { options: { debug: false, verbose: false, quiet: true, silent: false }, level: LogLevel.ERROR },
            { options: { debug: false, verbose: false, quiet: false, silent: true }, level: LogLevel.SILENT }
        ].forEach(({ options, level }) => {
            it(`getLogLevel - returns the expected level (${ level })`, () => {
                options.name = AnyRandom.string(5, 10);

                const result = getLogLevel(options);

                assert.equal(result, level);
            });
        });

        [
            { key: 'null', value: null },
            { key: 'undefined', value: undefined }
        ].forEach(({ key, value }) => {
            it(`getLogLevel - given ${ key }, returns the default log level`, () => {
                const result = getLogLevel(value);

                assert.equal(result, DEFAULT_LOG_LEVEL);
            });
        });
    });
})
