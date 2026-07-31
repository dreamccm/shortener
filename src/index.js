/**
 * URL shortener on Cloudflare Workers + KV.
 *
 * Routes:
 *   GET    /                 -> plain-text banner
 *   GET    /:slug            -> 302 to the target URL
 *   POST   /api/links        -> create a link (auth)
 *   GET    /api/links/:slug  -> inspect a link and its click count (auth)
 *   DELETE /api/links/:slug  -> delete a link (auth)
 */

const RESERVED = new Set(['api', 'favicon.ico', 'robots.txt', '_health']);
const SLUG_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateSlug(length = 7) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = '';
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length];
  return out;
}

export function isValidSlug(slug) {
  return SLUG_PATTERN.test(slug) && !RESERVED.has(slug);
}

export function normalizeTarget(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  return url.toString();
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body, null, 2) + '\n', {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const text = (body, status = 200) =>
  new Response(body, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } });

function authorized(request, env) {
  const token = env.ADMIN_TOKEN;
  if (!token) return false;
  const header = request.headers.get('authorization') || '';
  const presented = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (presented.length !== token.length) return false;
  // Constant-time compare so a wrong token leaks nothing through response timing.
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= presented.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

async function readLink(env, slug) {
  const raw = await env.LINKS.get(`link:${slug}`);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Clicks are counted read-modify-write, so concurrent hits on the same slug can
 * lose an increment. Counts are best-effort traffic signal, not billing data.
 */
async function recordClick(env, slug) {
  const key = `clicks:${slug}`;
  const current = Number(await env.LINKS.get(key)) || 0;
  await env.LINKS.put(key, String(current + 1));
}

async function handleApi(request, env, segments) {
  if (!authorized(request, env)) {
    return json({ error: 'unauthorized' }, 401);
  }
  if (segments[1] !== 'links') return json({ error: 'not found' }, 404);

  const slug = segments[2];

  if (request.method === 'POST' && !slug) {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'body must be JSON' }, 400);
    }

    const target = normalizeTarget(body.url);
    if (!target) return json({ error: 'url must be a valid http(s) URL' }, 400);

    let key = body.slug;
    if (key) {
      if (!isValidSlug(key)) return json({ error: 'slug is reserved or malformed' }, 400);
      if (await readLink(env, key)) return json({ error: 'slug already exists' }, 409);
    } else {
      // Retry on the rare collision rather than silently overwriting a link.
      for (let attempt = 0; attempt < 5; attempt++) {
        key = generateSlug();
        if (!(await readLink(env, key))) break;
        key = null;
      }
      if (!key) return json({ error: 'could not allocate a slug' }, 503);
    }

    const record = { url: target, createdAt: new Date().toISOString() };
    await env.LINKS.put(`link:${key}`, JSON.stringify(record));
    return json({ slug: key, shortUrl: new URL(`/${key}`, request.url).toString(), ...record }, 201);
  }

  if (request.method === 'GET' && slug) {
    const record = await readLink(env, slug);
    if (!record) return json({ error: 'not found' }, 404);
    const clicks = Number(await env.LINKS.get(`clicks:${slug}`)) || 0;
    return json({ slug, clicks, ...record });
  }

  if (request.method === 'DELETE' && slug) {
    if (!(await readLink(env, slug))) return json({ error: 'not found' }, 404);
    await env.LINKS.delete(`link:${slug}`);
    await env.LINKS.delete(`clicks:${slug}`);
    return new Response(null, { status: 204 });
  }

  return json({ error: 'method not allowed' }, 405);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);

    if (segments[0] === 'api') return handleApi(request, env, segments);

    if (segments.length === 0) {
      return text('URL shortener. See https://github.com/dreamccm/shortener\n');
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return text('method not allowed\n', 405);
    }

    const slug = segments[0];
    if (segments.length > 1 || !isValidSlug(slug)) return text('not found\n', 404);

    const record = await readLink(env, slug);
    if (!record) return text('not found\n', 404);

    ctx.waitUntil(recordClick(env, slug));

    return new Response(null, {
      status: 302,
      headers: { location: record.url, 'cache-control': 'no-store' },
    });
  },
};
