# Explanation Notes

## Data model

`equipment` is the parent table and `bookings` is the child table. One item of
equipment can have many bookings, but each booking has one `equipment_id`
foreign key. The foreign key prevents a booking from referring to equipment
that does not exist.

Times are stored as normalized UTC ISO strings. This keeps API responses
consistent and makes chronological SQL comparisons reliable for this format.

## Status codes

- `200` means a read or update succeeded.
- `201` means a new booking was created.
- `204` means deletion succeeded and there is intentionally no response body.
- `400` means the submitted JSON or field values are invalid.
- `404` means the booking or route being requested does not exist.
- `409` means the request is valid by itself but conflicts with an existing
  booking.

## Overlap rule

Two ranges overlap when:

```text
newStart < existingEnd AND newEnd > existingStart
```

The update query excludes the booking being updated with `id <> ?`; otherwise,
every booking would conflict with its own old record. An end time equal to the
next start time is allowed because the comparisons are strict.

## Validation and SQL safety

Validation happens before any write. It checks the JSON object, required text,
ISO date-time format, `startAt < endAt`, existing equipment, and conflicts.

Every request value is represented by a `?` placeholder and supplied through
D1 `.bind(...)`. The database receives the value as data, so text containing
SQL syntax cannot change the SQL statement structure.

## Required versus optional choices

The API, D1 data model, validation, parameter binding, error JSON, and cURL
tests are required. A frontend and CORS are optional, so neither was added.
`PATCH` was implemented as a partial update because that matches the method's
normal meaning; the complete merged booking is validated before saving.

## Limitations and assumptions

- The initial brief allowed local testing, but the lecturer later requested a
  Cloudflare submission. The API was therefore deployed to Workers and the
  configuration now contains the real remote D1 database ID.
- The local and deployed environments use separate D1 data. Migrations must be
  applied with `--local` for local development and `--remote` for production.
- Conflict checking is performed by the API before each write. The lab API is
  designed for the required command-line workflow, not high-concurrency
  production scheduling.
