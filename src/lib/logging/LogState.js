const util = require('util');
const { red, yellow, green, white } = require('colorette');

class LogState {

    name = "";
    index = -1;
    color = white;

    constructor(name, index, colorFunc) {
        this.name = Object.freeze((name && name.length) ? name.toUpperCase() : "");
        this.index = Object.freeze(index);
        this.color = Object.freeze(colorFunc);

        this.valueOf = function () {
            return this.index;
        }

        this.toString = function () {
            return this.name;
        }
    }

    /** A log state used when no state is declared. */
    static NONE = Object.freeze(new LogState("NONE", -1, (...val) => util.format(white(...val))));

    /** A log state used when everything went right. */
    static SUCCESS = Object.freeze(new LogState("SUCCESS", 0, (...val) => util.format(green(...val))));

    /** A log level used when one or more functionalities are not working, preventing some functionalities from working correctly. */
    static WARN = Object.freeze(new LogState("WARN", 1, (...val) => util.format(yellow(...val))));

    /** A log state used when anything went wrong. */
    static ERROR = Object.freeze(new LogState("ERROR", 2, (...val) => util.format(red(...val))));
}

module.exports = LogState;
