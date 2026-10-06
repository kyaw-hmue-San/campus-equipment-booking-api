# AI Log

## Source provenance

`LAB_COPILOT_CONTEXT.md` and the related templates were preparation materials I
created before the exam with AI assistance. They are not lecturer-provided
instructions and do not contain the exam solution. I used them only as a
general workflow reminder for reading requirements, keeping the implementation
simple, validating input, binding SQL parameters, testing, and documenting AI
use.

The lecturer-provided sources are `exam_brief_en.md`, `rubric_en.md`,
`curl_test_guide.md`, and `quality_gate.md`. I treated those files as the source
of truth. Where they were more specific than my preparation materials, the
lecturer's requirements took priority.

## Entry 1 — Requirements and initial implementation

**Prompt:** Read the lab scenario and provided project first. Follow
`LAB_COPILOT_CONTEXT.md`. Do not invent requirements. First summarize the
required entities, API endpoints, validation rules, database relationships,
and deliverables. Then help me implement and test them. Keep the solution
simple enough that I can explain every part.

**AI assistance used:** Extracted the lecturer's required contract and created
a minimal TypeScript/Hono/Cloudflare Workers/D1 implementation in a separate
deployable folder. Added schema, two equipment seed records, booking CRUD,
request validation, overlap checks, JSON errors, and parameter-bound SQL.

**My verification:** I installed the minimal dependencies, generated Worker
types, applied the local D1 migration, and ran `npm run typecheck` successfully.
I started the API with Wrangler and verified 14 HTTP cases covering equipment,
create/read/list/update/delete, validation, missing resources, and conflicts.
The observed statuses and representative responses are recorded in
`TEST_RESULTS.md`. The Quality Gate review remains pending until the lecturer
provides the required checklist.

## Entry 2 — Lecturer Quality Gate review

**Prompt/context:** Read the lecturer-provided `curl_test_guide.md` and
`quality_gate.md`, compare them with the current API, and perform the required
Quality Gate without inventing features.

**AI assistance used:** Compared the committed first version with the eight
Quality Gate areas. Identified that date parsing accepted incomplete date-only
values, the submission lacked a complete reproducible cURL sequence, and the
ownership documentation did not yet explain the key implementation decisions.

**Changes accepted:** Tightened date-time validation while keeping valid ISO
timestamps compatible with the contract; added `CURL_TESTS.md`; and added
`EXPLANATION_NOTES.md` covering the schema, statuses, overlap formula,
parameter binding, optional features, and limitations.

**Verification:** Ran `npm run typecheck` successfully. Reran the lecturer's
complete cURL sequence and observed the expected statuses for list, create,
read, update, invalid time order, conflict, missing resource, and delete. Also
verified that a date-only value now returns `400` while a valid ISO date-time
still creates a booking. The results are recorded in
`QUALITY_GATE_REVIEW.md`.

## Entry 3 — Repeatable API test command

**Prompt/context:** I wanted the regression tests to be repeatable and
consistent, without introducing errors when manually copying commands or IDs.
I asked whether a Postman collection or an automated cURL workflow would be the
better testing approach.

**AI assistance used:** Added a small Bash script that uses cURL to run the
required success and error cases, capture the generated booking ID, print
PASS/FAIL results, and remove its own temporary booking.

**Decision and verification:** I kept cURL instead of adding Postman or a
browser client because the lecturer accepts cURL and does not assess frontend
work. I ran `npm run test:api` against the local API and all 11 checks passed
with zero failures. The script uses the same public API contract, deleted its
own temporary booking, and adds no production endpoint or CORS configuration.

## Entry 4 — Cloudflare deployment

**Prompt/context:** The lecturer later confirmed that the API must be submitted
on Cloudflare, so I asked for the existing tested project to be deployed.

**AI assistance used:** Verified Wrangler authentication, created the remote
D1 database in the APAC region, replaced the local placeholder with the real
database ID, applied the migration remotely, deployed the Worker, and tested
the public URL.

**My verification:** The remote migration succeeded and the deployment returned
the public Workers URL. The first rapid test run passed 9 cases but two requests
received Cloudflare platform error codes. I did not treat that run as a pass.
An isolated retry returned the expected API response, and a second complete
public run passed all 11 cases with zero failures and cleaned up its temporary
booking. I recorded both the transient failure and successful regression in
`TEST_RESULTS.md`.

## Entry 5 — Local D1 state after deployment configuration

**Finding:** After replacing the placeholder database ID with the real remote
D1 ID, the next local Wrangler run used a new local D1 state namespace. The
first local requests returned `500` because that local state did not yet have
the `equipment` and `bookings` tables.

**Action and verification:** I reran `npm run db:migrate`, which applied the
existing migration and seed data to the new local state. I then reran
`npm run test:api`; all 11 local cases passed with zero failures. The remote D1
database and deployed Worker were not changed by this local migration.
