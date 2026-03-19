import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { REGISTRY_FILE } from './constants.js';

function getRegistryDir() {
  return join(homedir(), '.mcpr');
}

function getRegistryPath() {
  return join(getRegistryDir(), REGISTRY_FILE);
}

export async function loadRegistry() {
  try {
    const data = await readFile(getRegistryPath(), 'utf-8');
    return JSON.parse(data);
  } catch {
    return { version: '0.1', packages: {} };
  }
}

export async function saveRegistry(registry) {
  const dir = getRegistryDir();
  await mkdir(dir, { recursive: true });
  await writeFile(getRegistryPath(), JSON.stringify(registry, null, 2) + '\n');
}

export async function addPackage(card) {
  const registry = await loadRegistry();
  const name = card.name;

  if (!registry.packages[name]) {
    registry.packages[name] = { versions: {}, stats: { downloads: 0, rating: 0, ratingCount: 0 } };
  }

  registry.packages[name].versions[card.version] = {
    card,
    publishedAt: new Date().toISOString(),
  };
  registry.packages[name].latest = card.version;

  await saveRegistry(registry);
  return registry.packages[name];
}

export async function getPackage(name) {
  const registry = await loadRegistry();
  return registry.packages[name] || null;
}

export async function searchPackages({ query, tags, category }) {
  const registry = await loadRegistry();
  const results = [];

  for (const [name, pkg] of Object.entries(registry.packages)) {
    const card = pkg.versions[pkg.latest]?.card;
    if (!card) continue;

    let match = false;

    if (query) {
      const q = query.toLowerCase();
      match =
        card.name.toLowerCase().includes(q) ||
        card.title.toLowerCase().includes(q) ||
        card.description.toLowerCase().includes(q) ||
        (card.tags || []).some((t) => t.toLowerCase().includes(q));
    }

    if (tags && tags.length > 0) {
      const cardTags = (card.tags || []).map((t) => t.toLowerCase());
      match = tags.every((t) => cardTags.includes(t.toLowerCase()));
    }

    if (category) {
      match = card.category === category;
    }

    if (!query && !tags && !category) match = true;

    if (match) {
      results.push({ name, card, stats: pkg.stats });
    }
  }

  return results;
}

export async function getAllPackages() {
  const registry = await loadRegistry();
  return Object.entries(registry.packages).map(([name, pkg]) => ({
    name,
    card: pkg.versions[pkg.latest]?.card,
    stats: pkg.stats,
    versionCount: Object.keys(pkg.versions).length,
  }));
}
