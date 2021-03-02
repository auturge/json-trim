/** Unwraps a Sinon spy/stub, releasing the spy/stub to be spied/stubbed again. */
/* eslint-disable */
function _unwrap(sinonStub) {
    sinonStub.restore();
}
/* eslint-enable */


module.exports = {
    unwrap: _unwrap
}
