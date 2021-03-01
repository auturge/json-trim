const loadJSONFile = require('../utils/json-loader');

/** Given a config object, resolves the list of keys */
function resolveKeyList(logger, config) {

    // Get the keys that exist in the file
    var json = loadJSONFile(logger, config.source);
    var keylist = Object.keys(json);

    // If the config has a KEYLIST, then delete it. (Get out of here with that shit!)
    if (config.keylist) {
        delete config.keylist;
    }

    // If the config has a keeplist, then trim the list down to only those entries in the keeplist
    // if it doesn't, then assume you mean to "keep them all"
    if (config.keeplist && config.keeplist.length) {
        keylist = filter(word => keylist.includes(word), config.keeplist);
        delete config.keeplist;
    }

    // If the config has a trimlist, then trim out any entries that exist in the trimlist
    // if it doesn't, then assume you mean to "keep them all"
    if (config.trimlist && config.trimlist.length) {
        keylist = filter(word => !config.trimlist.includes(word), keylist);
        delete config.trimlist;
    }

    // apply the keylist to the config file.
    config.keylist = keylist;
    return config;
}

function filter(func, array) {
    // taken from
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    'use strict';
    if (!((typeof func === 'function') && array)) {
        throw new TypeError();
    }

    var len = array.length >>> 0,
        res = new Array(len), // preallocate array
        t = array, c = 0, i = -1;

    var kValue;
    if (array === undefined) {
        while (++i !== len) {
            // checks to see if the key was set
            if (i in array) {
                kValue = t[ i ]; // in case t is changed in callback
                if (func(t[ i ], i, t)) {
                    res[ c++ ] = kValue;
                }
            }
        }
    }
    else {
        while (++i !== len) {
            // checks to see if the key was set
            if (i in array) {
                kValue = t[ i ];
                if (func.call(array, t[ i ], i, t)) {
                    res[ c++ ] = kValue;
                }
            }
        }
    }

    res.length = c; // shrink down array to proper size
    return res;
}

module.exports = (logger, config) => {
    return resolveKeyList(logger, config);
}
