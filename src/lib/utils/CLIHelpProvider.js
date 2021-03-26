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
    static configure(pkgJSON, flags, groups, logger = console) {
        return new CLIHelpProvider(pkgJSON, flags, groups, logger);
    }

    /** Creates a new instance of the command-line help provider.
     * @param {*} pkgJSON
     * @param {*} flags
     * @param {*} groups
     * @param {*} logger
     * @returns {CLIHelpProvider} A new `CLIHelpProvider` instance.
     */
    constructor(pkgJSON, flags, groups, logger = console) {

        // TODO: guard code

        this.options = {
            packageJSON: pkgJSON,
            title: pkgJSON.name,
            version: pkgJSON.version,
            groups: groups,
            flags: flags,
        }
        this.logger = logger;

        this.flagNames = this.#_getFlagNames(flags);
        this.allNames = [ ...this.flagNames ];
    }

    handle(args) {

        // TODO Guard code

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
        this.#_printInvalidArgWarning(cliArgs);

        const flagOrCommandUsed = this.allNames.filter((name) => {
            return cliArgs.includes(name);
        })[ 0 ];

        // Print full help when no flag or command is supplied with help
        if (flagOrCommandUsed) {
            this.#_printSubHelp(flagOrCommandUsed);
        } else {
            this.logger.log(this.#_getCommandLineUsage());
        }
        this.logger.log('\n                  Made with ♥️ by auturge!');
    };

    // This function is responsible for printing command/flag scoped help
    #_printSubHelp = (subject) => {
        const info = this.options.flags;
        // Contains object with details about given subject
        const options = info.find((commandOrFlag) => {
            return commandOrFlag.name === subject.slice(2) || commandOrFlag.alias === subject.slice(1);
        });

        const header = (head) => bold(underline(head));
        const flagAlias = options.alias ? (` -${ options.alias },`) : '';
        const usage = yellow(`${ this.options.title }${ flagAlias } ${ options.usage }`);
        const description = options.description;
        const link = options.link;

        this.logger.log(`${ header('Usage') }: ${ usage }`);
        this.logger.log(`${ header('Description') }: ${ description }`);

        if (link) {
            this.logger.log(`${ header('Documentation') }: ${ link }`);
        }

        if (options.flags) {
            const flags = commandLineUsage({
                header: 'Options',
                optionList: options.flags,
            });
            this.logger.log(flags);
        }
    };

    // This function prints a warning about invalid flag
    #_printInvalidArgWarning = (args) => {
        const invalidArgs = this.#_hasUnknownArgs(args, this.allNames);
        if (invalidArgs.length > 0) {
            const argType = invalidArgs[ 0 ].startsWith('-') ? 'option' : 'command';
            this.logger.warn(`You provided an invalid ${ argType } '${ invalidArgs[ 0 ] }'.`);
        }
    };

    #_getCommandLineUsage = () => {
        const flags = this.options.flags;
        const title = this.options.title;

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
        const titleText = bold('⬡                     ') + underline(title) + bold('                     ⬡');
        // const desc = 'The build tool for modern web applications';
        // const websitelink = '         ' + underline('https://webpack.js.org');

        const usage = bold('Usage') + ': ' + '`' + o(`${ title } [...options]`) + '`';
        const examples = bold('Example') + ': ' + '`' + o(`${ title } help --flag`) + '`';

        const hh = `          ${ titleText }\n
		${ usage }\n
		${ examples }\n
`;
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
                        if (e.type.length > 1) e.type = e.type[ 0 ];
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

        return commandLineUsage(usageOpts);
    };

    _outputVersion = (args) => {
        // The command with which version is invoked
        const invalidArgs = this.#_hasUnknownArgs(args, this.allNames);

        if (invalidArgs.length > 0) {
            const argType = invalidArgs[ 0 ].startsWith('-') ? 'option' : 'command';
            this.logger.error(`Error: Invalid ${ argType } '${ invalidArgs[ 0 ] }'.`);
            this.logger.info(`Run ${ title } --help to see available commands and arguments.\n`);
            return process.exit(2);
        }

        this.logger.log(`\n${ this.options.title } ${ this.options.version }\n`);
    };

    // Contains an array of strings with core cli flags and their aliases
    #_getFlagNames = (flags) => {
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

    #_hasUnknownArgs = (args, names) =>
        args.filter((e) => !names.includes(e) && !e.includes('color') && e !== 'version' && e !== '-v' && !e.includes('help') && e !== '-h');
}


module.exports = {
    CLIHelpProvider
}
