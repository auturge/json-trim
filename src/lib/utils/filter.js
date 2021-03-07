function filter(func, array) {
    // taken/modified from the polyfill at
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter

    'use strict';
    if (!(typeof func === 'function' && array))
        throw new TypeError();

    var len = array.length >>> 0,
        res = new Array(len), // preallocate array
        t = array, c = 0, i = -1;

    var kValue;
    while (++i !== len) {
        // checks to see if the key was set
        if (i in array) {
            kValue = t[ i ]; // in case t is changed by func
            if (func.call(array, t[ i ], i, t)) {
                res[ c++ ] = kValue;
            }
        }
    }

    res.length = c; // shrink down array to proper size
    return res;
}

module.exports = (func, array) => filter(func, array);
