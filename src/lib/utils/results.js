const logger = require('./logging').getSingleton('json-trim');

function error(error, code = 1) {
    logger.error(error);
    return { 'error': error, 'code': code };
}

function success(content) {
    var result = {
        'error': null,
        'code': 0
    };
    for (var k in content) result[ k ] = content[ k ] || null;
    return result;
}

module.exports = {
    'error': error,
    'success': success
}
