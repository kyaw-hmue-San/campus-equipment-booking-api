# Quality Gate Review

**Review date:** 6 October 2026  
**Pre-Quality-Gate snapshot:** Git commit `7a9b958` (`First Working API`)  
**Review sources:** Lecturer's exam brief, rubric, `quality_gate.md`, and
`curl_test_guide.md`

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

The post-change regression used a second local Wrangler instance on port `8788`
because my default server was already running on port `8787`. This
does not change the submitted Base API URL of `http://localhost:8787/api`.

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

## Submission decision

**READY** after I read the explanation notes, review the changed files, and
make the final post-Quality-Gate commit. I will repeat this checklist during
the final five minutes as required by the lecturer.
