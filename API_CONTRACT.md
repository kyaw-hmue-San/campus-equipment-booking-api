# API Contract

Base URL for local testing: `http://localhost:8787/api`

All request and response bodies use JSON. Every error has this shape:

```json
{ "error": "An understandable message" }
```

## Equipment

| Method | Route | Success | Purpose |
| --- | --- | --- | --- |
| GET | `/equipment` | `200` | List the seeded equipment records |

## Bookings

| Method | Route | Request | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/bookings` | None | `200` with an array | `500` unexpected failure |
| GET | `/bookings/:id` | None | `200` with one booking | `404` missing booking |
| POST | `/bookings` | Complete booking payload | `201` with created booking | `400` invalid data/equipment; `409` overlap |
| PATCH | `/bookings/:id` | One or more booking fields | `200` with updated booking | `400` invalid data/equipment; `404` missing booking; `409` overlap |
| DELETE | `/bookings/:id` | None | `204` with no body | `404` missing booking |

The booking fields are:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

`POST` requires every field. `PATCH` accepts one or more fields and validates the
complete result after merging the changes with the existing booking.

`startAt` and `endAt` must be ISO date-time strings with a timezone, such as the
UTC `Z` values shown above. They are normalized to UTC before storage.

Two bookings conflict when they use the same equipment and their time ranges
overlap. A booking ending exactly when another starts is allowed.

## Schema / ERD

```text
EQUIPMENT
- id TEXT (PK)
- name TEXT (NOT NULL)
- location TEXT (NOT NULL)

       1 -------- many

BOOKINGS
- id TEXT (PK)
- equipment_id TEXT (FK -> equipment.id, NOT NULL)
- borrower_name TEXT (NOT NULL)
- start_at TEXT (NOT NULL)
- end_at TEXT (NOT NULL)
- purpose TEXT (NOT NULL)
```
