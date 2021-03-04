function isFunction(toCheck) {
    if (toCheck == null)
        return false;

    return toCheck && {}.toString.call(toCheck) === '[object Function]';
}
exports.isFunction = isFunction;
