const { Logger } = require("../../src/lib/utils/logging");

class TestLogger extends Logger {
    constructor() {
        super({ silent: true });
        this.name = "Unit Test";
    }
}


module.exports = TestLogger;
