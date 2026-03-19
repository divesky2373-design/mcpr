import { CATEGORIES, TRANSPORTS, PROTOCOL_VERSION } from './constants.js';

export function validate(card) {
  const errors = [];

  // Required top-level fields
  if (!card.mcpr) errors.push('Missing "mcpr" protocol version');
  if (!card.name) errors.push('Missing "name"');
  if (!card.version) errors.push('Missing "version"');
  if (!card.title) errors.push('Missing "title"');
  if (!card.description) errors.push('Missing "description"');

  // Name format: lowercase, alphanumeric, hyphens, optional @scope/
  if (card.name && !/^(@[a-z0-9-]+\/)?[a-z0-9-]+$/.test(card.name)) {
    errors.push('Invalid "name" — must be lowercase alphanumeric with hyphens, optionally @scoped');
  }

  // Version: basic semver
  if (card.version && !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(card.version)) {
    errors.push('Invalid "version" — must be semver (e.g. 1.0.0)');
  }

  // Author
  if (!card.author || !card.author.name) {
    errors.push('Missing "author.name"');
  }

  // Capabilities
  if (!card.capabilities) {
    errors.push('Missing "capabilities"');
  } else {
    if (!Array.isArray(card.capabilities.tools)) {
      errors.push('Missing or invalid "capabilities.tools" — must be an array');
    } else {
      card.capabilities.tools.forEach((tool, i) => {
        if (!tool.name) errors.push(`Tool[${i}]: missing "name"`);
        if (!tool.description) errors.push(`Tool[${i}]: missing "description"`);
      });
    }
  }

  // Category
  if (card.category && !CATEGORIES.includes(card.category)) {
    errors.push(`Invalid "category" — must be one of: ${CATEGORIES.join(', ')}`);
  }

  // Runtime
  if (!card.runtime) {
    errors.push('Missing "runtime"');
  } else {
    if (!card.runtime.transport) {
      errors.push('Missing "runtime.transport"');
    } else if (!TRANSPORTS.includes(card.runtime.transport)) {
      errors.push(`Invalid "runtime.transport" — must be one of: ${TRANSPORTS.join(', ')}`);
    }
    if (!card.runtime.install) errors.push('Missing "runtime.install"');
  }

  // Source
  if (!card.source) {
    errors.push('Missing "source"');
  } else {
    if (!card.source.repo) errors.push('Missing "source.repo"');
  }

  return { valid: errors.length === 0, errors };
}
