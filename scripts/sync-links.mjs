#!/usr/bin/env node
/**
 * Push links.json into the LINKS KV namespace via `wrangler kv bulk put`.
 *
 * Links declared in links.json are managed by git; links created through the
 * API are not touched. Deleting an entry from links.json does not remove it
 * from KV — use `DELETE /api/links/:slug` for that.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { isValidSlug, normalizeTarget } from '../src/index.js';

function wranglerBin() {
  const require = createRequire(import.meta.url);
  let manifestPath;
  try {
    manifestPath = require.resolve('wrangler/package.json');
  } catch {
    throw new Error('wrangler is not installed — run `npm install` first.');
  }
  const { bin } = JSON.parse(readFileSync(manifestPath, 'utf8'));
  return resolve(dirname(manifestPath), typeof bin === 'string' ? bin : bin.wrangler);
}

const links = JSON.parse(await readFile(new URL('../links.json', import.meta.url), 'utf8'));

const entries = [];
for (const [slug, url] of Object.entries(links)) {
  if (!isValidSlug(slug)) throw new Error(`links.json: invalid slug ${JSON.stringify(slug)}`);
  const target = normalizeTarget(url);
  if (!target) throw new Error(`links.json: invalid url for ${slug}: ${JSON.stringify(url)}`);
  entries.push({
    key: `link:${slug}`,
    value: JSON.stringify({ url: target, createdAt: new Date().toISOString(), source: 'links.json' }),
  });
}

if (entries.length === 0) {
  console.log('links.json is empty, nothing to sync.');
  process.exit(0);
}

const file = join(mkdtempSync(join(tmpdir(), 'shortener-')), 'bulk.json');
writeFileSync(file, JSON.stringify(entries));

// Run wrangler's entrypoint under this Node rather than going through npx: the
// npx launcher is npx.cmd on Windows, which Node refuses to spawn without a
// shell (EINVAL), and PATH lookup of extensionless "npx" fails there too.
execFileSync(process.execPath, [wranglerBin(), 'kv', 'bulk', 'put', file, '--binding', 'LINKS', '--remote'], {
  stdio: 'inherit',
});

console.log(`Synced ${entries.length} link(s) from links.json.`);
