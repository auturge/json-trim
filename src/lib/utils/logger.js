const util = require('util');
const { red, cyan, yellow, green } = require('colorette');

// TODO Figure out logging
// Verbose should show any level
// default should show success, error, warn, info, log
// "quiet" should show only error

// TODO parse log level from string, not number

module.exports = {
  error: (...val) => console.error(`[json-trim] ${ red(util.format(...val)) }`),
  warn: (...val) => console.warn(`[json-trim] ${ yellow(...val) }`),
  info: (...val) => console.log(`[json-trim] ${ val }`),
  trace: (...val) => console.info(`[json-trim] ${ cyan(val) }`),
  success: (...val) => console.log(`[json-trim] ${ green(...val) }`),
  log: (...val) => console.log(`[json-trim] ${ val }`),
  raw: (...val) => console.log(...val),
};
