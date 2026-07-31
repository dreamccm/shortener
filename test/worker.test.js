import assert from 'node:assert/strict';
import { test } from 'node:test';

import worker from '../src/index.js';

const ADMIN_TOKEN = 'test-token';

function harness(seed = {}) {
  const store = new Map(Object.entries(seed));
  const pending = [];
  const env = {
    ADMIN_TOKEN,
    LINKS: {
      async get(key) {
        return store.has(key) ? store.get(key) : null;
      },
      async put(key, value) {
        store.set(key, value);
      },
      async delete(key) {
        store.delete(key);
      },
    },
  };
  const ctx = { waitUntil: (p) => pending.push(p) };

  return {
    store,
    async call(path, init = {}) {
      const response = await worker.fetch(new Request(`https://s.example${path}`, init), env, ctx);
      await Promise.all(pending.splice(0));
      return response;
    },
  };
}

const auth = (extra = {}) => ({ authorization: `Bearer ${ADMIN_TOKEN}`, ...extra });
const link = (url) => JSON.stringify({ url, createdAt: '2026-01-01T00:00:00.000Z' });

test('a known slug redirects and counts the click', async () => {
  const h = harness({ 'link:gh': link('https://example.com/target') });

  const response = await h.call('/gh');

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://example.com/target');
  assert.equal(h.store.get('clicks:gh'), '1');

  await h.call('/gh');
  assert.equal(h.store.get('clicks:gh'), '2');
});

test('unknown, nested, and reserved paths 404', async () => {
  const h = harness({ 'link:gh': link('https://example.com/target') });

  for (const path of ['/nope', '/gh/extra', '/favicon.ico']) {
    assert.equal((await h.call(path)).status, 404, `expected 404 for ${path}`);
  }
});

test('the root path serves a banner instead of redirecting', async () => {
  assert.equal((await harness().call('/')).status, 200);
});

test('api routes reject a missing or wrong token', async () => {
  const h = harness();

  assert.equal((await h.call('/api/links', { method: 'POST' })).status, 401);
  assert.equal(
    (await h.call('/api/links', { method: 'POST', headers: { authorization: 'Bearer wrong' } })).status,
    401,
  );
});

test('creating a link returns a working slug', async () => {
  const h = harness();

  const response = await h.call('/api/links', {
    method: 'POST',
    headers: auth({ 'content-type': 'application/json' }),
    body: JSON.stringify({ url: 'https://example.com/a' }),
  });
  assert.equal(response.status, 201);

  const { slug, shortUrl } = await response.json();
  assert.equal(shortUrl, `https://s.example/${slug}`);
  assert.equal((await h.call(`/${slug}`)).headers.get('location'), 'https://example.com/a');
});

test('a custom slug cannot silently overwrite an existing one', async () => {
  const h = harness({ 'link:gh': link('https://example.com/original') });

  const response = await h.call('/api/links', {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify({ url: 'https://example.com/new', slug: 'gh' }),
  });

  assert.equal(response.status, 409);
  assert.equal((await h.call('/gh')).headers.get('location'), 'https://example.com/original');
});

test('non-http targets are rejected', async () => {
  const h = harness();

  const response = await h.call('/api/links', {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify({ url: 'javascript:alert(1)' }),
  });

  assert.equal(response.status, 400);
});

test('stats report the click count', async () => {
  const h = harness({ 'link:gh': link('https://example.com/target') });
  await h.call('/gh');

  const body = await (await h.call('/api/links/gh', { headers: auth() })).json();

  assert.equal(body.clicks, 1);
  assert.equal(body.url, 'https://example.com/target');
});

test('deleting a link removes it and its counter', async () => {
  const h = harness({ 'link:gh': link('https://example.com/target'), 'clicks:gh': '5' });

  assert.equal((await h.call('/api/links/gh', { method: 'DELETE', headers: auth() })).status, 204);
  assert.equal(h.store.has('link:gh'), false);
  assert.equal(h.store.has('clicks:gh'), false);
  assert.equal((await h.call('/gh')).status, 404);
});
