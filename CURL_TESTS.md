# Reproducible cURL Test Sequence

Start the API with `npm run dev`, then run these commands in a second terminal.

```bash
BASE_URL="http://localhost:8787/api"
```

To test the deployed Worker instead, use:

```bash
BASE_URL="https://campus-equipment-booking-api.khs-project.workers.dev/api"
```

## Required success cases

List equipment — expect `200`:

```bash
curl -i "$BASE_URL/equipment"
```

List bookings — expect `200`:

```bash
curl -i "$BASE_URL/bookings"
```

Create a booking — expect `201`:

```bash
curl -i -X POST "$BASE_URL/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-10-20T09:00:00.000Z",
    "endAt": "2026-10-20T11:00:00.000Z",
    "purpose": "Class presentation"
  }'
```

Copy the returned ID:

```bash
BOOKING_ID="replace-with-the-booking-id"
```

Read it — expect `200`:

```bash
curl -i "$BASE_URL/bookings/$BOOKING_ID"
```

Update it — expect `200`:

```bash
curl -i -X PATCH "$BASE_URL/bookings/$BOOKING_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-10-20T12:00:00.000Z",
    "endAt": "2026-10-20T14:00:00.000Z",
    "purpose": "Updated class presentation"
  }'
```

## Required error cases

Invalid time range — expect `400`:

```bash
curl -i -X POST "$BASE_URL/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-10-21T11:00:00.000Z",
    "endAt": "2026-10-21T09:00:00.000Z",
    "purpose": "Invalid time range test"
  }'
```

Overlap with the updated booking — expect `409`:

```bash
curl -i -X POST "$BASE_URL/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "eq-1",
    "borrowerName": "Suda Dee",
    "startAt": "2026-10-20T12:30:00.000Z",
    "endAt": "2026-10-20T13:30:00.000Z",
    "purpose": "Conflict test"
  }'
```

Missing booking — expect `404`:

```bash
curl -i "$BASE_URL/bookings/not-found"
```

Delete the created booking — expect `204`:

```bash
curl -i -X DELETE "$BASE_URL/bookings/$BOOKING_ID"
```

## Quality Gate regression case

A date without a time is not a valid contract date-time — expect `400`:

```bash
curl -i -X POST "$BASE_URL/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "eq-2",
    "borrowerName": "Date Validation Test",
    "startAt": "2026-10-20",
    "endAt": "2026-10-21",
    "purpose": "Reject incomplete timestamps"
  }'
```
