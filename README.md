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

The Base API URLs are:

- Deployed submission: `https://campus-equipment-booking-api.khs-project.workers.dev/api`
- Local development: `http://localhost:8787/api`

The migration creates the schema and seeds these equipment records:

- `eq-1`: Projector A, Building 1
- `eq-2`: Camera A, Media Lab

## Checks

```bash
npm run typecheck
```

With the API running in another terminal, run all required HTTP cases with:

```bash
npm run test:api
```

The test command creates a temporary booking, prints PASS/FAIL for each case,
and deletes its test booking when finished. Set `BASE_URL` first if the API is
running on a different address.

See [API_CONTRACT.md](API_CONTRACT.md) for routes, payloads, status codes, and
the schema/ERD.

Verified local test evidence is recorded in [TEST_RESULTS.md](TEST_RESULTS.md).
The exact lecturer-aligned commands are in [CURL_TESTS.md](CURL_TESTS.md), and
short ownership explanations are in [EXPLANATION_NOTES.md](EXPLANATION_NOTES.md).
The required improvement record is in
[QUALITY_GATE_REVIEW.md](QUALITY_GATE_REVIEW.md).

## Cloudflare deployment

The API is deployed to Cloudflare Workers and bound to the production D1
database `campus-equipment-booking-db`. After logging into Wrangler, future
schema migrations and deployments can be applied with:

```bash
npm run db:migrate:remote
npm run deploy
```

After deploying, verify the public API with:

```bash
BASE_URL="https://campus-equipment-booking-api.khs-project.workers.dev/api" npm run test:api
```
