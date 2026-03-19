import { getAllPackages, loadRegistry } from '../registry.js';
import { parseArgs, padEnd } from '../utils.js';

export async function run(args) {
  const { flags } = parseArgs(args);

  if (flags.help) {
    console.log(`
  mcpr stats — Show registry statistics

  Usage:  mcpr stats
`);
    return;
  }

  const registry = await loadRegistry();
  const packages = await getAllPackages();

  if (packages.length === 0) {
    console.log('\n  Registry is empty. Publish your first package with: mcpr publish\n');
    return;
  }

  // Category breakdown
  const categories = {};
  let totalVersions = 0;

  for (const pkg of packages) {
    const cat = pkg.card?.category || 'other';
    categories[cat] = (categories[cat] || 0) + 1;
    totalVersions += pkg.versionCount;
  }

  console.log(`
  MCPR Registry Stats
  ${'─'.repeat(35)}

  Packages:     ${packages.length}
  Versions:     ${totalVersions}
  Categories:   ${Object.keys(categories).length}
`);

  console.log('  By category:');
  const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sorted) {
    const bar = '█'.repeat(Math.min(count, 30));
    console.log(`    ${padEnd(cat, 16)} ${padEnd(String(count), 4)} ${bar}`);
  }

  console.log(`\n  Recent packages:`);
  const recent = packages.slice(-5).reverse();

  for (const pkg of recent) {
    console.log(`    • ${padEnd(pkg.name, 24)} ${pkg.card?.version || '—'}`);
  }
  console.log('');
}
