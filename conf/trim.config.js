//
// NOTE: This is the actual trim.config.js used to package and publish trim-json.
//
// Don't mess it up!
//

const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../');

module.exports = () => {

  const SOURCE = './package.json';
  const DESTINATION = './dist/package.json';

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
    'loglevel': 'info'
  }

  return config;
};
