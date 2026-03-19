import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { SERVICE_CARD_FILE } from './constants.js';

export async function loadServiceCard(dir) {
  const filePath = join(dir || cwd(), SERVICE_CARD_FILE);
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

export function parseArgs(args) {
  const result = { _: [], flags: {} };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        if (result.flags[key]) {
          if (!Array.isArray(result.flags[key])) result.flags[key] = [result.flags[key]];
          result.flags[key].push(next);
        } else {
          result.flags[key] = next;
        }
        i++;
      } else {
        result.flags[key] = true;
      }
    } else {
      result._.push(arg);
    }
  }
  return result;
}

export function formatRating(rating) {
  return rating ? `★ ${rating.toFixed(1)}` : '★ —';
}

export function formatDownloads(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function padEnd(str, len) {
  if (str.length >= len) return str;
  return str + ' '.repeat(len - str.length);
}
