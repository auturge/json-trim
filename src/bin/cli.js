#!/usr/bin/env node

'use strict';

const runCLI = require('../lib/runCLI');

process.title = "json-trim";
const [ , , ...rawArgs ] = process.argv;

runCLI(rawArgs);
