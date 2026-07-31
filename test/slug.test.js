import assert from 'node:assert/strict';
import { test } from 'node:test';

import { generateSlug, isValidSlug, normalizeTarget } from '../src/index.js';

test('generated slugs are valid and unique enough', () => {
  const seen = new Set();
  for (let i = 0; i < 1000; i++) {
    const slug = generateSlug();
    assert.equal(slug.length, 7);
    assert.ok(isValidSlug(slug), `expected ${slug} to be valid`);
    seen.add(slug);
  }
  assert.equal(seen.size, 1000);
});

test('reserved and malformed slugs are rejected', () => {
  for (const slug of ['api', 'favicon.ico', 'robots.txt', '_health', '', 'a/b', 'héllo', 'x'.repeat(65)]) {
    assert.equal(isValidSlug(slug), false, `expected ${JSON.stringify(slug)} to be rejected`);
  }
  for (const slug of ['gh', 'My-Link_1', 'x'.repeat(64)]) {
    assert.equal(isValidSlug(slug), true, `expected ${JSON.stringify(slug)} to be accepted`);
  }
});

test('only http(s) targets are accepted', () => {
  assert.equal(normalizeTarget('https://example.com/a?b=1'), 'https://example.com/a?b=1');
  assert.equal(normalizeTarget('http://example.com'), 'http://example.com/');
  for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', 'example.com', '']) {
    assert.equal(normalizeTarget(bad), null, `expected ${JSON.stringify(bad)} to be rejected`);
  }
});

test('links.json entries are valid', async () => {
  const links = JSON.parse(
    await import('node:fs/promises').then((fs) => fs.readFile(new URL('../links.json', import.meta.url), 'utf8')),
  );
  for (const [slug, url] of Object.entries(links)) {
    assert.ok(isValidSlug(slug), `invalid slug: ${slug}`);
    assert.ok(normalizeTarget(url), `invalid url for ${slug}: ${url}`);
  }
});
