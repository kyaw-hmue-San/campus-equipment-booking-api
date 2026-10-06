# Campus Equipment Booking API

A TypeScript REST API built with Hono, Cloudflare Workers, and D1.

## Requirements

- Node.js and npm

## Local setup

```bash
npm install
npm run cf-typegen
npm run db:migrate
npm run dev
```

The local Base API URL is `http://localhost:8787/api`.

The migration creates the schema and seeds these equipment records:

- `eq-1`: Projector A, Building 1
- `eq-2`: Camera A, Media Lab

## Checks

```bash
npm run typecheck
```

See [API_CONTRACT.md](API_CONTRACT.md) for routes, payloads, status codes, and
the schema/ERD.

Verified local test evidence is recorded in [TEST_RESULTS.md](TEST_RESULTS.md).

## Deployment note

The D1 `database_id` in `wrangler.jsonc` is a local placeholder. Before a real
deployment, create or select the instructor-approved D1 database and replace
that value with its actual database ID.
