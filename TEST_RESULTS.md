# Test Results

**Date tested:** 6 October 2026  
**Submitted Base API URL:**
`https://campus-equipment-booking-api.khs-project.workers.dev/api`

**Initial local Base API URL:** `http://localhost:8787/api`

**Environment:** Cloudflare Workers/D1 and local Wrangler 4.147.0

**Screenshot evidence:**
[Automated API test summary](evidence_image/test-evidence-api-summary.png)

The migration completed successfully before these tests. The API was started
with `npm run dev`, and requests were sent with `curl`.

| # | Endpoint | Case | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| 1 | `GET /equipment` | List seeded equipment | `200`; at least two records | `200`; returned `eq-1` and `eq-2` | PASS |
| 2 | `POST /bookings` | Missing required fields | `400` JSON error | `400`; `borrowerName is required...` | PASS |
| 3 | `POST /bookings` | Unknown `equipmentId` | `400` JSON error | `400`; `Equipment not found` | PASS |
| 4 | `GET /bookings/not-found` | Unknown booking | `404` JSON error | `404`; `Booking not found` | PASS |
| 5 | `POST /bookings` | Valid booking | `201` with booking | `201`; booking UUID returned | PASS |
| 6 | `GET /bookings/:id` | Read created booking | `200` with booking | `200`; fields matched | PASS |
| 7 | `POST /bookings` | Overlap on same equipment | `409` JSON error | `409`; conflict message returned | PASS |
| 8 | `POST /bookings` | Starts after first booking ends | `201` | `201`; adjacent/non-overlapping booking created | PASS |
| 9 | `PATCH /bookings/:id` | Update would overlap | `409` JSON error | `409`; conflict message returned | PASS |
| 10 | `PATCH /bookings/:id` | Valid partial update | `200` with updated booking | `200`; purpose updated | PASS |
| 11 | `DELETE /bookings/:id` | Delete existing booking | `204` with no body | `204`; empty body | PASS |
| 12 | `GET /bookings/:id` | Read deleted booking | `404` JSON error | `404`; `Booking not found` | PASS |
| 13 | `POST /bookings` | Start time after end time | `400` JSON error | `400`; `startAt must be before endAt` | PASS |
| 14 | `GET /bookings` | List after update/delete | `200` with current records | `200`; only updated first booking remained | PASS |

## Representative evidence

Valid create returned:

```text
HTTP/1.1 201 Created
```

```json
{
  "id": "02dbc175-f89e-4300-a34b-6851a241b5da",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

Overlapping create and update both returned:

```text
HTTP/1.1 409 Conflict
```

```json
{ "error": "Booking conflicts with an existing booking" }
```

Successful delete returned:

```text
HTTP/1.1 204 No Content
```

## Additional verification

- `npm run typecheck` completed with no TypeScript errors.
- The D1 migration executed all six migration commands successfully.
- Wrangler's request log confirmed every status recorded in the table.
- SQL inspection confirms that every user-controlled value is passed through
  D1 `.bind(...)`; request values are not concatenated into SQL.

## Post-Quality-Gate regression

After receiving the lecturer's cURL guide and Quality Gate, the complete guide
was rerun. Every expected status matched. An additional date-only input test
returned `400`, confirming the tightened date-time validation. Full review
details are recorded in `QUALITY_GATE_REVIEW.md`.

The repeatable `npm run test:api` command was then run against the default Base
URL. It reported **11 passed and 0 failed**, including cleanup verification
that its temporary booking returned `404` after deletion.

## Deployed Cloudflare verification

The remote D1 migration completed successfully and the Worker deployed as
Cloudflare version `c5a40c68-94d4-4bc3-b6db-2c34ff3f0b3c`.

The first rapid public test run passed 9 cases, while two requests received
Cloudflare platform error codes `1042` and `1104`. An isolated retry returned
the correct API `400` response, showing that the earlier response was
transient. The complete public suite was then rerun and reported **11 passed,
0 failed**. Its temporary remote booking was deleted successfully.
