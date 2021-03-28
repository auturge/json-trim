const { yellow, bold, underline, options } = require('colorette');
const commandLineUsage = require('command-line-usage');

class CLIHelpProvider {

    /** Creates a new instance of the command-line help provider.
     * @param {*} pkgJSON
     * @param {*} flags
     * @param {*} groups
     * @param {*} logger
     * @returns {CLIHelpProvider} A new `CLIHelpProvider` instance.
     */
    static configure(packageName, command, version, flags, logger = console) {
        return new CLIHelpProvider(packageName, command, version, flags, logger);
    }

    /** Creates a new instance of the command-line help provider.
     * @param {*} pkgJSON
     * @param {*} flags
     * @param {*} groups
     * @param {*} logger
     * @returns {CLIHelpProvider} A new `CLIHelpProvider` instance.
     */
    constructor(packageName, command, version, flags, logger = console) {
        if (!packageName || !packageName.length) {
            throw new Error('Argument [packageName] must not be null, undefined, or empty string.');
        }
        if (!command || !command.length) {
            throw new Error('Argument [command] must not be null, undefined, or empty string.');
        }
        if (!version || !version.length) {
            throw new Error('Argument [version] must not be null, undefined, or empty string.');
        }
        if (!flags) {
            throw new Error('Must specify a set of flags/options.');
        }

        this.options = {
            packageName: packageName,
            command: command,
            version: version,
            flags: flags,
        }
        this.logger = logger;

        this.flagNames = this._getFlagNames(flags);
        this.allNames = [ ...this.flagNames ];
    }

    handle(args, requireArgs = false) {
        if (!(args && args.length)) {
            if (requireArgs)
                throw new Error('Arguments are required.');

            return;
        }

        // convert the args to lowercase
        args = args.map((it) => {
            return (typeof (it) === "string") ? it.toLowerCase() : it;
        });

        this.args = args;

        // Use customized help info
        if (
            args.includes('--help')// regular help
            || args.includes('-h') // regular help
            || args.includes('help') // help on a flag or command
        ) {
            this._outputHelp(args);
            return process.exit(0);
        }

        // Use Customized version info
        if (args.includes('--version') || args.includes('-ver')) {
            this._outputVersion(args);
            return process.exit(0);
        }
    }

    _outputHelp = (cliArgs) => {
        // set colorette options
        options.enabled = !cliArgs.includes('--no-color');
        this._printInvalidArgWarning(cliArgs);

        const flagOrCommandUsed = this.allNames.filter((name) => {
            return cliArgs.includes(name);
        })[ 0 ];

        // Print full help when no flag or command is supplied with help
        if (flagOrCommandUsed) {
            this._printSubHelp(flagOrCommandUsed);
        } else {
            this.logger.log(this._getCommandLineUsage());
        }
        this.logger.log('\n                  Made with ♥️ by auturge!');
    };

    _displayText = (header, text) => {
        const formattedHeader = bold(underline(header));
        this.logger.log(`${ formattedHeader }: ${ text }`);
    }

    // This function is responsible for printing command/flag scoped help
    _printSubHelp = (subject) => {
        const info = this.options.flags;
        // Contains object with details about given subject
        const option = info.find((flag) => {
            return flag.name === subject.slice(2) || flag.alias === subject.slice(1);
        });

        const flagAlias = option.alias ? (` -${ option.alias },`) : '';
        const usage = yellow(`${ this.options.command }${ flagAlias } ${ option.usage }`);
        const description = option.description;
        const link = option.link;

        this._displayText('Usage', usage);
        this._displayText('Description', description);
        if (link) {
            this._displayText('Documentation', link);
        }
    };

    // This function checks for and prints a warning about invalid flag
    _printInvalidArgWarning = (args) => {
        const invalidArgs = this._hasUnknownArgs(args, this.allNames);
        if (invalidArgs.length > 0) {
            this.logger.warn(`You provided an invalid option '${ invalidArgs[ 0 ] }'.`);
        }
    };

    // This function checks for and prints an error about invalid flag
    _printInvalidArgError = (args) => {
        const invalidArgs = this._hasUnknownArgs(args, this.allNames);
        if (invalidArgs.length > 0) {
            this.logger.error(`Error: Invalid option '${ invalidArgs[ 0 ] }'.`);
            this.logger.info(`Run ${ this.options.command } --help to see available commands and arguments.\n`);
            return process.exit(2);
        }
    };

    _getCommandLineUsage = () => {
        const usageOpts = this._getCommandLineUsageOptions();
        return commandLineUsage(usageOpts);
    };

    _getCommandLineUsageOptions = () => {
        const flags = this.options.flags;
        const command = this.options.command;
        const packageName = this.options.packageName;

        const o = (s) => yellow(s);
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

        // const desc = 'The build tool for modern web applications';
        // const websitelink = '         ' + underline('https://webpack.js.org');

        const usage = bold('Usage') + ': ' + '`' + o(`${ command } [...options]`) + '`';
        const examples = bold('Example') + ': ' + '`' + o(`${ command } help --flag`) + '`';

        const hh = `          ` +
            `${ titleText }` + `\n\n` +
            `${ usage }` + `\n\n` +
            `${ examples }` + `\n\n`;
        //  ${websitelink}\n
        // ${desc}\n

        const usageOpts = [
            {
                content: hh,
                raw: true,
            }
        ];

        if (flags.length) {
            usageOpts.push({
                header: 'Options',
                optionList: flags
                    .map((e) => {
                        // don't support array'd option types
                        // if (e.type.length > 1) e.type = e.type[ 0 ];

                        // Here we replace special characters with chalk's escape
                        // syntax (`\$&`) to avoid chalk trying to re-process our input.
                        // This is needed because chalk supports a form of `{var}`
                        // interpolation.

                        e.description = e.description.replace(/[{}\\]/g, '\\$&');
                        return e;
                    })
                    .concat(negatedFlags),
            })
        }

        return usageOpts;
    };

    _outputVersion = (args) => {
        this._printInvalidArgError(args);

        this.logger.log(`\n${ this.options.packageName } ${ this.options.version }\n`);
    };

    // Contains an array of strings with core cli flags and their aliases
    _getFlagNames = (flags) => {
        return flags
            .map(({ alias, name }) => {
                if (name === 'help') return [];
                if (alias) {
                    return [ `--${ name }`, `-${ alias }` ];
                }
                return [ `--${ name }` ];
            })
            .reduce((arr, val) => arr.concat(val), []);
    }

    _hasUnknownArgs = (args, names) =>
        args.filter((e) => !names.includes(e) && !e.includes('color') && e !== 'version' && e !== '-v' && !e.includes('help') && e !== '-h');
}


module.exports = {
    CLIHelpProvider
}
