#!/usr/bin/env node

const { program } = require('commander')
const package = require('../package.json')
const server = require('../lib/server')
const builder = require('../lib/builder')

program.option('-v, --version', 'Show version of p5-manager', package.version);

program
	.command('server')
	.alias('s')
	.description('Run run run')
	.option('-p, --port [port]', 'HTTP port to start server')
	.action(function (req) {
    console.log('run run')
		server.run(req.port || 5555);
	});


program
	.command('build')
	.alias('b')
	.description('Build public/sketch.js')
	.action(function (req) {
		builder.run();
	});


program.parse(process.argv);