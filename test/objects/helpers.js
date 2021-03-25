const logger = require("../../src/lib/utils/logging").getSingleton('test');
const { LogLevel, LogEntryState } = require("../../src/lib/utils/logging");

/** Unwraps a Sinon spy/stub, releasing the spy/stub to be spied/stubbed again. */
/* eslint-disable */
function _unwrap(sinonStub) {
    sinonStub.restore();
}
/* eslint-enable */

function _enableTrace() {
    logger.enable();
    logger.setLevel(LogLevel.TRACE);
}



module.exports = {
    unwrap: _unwrap,
    enableTrace: _enableTrace
}
