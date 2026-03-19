#!/usr/bin/env node

import { resolve } from 'node:path';
import { argv, exit } from 'node:process';

const commands = {
  init: () => import('../src/commands/init.js'),
  validate: () => import('../src/commands/validate.js'),
  publish: () => import('../src/commands/publish.js'),
  search: () => import('../src/commands/search.js'),
  info: () => import('../src/commands/info.js'),
  install: () => import('../src/commands/install.js'),
  stats: () => import('../src/commands/stats.js'),
};

const args = argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  console.log(`
  mcpr — MCP Registry Protocol CLI v0.1

  Usage:  mcpr <command> [options]

  Commands:
    init        Generate mcpr.json template in current directory
    validate    Validate mcpr.json in current directory
    publish     Publish MCP server to registry
    search      Search for MCP servers
    info        Show details of an MCP server
    install     Install MCP server to a client
    stats       Show registry statistics

  Run mcpr <command> --help for command-specific help.
`);
  exit(0);
}

if (!commands[command]) {
  console.error(`  Unknown command: ${command}\n  Run mcpr --help for available commands.`);
  exit(1);
}

const mod = await commands[command]();
await mod.run(args.slice(1));
