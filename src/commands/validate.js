import { loadServiceCard, parseArgs } from '../utils.js';
import { validate } from '../validator.js';

export async function run(args) {
  const { flags } = parseArgs(args);

  if (flags.help) {
    console.log(`
  mcpr validate — Validate mcpr.json in current directory

  Usage:  mcpr validate
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

  if (result.valid) {
    console.log(`  ✓ ${card.name}@${card.version} is valid.`);
  } else {
    console.error(`  ✗ Validation failed with ${result.errors.length} error(s):\n`);
    for (const e of result.errors) {
      console.error(`    • ${e}`);
    }
    process.exit(1);
  }
}
