const hyphenToUpperCase = (name) => {
    if (!name) {
        return name;
    }
    return name.replace(/-([a-z])/g, function (g) {
        return g[ 1 ].toUpperCase();
    });
};

module.exports = { hyphenToUpperCase };
