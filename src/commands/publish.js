import { loadServiceCard, parseArgs } from '../utils.js';
import { validate } from '../validator.js';
import { addPackage, getPackage } from '../registry.js';

export async function run(args) {
  const { flags } = parseArgs(args);

  if (flags.help) {
    console.log(`
  mcpr publish — Publish MCP server to registry

  Usage:  mcpr publish

  Reads mcpr.json from the current directory, validates it,
  and publishes to the local registry.
`);
    return;
  }

  let card;
  try {
    card = await loadServiceCard();
  } catch (err) {
    console.error(`  ✗ Could not read mcpr.json: ${err.message}`);
    process.exit(1);
  }

  const result = validate(card);
  if (!result.valid) {
    console.error(`  ✗ Validation failed:\n`);
    for (const e of result.errors) {
      console.error(`    • ${e}`);
    }
    process.exit(1);
  }

  // Check for duplicate version
  const existing = await getPackage(card.name);
  if (existing && existing.versions[card.version]) {
    console.error(`  ✗ ${card.name}@${card.version} is already published.`);
    console.error(`  Bump the version in mcpr.json and try again.`);
    process.exit(1);
  }

  await addPackage(card);

  console.log(`  ✓ Published ${card.name}@${card.version}`);
}
