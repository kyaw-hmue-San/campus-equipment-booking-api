#!/usr/bin/env bash

set -u

BASE_URL="${BASE_URL:-http://localhost:8787/api}"
BODY_FILE="$(mktemp)"
CREATED_ID=""
PASS_COUNT=0
FAIL_COUNT=0

cleanup() {
  if [ -n "$CREATED_ID" ]; then
    curl -sS -X DELETE "$BASE_URL/bookings/$CREATED_ID" >/dev/null || true
  fi
  rm -f "$BODY_FILE"
}

trap cleanup EXIT

request() {
  local method="$1"
  local path="$2"
  local payload="${3:-}"

  if [ -n "$payload" ]; then
    STATUS="$(curl -sS -o "$BODY_FILE" -w "%{http_code}" \
      -X "$method" "$BASE_URL$path" \
      -H "Content-Type: application/json" \
      -d "$payload")"
  else
    STATUS="$(curl -sS -o "$BODY_FILE" -w "%{http_code}" \
      -X "$method" "$BASE_URL$path")"
  fi

  BODY="$(<"$BODY_FILE")"
}

check_status() {
  local name="$1"
  local expected="$2"

  if [ "$STATUS" = "$expected" ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
    printf 'PASS  %-32s expected=%s actual=%s\n' "$name" "$expected" "$STATUS"
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    printf 'FAIL  %-32s expected=%s actual=%s\n' "$name" "$expected" "$STATUS"
    printf '      response: %s\n' "$BODY"
  fi
}

START_AT="$(node -e 'console.log(new Date(Date.now() + 31536000000).toISOString())')"
END_AT="$(node -e 'console.log(new Date(Date.now() + 31539600000).toISOString())')"
UPDATED_START_AT="$(node -e 'console.log(new Date(Date.now() + 31543200000).toISOString())')"
UPDATED_END_AT="$(node -e 'console.log(new Date(Date.now() + 31546800000).toISOString())')"
OVERLAP_START_AT="$(node -e 'console.log(new Date(Date.now() + 31544100000).toISOString())')"
OVERLAP_END_AT="$(node -e 'console.log(new Date(Date.now() + 31545900000).toISOString())')"

request GET "/equipment"
check_status "List equipment" 200

request GET "/bookings"
check_status "List bookings" 200

CREATE_PAYLOAD="$(printf '{"equipmentId":"eq-2","borrowerName":"Automated Test","startAt":"%s","endAt":"%s","purpose":"Required CRUD test"}' "$START_AT" "$END_AT")"
request POST "/bookings" "$CREATE_PAYLOAD"
check_status "Create booking" 201

if [ "$STATUS" = "201" ]; then
  CREATED_ID="$(node -e 'const value = JSON.parse(process.argv[1]); process.stdout.write(value.id)' "$BODY")"
else
  printf '\nCannot continue CRUD tests because create did not return 201.\n'
  exit 1
fi

request GET "/bookings/$CREATED_ID"
check_status "Get one booking" 200

UPDATE_PAYLOAD="$(printf '{"equipmentId":"eq-2","borrowerName":"Automated Test","startAt":"%s","endAt":"%s","purpose":"Updated CRUD test"}' "$UPDATED_START_AT" "$UPDATED_END_AT")"
request PATCH "/bookings/$CREATED_ID" "$UPDATE_PAYLOAD"
check_status "Update booking" 200

INVALID_PAYLOAD="$(printf '{"equipmentId":"eq-2","borrowerName":"Invalid Time","startAt":"%s","endAt":"%s","purpose":"Invalid range"}' "$UPDATED_END_AT" "$UPDATED_START_AT")"
request POST "/bookings" "$INVALID_PAYLOAD"
check_status "Reject invalid time range" 400

OVERLAP_PAYLOAD="$(printf '{"equipmentId":"eq-2","borrowerName":"Conflict Test","startAt":"%s","endAt":"%s","purpose":"Overlap test"}' "$OVERLAP_START_AT" "$OVERLAP_END_AT")"
request POST "/bookings" "$OVERLAP_PAYLOAD"
check_status "Reject overlap" 409

request GET "/bookings/not-found"
check_status "Missing booking" 404

DATE_ONLY_PAYLOAD='{"equipmentId":"eq-2","borrowerName":"Date Test","startAt":"2026-10-20","endAt":"2026-10-21","purpose":"Date-time validation"}'
request POST "/bookings" "$DATE_ONLY_PAYLOAD"
check_status "Reject date-only values" 400

DELETED_ID="$CREATED_ID"
request DELETE "/bookings/$DELETED_ID"
check_status "Delete booking" 204
CREATED_ID=""

request GET "/bookings/$DELETED_ID"
check_status "Confirm booking was deleted" 404

printf '\nSummary: %s passed, %s failed\n' "$PASS_COUNT" "$FAIL_COUNT"

if [ "$FAIL_COUNT" -ne 0 ]; then
  exit 1
fi
