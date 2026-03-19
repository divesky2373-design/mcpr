import { getPackage } from '../registry.js';
import { parseArgs, formatRating, formatDownloads } from '../utils.js';

export async function run(args) {
  const { _, flags } = parseArgs(args);

  if (flags.help || _.length === 0) {
    console.log(`
  mcpr info — Show details of an MCP server

  Usage:  mcpr info <package-name> [--version <ver>]
`);
    return;
  }

  const name = _[0];
  const pkg = await getPackage(name);

  if (!pkg) {
    console.error(`  ✗ Package "${name}" not found.`);
    process.exit(1);
  }

  const ver = flags.version || pkg.latest;
  const entry = pkg.versions[ver];

  if (!entry) {
    console.error(`  ✗ Version "${ver}" not found for ${name}.`);
    console.error(`  Available: ${Object.keys(pkg.versions).join(', ')}`);
    process.exit(1);
  }

  const card = entry.card;
  const stats = pkg.stats;

  console.log(`
  ${card.title} (${card.name})
  ${'─'.repeat(40)}

  Version:      ${card.version}
  Description:  ${card.description}
  Author:       ${card.author?.name || '—'}${card.author?.github ? ` (@${card.author.github})` : ''}
  Category:     ${card.category || '—'}
  Tags:         ${(card.tags || []).join(', ') || '—'}
  Transport:    ${card.runtime?.transport || '—'}
  Install:      ${card.runtime?.install || '—'}
  License:      ${card.source?.license || '—'}
  Repo:         ${card.source?.repo || '—'}
  Rating:       ${formatRating(stats.rating)}
  Downloads:    ${formatDownloads(stats.downloads)}
  Published:    ${entry.publishedAt}
  Versions:     ${Object.keys(pkg.versions).join(', ')}
`);

  // Tools
  const tools = card.capabilities?.tools || [];
  if (tools.length > 0) {
    console.log('  Tools:');
    for (const tool of tools) {
      console.log(`    • ${tool.name} — ${tool.description}`);
    }
    console.log('');
  }

  // Config
  const config = card.runtime?.config;
  if (config && Object.keys(config).length > 0) {
    console.log('  Config:');
    for (const [key, val] of Object.entries(config)) {
      const req = val.required ? '(required)' : '(optional)';
      const secret = val.secret ? ' [secret]' : '';
      console.log(`    • ${key}: ${val.type || 'string'} ${req}${secret} — ${val.description || ''}`);
    }
    console.log('');
  }
}
