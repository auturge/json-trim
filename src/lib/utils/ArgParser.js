const commander = require('commander');

const DEFAULT_OPTS = {
    unknownArgs: [],
    opts: []
};

class ArgParser {

    /** Creates a new instance of the command-line argument parser.
     * @param {*} title
     * @param {*} flags
     * @param {*} groups
     * @param {*} logger
     * @returns {ArgParser} A new `ArgParser` instance.
     */
    static configure(title, flags, groups, logger = console) {
        return new ArgParser(title, flags, groups, logger);
    }

    /** Creates a new instance of the command-line argument parser.
     * @param {*} title
     * @param {*} flags
     * @param {*} groups
     * @param {*} commands
     * @param {*} logger
     * @returns {ArgParser} A new `ArgParser` instance.
     */
    constructor(title, flags, groups, logger = console) {
        // TODO: guard code

        this.options = {
            title: title,
            groups: groups,
            flags: flags
        }
        this.logger = logger;
    }

    /**
     * Parse the arguments
     * @param {*} args the arguments to parse
     * @param {boolean} argsOnly `false` if all of process.argv has been provided, `true` if args is only a subset of process.argv that removes the first couple elements
     * @returns
     */
    parse = (args, argsOnly = false) => {

        if (args && args.length) {
            // convert the args to lowercase
            args = args.map((it) => {
                return (typeof (it) === "string") ? it.toLowerCase() : it;
            });
        }

        // store the args
        this.args = args;

        if (!args || !args.length)
            return DEFAULT_OPTS;

        // Configure the parser
        const parser = this._configureNewParser(this.options);

        // if we are parsing a subset of process.argv that includes
        // only the arguments themselves (e.g. ['--option', 'value'])
        // then we need from: 'user' passed into commander parse
        // otherwise we are parsing a full process.argv
        // (e.g. ['node', '/path/to/...', '--option', 'value'])
        const parseOptions = argsOnly ? { from: 'user' } : {};

        const result = parser.parse(args, parseOptions);
        const opts = result.opts();
        const unknownArgs = result.args;

        this._guardAgainstUseAndNegation(args, this.options.flags, unknownArgs);

        return {
            unknownArgs,
            opts
        };
    }

    _configureNewParser = (options) => {
        const parser = new commander.Command();

        parser.name(options.title);
        parser.storeOptionsAsProperties(false);
        parser.allowUnknownOption(true);

        // Register options on the parser
        options.flags.reduce((parserInstance, option) => {
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

        return parser;
    };

    _guardAgainstUseAndNegation = (args, flags, unknownArgs) => {
        // check for negation (e.g., '--no-')
        args.forEach((arg) => {
            if (typeof (arg) !== "string")
                return;

            const flagName = arg.slice(5);
            const option = flags.find((opt) => opt.name === flagName);
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
                this.logger.warn(
                    `You provided both ${ flagUsed ? flag : alias
                    } and ${ arg }. We will use only the last of these flags that you provided in your CLI arguments`,
                );
            }
        });
    };
}

module.exports = {
    ArgParser
}
