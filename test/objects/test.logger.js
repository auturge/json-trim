const { Logger } = require("../../src/lib/utils/logging");

class TestLogger extends Logger {
    constructor() {
        super({ silent: true });
        this.source = "Unit Test";
    }
}


module.exports = TestLogger;
