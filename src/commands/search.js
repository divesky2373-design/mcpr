import { searchPackages } from '../registry.js';
import { parseArgs, formatRating, formatDownloads, padEnd } from '../utils.js';

export async function run(args) {
  const { _, flags } = parseArgs(args);

  if (flags.help) {
    console.log(`
  mcpr search — Search for MCP servers

  Usage:  mcpr search [query]
          mcpr search --tag email --tag notification
          mcpr search --category communication

  Options:
    --tag        Filter by tag (repeatable)
    --category   Filter by category
`);
    return;
  }

  const query = _.join(' ') || null;
  let tags = flags.tag || null;
  if (tags && !Array.isArray(tags)) tags = [tags];
  const category = flags.category || null;

  const results = await searchPackages({ query, tags, category });

  if (results.length === 0) {
    console.log('\n  No packages found.\n');
    return;
  }

  console.log('');
  for (const { name, card, stats } of results) {
    const rating = formatRating(stats.rating);
    const dl = formatDownloads(stats.downloads);
    const cat = card.category || '';

    console.log(`  ${padEnd(name, 24)} ${padEnd(rating, 6)} ${padEnd('↓ ' + dl, 8)} ${cat}`);
    console.log(`  ${card.description}`);
    if (card.runtime?.install) {
      console.log(`  ▸ ${card.runtime.install}`);
    }
    console.log('');
  }
}
