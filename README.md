# shortener

URL shortener running on Cloudflare Workers + Workers KV, deployed from GitHub Actions.
Everything here fits inside free tiers; no custom domain is required — the Worker is
served from `https://shortener.<your-subdomain>.workers.dev`.

Day-to-day usage — adding links, reading click counts, rotating the token — is
covered in Korean in [docs/GUIDE.md](docs/GUIDE.md). This README covers setup.

## How it works

- `src/index.js` — the Worker. Looks up `link:<slug>` in KV and answers with a `302`.
- `links.json` — links managed in git. Synced into KV on every deploy.
- `POST /api/links` — links created at runtime, for anything you don't want to commit.

Both kinds live in the same KV namespace and behave identically when resolved.

## Setup (one time)

1. Create the KV namespace and paste the returned id into `wrangler.toml`:

   ```sh
   npm install
   npx wrangler kv namespace create LINKS
   ```

2. Set the admin token used by the `/api` routes:

   ```sh
   npx wrangler secret put ADMIN_TOKEN
   ```

3. Add two repository secrets under **Settings → Secrets and variables → Actions**:

   - `CLOUDFLARE_API_TOKEN` — an API token with the *Edit Cloudflare Workers* template
   - `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard sidebar

Pushing to `main` then runs the tests, deploys the Worker, and syncs `links.json`.

## Usage

Add a permanent link by editing `links.json` and opening a PR:

```json
{
  "gh": "https://github.com/dreamccm/shortener"
}
```

Create one on the fly:

```sh
curl -X POST https://shortener.<subdomain>.workers.dev/api/links \
  -H "authorization: Bearer $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"url": "https://example.com/some/long/path"}'
```

Omit `slug` to get a random 7-character one, or pass `"slug": "launch"` to pick it.
Inspect click counts with `GET /api/links/<slug>`, remove a link with
`DELETE /api/links/<slug>`. Both need the same bearer token.

## Local development

```sh
npm test          # unit tests, no Cloudflare account needed
npx wrangler dev  # local Worker against a local KV
```

## Free-tier limits worth knowing

| Resource | Free allowance | What it means here |
| --- | --- | --- |
| Worker requests | 100,000/day | 100k redirects/day |
| KV reads | 100,000/day | one read per redirect |
| KV writes | 1,000/day | **the real ceiling** — see below |
| KV storage | 1 GB | effectively unlimited for links |

Every redirect writes a click counter, so click counting — not redirecting — is what
hits the write limit first, at roughly 1,000 clicks/day. If you expect more traffic
than that, drop the `ctx.waitUntil(recordClick(...))` call in `src/index.js`; redirects
then cost zero writes and scale to the full 100k/day.

Click counts are read-modify-write, so simultaneous hits on one slug can lose an
increment. They are a traffic signal, not an exact tally.
