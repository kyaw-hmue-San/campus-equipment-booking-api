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

## Local assessment environment

Public deployment is not required for this assessment. The D1 `database_id` in
`wrangler.jsonc` is an intentional placeholder used by the local Wrangler/D1
environment. If deployment is requested later, a real Cloudflare D1 database
must first be created and its database ID placed in the configuration.
