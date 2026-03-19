import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline';
import { getPackage } from '../registry.js';
import { parseArgs } from '../utils.js';

const CLIENT_CONFIGS = {
  'claude-code': {
    name: 'Claude Code',
    path: () => join(homedir(), '.claude', 'claude_desktop_config.json'),
  },
  'claude-desktop': {
    name: 'Claude Desktop',
    path: () => join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
  },
  cursor: {
    name: 'Cursor',
    path: () => join(homedir(), '.cursor', 'mcp.json'),
  },
};

function question(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(`  ${prompt}: `, (answer) => resolve(answer.trim()));
  });
}

export async function run(args) {
  const { _, flags } = parseArgs(args);

  if (flags.help || _.length === 0) {
    console.log(`
  mcpr install — Install MCP server to a client

  Usage:  mcpr install <package-name> [--client <client>]

  Clients:
    claude-code      Claude Code CLI (~/.claude/claude_desktop_config.json)
    claude-desktop   Claude Desktop (macOS)
    cursor           Cursor editor (~/.cursor/mcp.json)

  If --client is omitted, you will be prompted to choose.
`);
    return;
  }

  const name = _[0];
  const pkg = await getPackage(name);

  if (!pkg) {
    console.error(`  ✗ Package "${name}" not found in registry.`);
    process.exit(1);
  }

  const card = pkg.versions[pkg.latest].card;
  let clientKey = flags.client;

  if (!clientKey) {
    console.log('\n  Select a client:\n');
    const keys = Object.keys(CLIENT_CONFIGS);
    keys.forEach((k, i) => console.log(`    ${i + 1}. ${CLIENT_CONFIGS[k].name} (${k})`));

    const rl = createInterface({ input: stdin, output: stdout });
    const choice = await question(rl, '\n  Enter number');
    rl.close();

    clientKey = keys[parseInt(choice, 10) - 1];
  }

  const clientDef = CLIENT_CONFIGS[clientKey];
  if (!clientDef) {
    console.error(`  ✗ Unknown client "${clientKey}".`);
    console.error(`  Available: ${Object.keys(CLIENT_CONFIGS).join(', ')}`);
    process.exit(1);
  }

  // Collect config values
  const env = {};
  const configSpec = card.runtime?.config || {};
  const configKeys = Object.keys(configSpec);

  if (configKeys.length > 0) {
    const rl = createInterface({ input: stdin, output: stdout });
    console.log(`\n  Configure ${card.name}:\n`);

    for (const key of configKeys) {
      const spec = configSpec[key];
      const req = spec.required ? ' (required)' : '';
      const def = spec.default !== undefined ? ` [${spec.default}]` : '';
      const val = await question(rl, `${key}${req}${def}`);
      if (val) {
        env[key] = val;
      } else if (spec.default !== undefined) {
        env[key] = String(spec.default);
      }
    }
    rl.close();
  }

  // Build MCP server entry
  const serverEntry = buildServerEntry(card, env);

  // Write to client config
  const configPath = clientDef.path();
  let config;
  try {
    const raw = await readFile(configPath, 'utf-8');
    config = JSON.parse(raw);
  } catch {
    config = {};
  }

  if (!config.mcpServers) config.mcpServers = {};
  config.mcpServers[card.name] = serverEntry;

  await mkdir(join(configPath, '..'), { recursive: true });
  await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');

  console.log(`\n  ✓ Installed ${card.name} to ${clientDef.name}`);
  console.log(`    Config: ${configPath}\n`);
}

function buildServerEntry(card, env) {
  const transport = card.runtime?.transport || 'stdio';
  const installCmd = card.runtime?.install || '';
  const parts = installCmd.split(/\s+/);

  if (transport === 'stdio') {
    const entry = { command: parts[0] || 'npx', args: parts.slice(1) };
    if (Object.keys(env).length > 0) entry.env = env;
    return entry;
  }

  // SSE / streamable-http
  return { url: installCmd, transport, env: Object.keys(env).length > 0 ? env : undefined };
}
