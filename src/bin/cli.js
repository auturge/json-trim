#!/usr/bin/env node

'use strict';

const runCLI = require('../lib/bootstrap');

process.title = 'json-trim';

const [ , , ...rawArgs ] = process.argv;

runCLI(rawArgs);
