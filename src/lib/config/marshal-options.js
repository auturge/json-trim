/** Make sure the parsed options object has all the required properties */
function marshalOptions(parsedOpts) {

    // the final output needs/must include:
    //   config  :  string
    //   env     :  string | undefined

    var config = Object.assign({}, parsedOpts);
    if (!parsedOpts) {
        config.config = '';
        config.env = null;
    } else {
        config.config = parsedOpts.config || '';
        config.env = parsedOpts.env || null;
    }

    return config;
}

module.exports = (parsedOpts) => {
    return marshalOptions(parsedOpts);
}
