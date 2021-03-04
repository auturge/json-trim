#!/usr/bin/env node

'use strict';

const runCLI = require('../lib/runCLI');
const { Logger } = require('../lib/utils/logging');

process.title = "json-trim";
const [ , , ...rawArgs ] = process.argv;
const logger = Logger.getInstance('json-trim');
runCLI(logger, rawArgs);
