import { writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { cwd, stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline';
import { PROTOCOL_VERSION, CATEGORIES, SERVICE_CARD_FILE } from '../constants.js';
import { parseArgs } from '../utils.js';

function question(rl, prompt, defaultVal) {
  const suffix = defaultVal ? ` (${defaultVal})` : '';
  return new Promise((resolve) => {
    rl.question(`  ${prompt}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultVal || '');
    });
  });
}

export async function run(args) {
  const { flags } = parseArgs(args);

  if (flags.help) {
    console.log(`
  mcpr init — Generate mcpr.json in current directory

  Usage:  mcpr init [--yes]

  Options:
    --yes   Skip prompts and use defaults
`);
    return;
  }

  const dest = join(cwd(), SERVICE_CARD_FILE);

  try {
    await access(dest);
    console.error(`  ✗ ${SERVICE_CARD_FILE} already exists in current directory.`);
    return;
  } catch {
    // file doesn't exist, good
  }

  let card;

  if (flags.yes) {
    const dirName = cwd().split('/').pop() || 'my-mcp-server';
    card = makeCard({
      name: dirName,
      version: '0.1.0',
      title: dirName,
      description: 'An MCP server',
      authorName: '',
      transport: 'stdio',
      install: `npx ${dirName}`,
      category: 'other',
      repo: '',
      license: 'MIT',
    });
  } else {
    const rl = createInterface({ input: stdin, output: stdout });
    const dirName = cwd().split('/').pop() || 'my-mcp-server';

    console.log('\n  Creating mcpr.json ...\n');

    const name = await question(rl, 'Package name', dirName);
    const version = await question(rl, 'Version', '0.1.0');
    const title = await question(rl, 'Title', name);
    const description = await question(rl, 'Description', '');
    const authorName = await question(rl, 'Author name', '');
    const transport = await question(rl, 'Transport (stdio/sse/streamable-http)', 'stdio');
    const install = await question(rl, 'Install command', `npx ${name}`);
    const category = await question(rl, `Category (${CATEGORIES.join(', ')})`, 'other');
    const repo = await question(rl, 'Repository URL', '');
    const license = await question(rl, 'License', 'MIT');

    rl.close();

    card = makeCard({ name, version, title, description, authorName, transport, install, category, repo, license });
  }

  await writeFile(dest, JSON.stringify(card, null, 2) + '\n');
  console.log(`\n  ✓ Created ${SERVICE_CARD_FILE}`);
}

function makeCard({ name, version, title, description, authorName, transport, install, category, repo, license }) {
  return {
    mcpr: PROTOCOL_VERSION,
    name,
    version,
    title,
    description,
    author: {
      name: authorName,
      url: '',
      github: '',
    },
    capabilities: {
      tools: [
        {
          name: 'example_tool',
          description: 'An example tool — replace with your actual tools',
          inputSchema: {
            type: 'object',
            properties: {
              input: { type: 'string', description: 'Example input' },
            },
            required: ['input'],
          },
        },
      ],
      resources: [],
      prompts: [],
    },
    tags: [],
    category,
    runtime: {
      transport,
      language: 'typescript',
      install,
      config: {},
    },
    source: {
      repo,
      license,
      homepage: '',
    },
    trust: {
      verified: false,
      openSource: true,
      lastUpdated: new Date().toISOString(),
    },
  };
}
