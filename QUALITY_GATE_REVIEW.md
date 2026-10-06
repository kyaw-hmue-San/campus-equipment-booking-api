# Quality Gate Review

**Review date:** 6 October 2026  
**Pre-Quality-Gate snapshot:** Git commit `7a9b958` (`First Working API`)  
**Review sources:** Lecturer's exam brief, rubric, `quality_gate.md`, and
`curl_test_guide.md`

## Lecturer checklist

### 1. Purpose

- [x] My API solves the stated equipment-booking problem.
- [x] My routes, request bodies, responses, and status codes match the common API contract.
- [x] I have met the required deliverables and submission instructions.
- [x] I have not added unrelated features that reduce the time available for required work.

### 2. Reliability

- [x] My equipment data and booking data are saved and retrieved consistently.
- [x] Creating or updating a booking cannot create an overlap for the same equipment.
- [x] `equipmentId` is checked against existing equipment.
- [x] The API handles invalid requests without crashing.

### 3. Course Context

- [x] My work follows the instructor's task, API contract, and permitted technology stack.
- [x] I understand which parts I implemented and which parts used AI assistance.
- [x] I used only permitted sources and recorded significant AI assistance in `AI_LOG.md`.
- [x] I can identify the important files, routes, schema, and run commands.

### 4. Reasoning

- [x] I can explain why I selected `400`, `404`, and `409`.
- [x] I can explain the overlap check for create and update.
- [x] I can distinguish required behaviour from optional choices.
- [x] I can explain the implementation's limitations and assumptions.

### 5. Execution Value

- [x] The API runs by following `README.md`.
- [x] The equipment endpoint and all required booking CRUD endpoints work.
- [x] I tested the API with cURL and recorded the results.
- [x] I focused effort on the required API, validation, testing, and documentation.

### 6. Accuracy

- [x] Booking fields, dates, IDs, and responses contain the correct values.
- [x] I validate that `startAt` is before `endAt`.
- [x] Every error response uses the required `{ "error": "..." }` JSON format.
- [x] I use SQL/D1 parameter binding and do not concatenate request data into SQL.

### 7. Delivery Quality

- [x] My source code is runnable and `README.md` includes clear run instructions.
- [x] My API contract and brief schema/ERD are included.
- [x] I omitted CORS because I did not choose a browser-based client.
- [x] I included evidence for at least five successful and error test cases.
- [x] My files are clearly named and complete enough for marking.

### 8. You Own It

- [x] I can explain every important route, validation rule, database query, and test result.
- [x] My `AI_LOG.md` truthfully records important prompts, what I used, and how I checked it.
- [x] I can explain what I changed after the Quality Gate and why.
- [x] I am ready to answer follow-up questions about my design and implementation.

## Improvements

| Quality Gate area | Finding | Action taken | Evidence |
| --- | --- | --- | --- |
| Accuracy | The first version used `Date.parse` alone. It accepted a date such as `2026-10-20`, even though the API contract requires a date-time. | Added ISO date-time shape and calendar/time component validation before parsing and normalization. | `npm run typecheck` passed. A POST using date-only `startAt` and `endAt` returned `400` with the required JSON error shape. A valid timestamp from the lecturer's guide still returned `201`. |
| Execution Value / Delivery Quality | `TEST_RESULTS.md` recorded the outcomes, but the submission folder did not contain the complete commands needed to reproduce the lecturer's required flow. | Added `CURL_TESTS.md` with list, create, get, update, invalid range, conflict, missing resource, delete, and regression commands. | Reran the lecturer's sequence. Observed the expected `200`, `200`, `201`, `200`, `200`, `400`, `409`, `404`, and `204` statuses. |
| Reasoning / You Own It | My first AI log recorded what was built and tested but did not give concise explanations for the important design decisions I may be asked about. | I added `EXPLANATION_NOTES.md` and expanded `AI_LOG.md` with the accepted Quality Gate changes and verification. | The notes now explain the relationship, status choices, overlap formula, update self-exclusion, parameter binding, required versus optional work, and limitations. |

## Eight-area check

| Area | PASS/FIX | Evidence |
| --- | --- | --- |
| Purpose | PASS | Only the required equipment listing and booking CRUD API were implemented; no unrelated frontend was added. |
| Reliability | PASS | Equipment existence, time order, and overlap checks work for create and update; the lecturer's regression sequence passed. |
| Course Context | PASS | TypeScript, Hono, Cloudflare Workers, D1, parameter binding, and cURL match the permitted course stack. `AI_LOG.md` distinguishes my pre-exam preparation notes from the lecturer-provided sources. |
| Reasoning | PASS | `EXPLANATION_NOTES.md` explains statuses, overlap logic, assumptions, and optional choices. |
| Execution Value | PASS | README setup works; migration, type check, required endpoints, and cURL flow were verified. |
| Accuracy | PASS | Fields and normalized times matched the contract; all tested errors used `{ "error": "..." }`; bound values are used throughout. |
| Delivery Quality | PASS | README, API contract, ERD, AI log, cURL commands, test results, and this review are present. CORS is correctly omitted because no browser client was built. |
| You Own It | PASS | I recorded the AI assistance and my verification, and I prepared concise notes covering each required explanation for my final personal review. |

## Regression evidence

The post-change local regression used a second Wrangler instance on port `8788`
because my default server was already running on port `8787`. After the
lecturer requested Cloudflare submission, the same suite was also run against
the deployed Base URL.

| Test | Expected | Actual |
| --- | --- | --- |
| List equipment | `200` | `200` |
| List bookings | `200` | `200` |
| Create booking | `201` | `201` |
| Get booking | `200` | `200` |
| Update booking | `200` | `200` |
| Invalid time order | `400` | `400` |
| Overlapping booking | `409` | `409` |
| Missing booking | `404` | `404` |
| Delete booking | `204` | `204` |
| Date-only values | `400` | `400` |

The later automated cURL runner also reported **11 passed and 0 failed** and
removed the temporary booking it created.

The final deployed regression at
`https://campus-equipment-booking-api.khs-project.workers.dev/api` also
reported **11 passed and 0 failed** using the remote D1 database.

## Submission decision

**READY** after I read the explanation notes, review the changed files, and
make the final post-Quality-Gate commit. I will repeat this checklist during
the final five minutes as required by the lecturer.
