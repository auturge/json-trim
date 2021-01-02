
const path = require("path");
const fs = require("fs");
const isValid = require("is-valid-path");
const { exit } = require("process");
const logger = require('../utils/logger');
const LOG_LEVEL = require("../config/LOG_LEVEL");

var quiet = false;
var verbose = false;
var source = '';
var target = '';

function VERBOSE() { verbose && logger.log.apply(logger, arguments); }

function setup(config) {
  verbose = config.loglevel >= LOG_LEVEL.VERBOSE;
  quiet = config.loglevel <= LOG_LEVEL.ERROR;

  logger.log(`verbose: ${ verbose }`);
  logger.log(`quiet: ${ quiet }`);

  source = config.source;
  target = config.destination;
}

function execute(config) {
  setup(config);

  if (!isValid(target)) {
    logger.error(`${ target } is not a valid path.`);
    exit(1);
  }

  if (!fs.existsSync(source)) {
    logger.error(`Could not find source file [${ source }].`);
    exit(1);
  }

  const targetFolder = target.match(/(.*)[\/\\]/)[ 1 ] || '';
  if (!fs.existsSync(targetFolder)) {
    console.error(`Target folder [${ targetFolder }] does not exist.`);
    exit(1);
  }

  trim(source, target, config.keylist);
};

function trim(source, target, keylist) {
  if (!source) {
    logger.error('No Source filename provided.');
    exit(1);
  }
  if (!target) {
    logger.error('No Target filename provided.');
    exit(1);
  }

  // resolve the relative paths
  let sourceFilePath = path.resolve(source);
  let targetFilePath = path.resolve(target);

  if (!quiet) {
    process.stdout.write("[json-trim]  Trimming json... ");
  }
  if (verbose) { process.stdout.write("\n"); }

  VERBOSE(` `);
  VERBOSE(`    SOURCE:    ${ sourceFilePath }`);
  VERBOSE(`    TARGET:    ${ targetFilePath }`);
  VERBOSE(`    KEYS:      ${ keylist }`);

  // get the source
  VERBOSE(` `);
  VERBOSE(`    Reading file at '${ sourceFilePath }'.`);
  let sourceFile = fs.readFileSync(sourceFilePath, 'utf8');

  // create a clone in memory, keeping only the desired parts
  let clone = JSON.parse(sourceFile);
  if (keylist) {
    for (let key in clone) {
      if (clone.hasOwnProperty(key)) {
        if (!keylist.includes(key)) {
          VERBOSE(`      Removing key '${ key }'.`);
          delete clone[ key ];
        }
      }
    }
  } else {
    VERBOSE('      No parts specified. Cloning the entire file.');
  }

  // save the clone
  VERBOSE(`    Writing file to '${ targetFilePath }'.`);
  let json = JSON.stringify(clone, null, 2);
  fs.writeFileSync(targetFilePath, json, 'utf8');

  // done!
  if (!quiet) {
    VERBOSE(' ');
    if (verbose) { process.stdout.write('[json-trim]  ...'); }
    process.stdout.write("done!");
    console.log(` `);
  }
};

module.exports = (config) => execute(config);
