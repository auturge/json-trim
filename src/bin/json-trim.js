#!/usr/bin/env node

'use strict';

const { runCLI } = require('../lib/runCLI');

const [ , , ...rawArgs ] = process.argv;

runCLI(rawArgs);
