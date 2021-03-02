const { Logger, LogLevel } = require("../../src/lib/logging");

class TestLogger extends Logger {
    constructor() {
        super();
        this.source = "Unit Test";
        this.logLevel = LogLevel.SILENT;
        this.isSilent = true;
    }
}


module.exports = TestLogger;
