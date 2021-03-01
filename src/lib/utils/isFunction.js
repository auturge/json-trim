function isFunction(toCheck) {
    return toCheck && {}.toString.call(toCheck) === '[object Function]';
}
exports.isFunction = isFunction;
