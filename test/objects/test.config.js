const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../');

module.exports = (env) => {

    const isProd = env && env[ "prod" ] === true;
    const SOURCE = './objects/test.package.json';
    const DESTINATION = './temp/{0}/package.json'.replace('{0}', isProd ? 'prod' : 'dev');

    const config = {
        'source': path.join(PROJECT_ROOT, SOURCE),
        'destination': path.join(PROJECT_ROOT, DESTINATION),
        'keeplist': [
            "author",
            "bugs",
            "contributors",
            "cpu",
            "description",
            "funding",
            "homepage",
            "keywords",
            "license",
            "main",
            "name",
            "os",
            "private",
            "productName",
            "repository",
            "version",
        ],
        'trimlist': [
            'main', ' repository'
        ]
    }

    return config;
};
