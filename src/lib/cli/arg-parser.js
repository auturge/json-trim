// const { version } = require('commander');
const commander = require('commander');
const getHelp = require('./groups/runHelp');
const getVersion = require('./groups/runVersion');

const logger = require('../utils/logging').getSingleton('json-trim');

/**
 *  Creates Argument parser corresponding to the supplied options
 *  parse the args and return the result
 *
 * @param {object[]} options Array of objects with details about flags
 * @param {string[]} args process.argv or it's subset
 * @param {boolean} argsOnly `false` if all of process.argv has been provided, `true` if
 * args is only a subset of process.argv that removes the first couple elements
 */
const argParser = (options, argsIn, argsOnly = false, name = '') => {
    const parser = new commander.Command();

    // Set parser name
    parser.name(name);
    parser.storeOptionsAsProperties(false);

    const args = argsIn.map((it) => {
        return (typeof (it) === "string") ? it.toLowerCase() : it;
    });

    // Use customized help output
    if (args.includes('--help') || args.includes('help')) {
        getHelp.run(args);
        return process.exit(0);
    }

    // Use Customized version info
    if (args.includes('--version') || args.includes('-ver')) {
        getVersion.run(args);
        return process.exit(0);
    }

    // Allow execution if unknown arguments are present
    parser.allowUnknownOption(true);

    // Register options on the parser
    options.reduce((parserInstance, option) => {
        let optionType = option.type;

        const flags = option.alias ? `-${ option.alias }, --${ option.name }` : `--${ option.name }`;

        let flagsWithType = flags;

        if (optionType !== Boolean) {
            // <value> is a required placeholder for any non-Boolean types
            flagsWithType = `${ flags } <value>`;
        }

        if (optionType === Boolean || optionType === String) {
            if (option.multiple) {
                // a multiple argument parsing function
                const multiArg = (value, previous = []) => previous.concat([ value ]);
                flagsWithType = `${ flags } [values...]`;
                parserInstance.option(flagsWithType, option.description, multiArg, option.defaultValue).action(() => { });
            } else if (option.multipleType) {
                // for options which accept multiple types like env
                // so you can do `--env platform=staging --env production`
                // { platform: "staging", production: true }
                const multiArg = (value, previous = {}) => {
                    // this ensures we're only splitting by the first `=`
                    const [ allKeys, val ] = value.split(/=(.+)/, 2);

                    // this regex splits on .
                    const splitKeys = allKeys.split(/\.(?!$)/);

                    let prevRef = previous;

                    splitKeys.forEach((someKey, index) => {
                        if (!prevRef[ someKey ]) {
                            prevRef[ someKey ] = {};
                        }

                        if ('string' === typeof prevRef[ someKey ]) {
                            prevRef[ someKey ] = {};
                        }

                        if (index === splitKeys.length - 1) {
                            prevRef[ someKey ] = val || true;
                        }

                        prevRef = prevRef[ someKey ];
                    });

                    return previous;
                };
                parserInstance.option(flagsWithType, option.description, multiArg, option.defaultValue).action(() => { });
            } else {
                // Prevent default behavior for standalone options
                parserInstance.option(flagsWithType, option.description, option.defaultValue).action(() => { });
            }
        } else if (optionType === Number) {
            // this will parse the flag as a number
            parserInstance.option(flagsWithType, option.description, Number, option.defaultValue);
        } else {
            throw new Error(`Option type [${ flagsWithType }] not supported.`);
        }

        if (option.negative) {
            // commander requires explicitly adding the negated version of boolean flags
            const negatedFlag = `--no-${ option.name }`;
            parserInstance.option(negatedFlag, `negates ${ option.name }`).action(() => { });
        }

        return parserInstance;
    }, parser);

    // if we are parsing a subset of process.argv that includes
    // only the arguments themselves (e.g. ['--option', 'value'])
    // then we need from: 'user' passed into commander parse
    // otherwise we are parsing a full process.argv
    // (e.g. ['node', '/path/to/...', '--option', 'value'])
    const parseOptions = argsOnly ? { from: 'user' } : {};

    const result = parser.parse(args, parseOptions);
    const opts = result.opts();
    const unknownArgs = result.args;

    args.forEach((arg) => {
        // check for negation ('--no-')
        if (typeof (arg) !== "string")
            return;

        const flagName = arg.slice(5);
        const option = options.find((opt) => opt.name === flagName);
        const flag = `--${ flagName }`;
        const flagUsed = args.includes(flag) && !unknownArgs.includes(flag);
        let alias = '';
        let aliasUsed = false;

        if (option && option.alias) {
            alias = `-${ option.alias }`;
            aliasUsed = args.includes(alias) && !unknownArgs.includes(alias);
        }

        // this is a negated flag that is not an unknown flag, but the flag
        // it is negating was also provided
        if (arg.startsWith('--no-') && (flagUsed || aliasUsed) && !unknownArgs.includes(arg)) {
            logger.warn(
                `You provided both ${ flagUsed ? flag : alias
                } and ${ arg }. We will use only the last of these flags that you provided in your CLI arguments`,
            );
        }
    });

    return {
        unknownArgs,
        opts
    };
};

module.exports = argParser;
