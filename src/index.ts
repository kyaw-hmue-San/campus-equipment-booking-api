import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
};

type BookingRow = {
  id: string;
  equipmentId: string;
  borrowerName: string;
  startAt: string;
  endAt: string;
  purpose: string;
};

type BookingInput = Omit<BookingRow, "id">;

const app = new Hono<{ Bindings: Bindings }>();

const bookingSelect = `
  SELECT
    id,
    equipment_id AS equipmentId,
    borrower_name AS borrowerName,
    start_at AS startAt,
    end_at AS endAt,
    purpose
  FROM bookings
`;

const inputFields = [
  "equipmentId",
  "borrowerName",
  "startAt",
  "endAt",
  "purpose",
] as const;

function error(message: string) {
  return { error: message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDate(value: string): string | null {
  const milliseconds = Date.parse(value);
  return Number.isNaN(milliseconds) ? null : new Date(milliseconds).toISOString();
}

function validateBooking(input: Record<string, unknown>):
  | { data: BookingInput }
  | { message: string } {
  for (const field of inputFields) {
    if (typeof input[field] !== "string" || input[field].trim() === "") {
      return { message: `${field} is required and must be a non-empty string` };
    }
  }

  const startAt = normalizeDate(input.startAt as string);
  const endAt = normalizeDate(input.endAt as string);

  if (!startAt || !endAt) {
    return { message: "startAt and endAt must be valid date-time values" };
  }

  if (startAt >= endAt) {
    return { message: "startAt must be before endAt" };
  }

  return {
    data: {
      equipmentId: (input.equipmentId as string).trim(),
      borrowerName: (input.borrowerName as string).trim(),
      startAt,
      endAt,
      purpose: (input.purpose as string).trim(),
    },
  };
}

async function parseJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return isRecord(body) ? body : null;
  } catch {
    return null;
  }
}

async function equipmentExists(db: D1Database, equipmentId: string) {
  const row = await db
    .prepare("SELECT id FROM equipment WHERE id = ?")
    .bind(equipmentId)
    .first<{ id: string }>();
  return row !== null;
}

async function hasOverlap(
  db: D1Database,
  booking: BookingInput,
  excludedBookingId?: string,
) {
  let statement = db.prepare(`
    SELECT id
    FROM bookings
    WHERE equipment_id = ?
      AND start_at < ?
      AND end_at > ?
  `);

  if (excludedBookingId) {
    statement = db.prepare(`
      SELECT id
      FROM bookings
      WHERE equipment_id = ?
        AND start_at < ?
        AND end_at > ?
        AND id <> ?
    `).bind(
      booking.equipmentId,
      booking.endAt,
      booking.startAt,
      excludedBookingId,
    );
  } else {
    statement = statement.bind(
      booking.equipmentId,
      booking.endAt,
      booking.startAt,
    );
  }

  return (await statement.first<{ id: string }>()) !== null;
}

app.get("/api/equipment", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT id, name, location FROM equipment ORDER BY id",
  ).all<{ id: string; name: string; location: string }>();
  return c.json(result.results);
});

app.get("/api/bookings", async (c) => {
  const result = await c.env.DB.prepare(
    `${bookingSelect} ORDER BY start_at, id`,
  ).all<BookingRow>();
  return c.json(result.results);
});

app.get("/api/bookings/:id", async (c) => {
  const booking = await c.env.DB.prepare(`${bookingSelect} WHERE id = ?`)
    .bind(c.req.param("id"))
    .first<BookingRow>();

  if (!booking) {
    return c.json(error("Booking not found"), 404);
  }

  return c.json(booking);
});

app.post("/api/bookings", async (c) => {
  const body = await parseJsonBody(c.req.raw);
  if (!body) {
    return c.json(error("Request body must be a JSON object"), 400);
  }

  const validation = validateBooking(body);
  if ("message" in validation) {
    return c.json(error(validation.message), 400);
  }

  const booking = validation.data;
  if (!(await equipmentExists(c.env.DB, booking.equipmentId))) {
    return c.json(error("Equipment not found"), 400);
  }

  if (await hasOverlap(c.env.DB, booking)) {
    return c.json(error("Booking conflicts with an existing booking"), 409);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO bookings (
      id, equipment_id, borrower_name, start_at, end_at, purpose
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    booking.equipmentId,
    booking.borrowerName,
    booking.startAt,
    booking.endAt,
    booking.purpose,
  ).run();

  return c.json({ id, ...booking }, 201);
});

app.patch("/api/bookings/:id", async (c) => {
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare(`${bookingSelect} WHERE id = ?`)
    .bind(id)
    .first<BookingRow>();

  if (!existing) {
    return c.json(error("Booking not found"), 404);
  }

  const body = await parseJsonBody(c.req.raw);
  if (!body) {
    return c.json(error("Request body must be a JSON object"), 400);
  }

  const suppliedFields = inputFields.filter((field) => field in body);
  if (suppliedFields.length === 0) {
    return c.json(error("Provide at least one booking field to update"), 400);
  }

  const merged: Record<string, unknown> = {
    equipmentId: existing.equipmentId,
    borrowerName: existing.borrowerName,
    startAt: existing.startAt,
    endAt: existing.endAt,
    purpose: existing.purpose,
  };
  for (const field of suppliedFields) {
    merged[field] = body[field];
  }

  const validation = validateBooking(merged);
  if ("message" in validation) {
    return c.json(error(validation.message), 400);
  }

  const booking = validation.data;
  if (!(await equipmentExists(c.env.DB, booking.equipmentId))) {
    return c.json(error("Equipment not found"), 400);
  }

  if (await hasOverlap(c.env.DB, booking, id)) {
    return c.json(error("Booking conflicts with an existing booking"), 409);
  }

  await c.env.DB.prepare(`
    UPDATE bookings
    SET equipment_id = ?, borrower_name = ?, start_at = ?, end_at = ?, purpose = ?
    WHERE id = ?
  `).bind(
    booking.equipmentId,
    booking.borrowerName,
    booking.startAt,
    booking.endAt,
    booking.purpose,
    id,
  ).run();

  return c.json({ id, ...booking });
});

app.delete("/api/bookings/:id", async (c) => {
  const existing = await c.env.DB.prepare("SELECT id FROM bookings WHERE id = ?")
    .bind(c.req.param("id"))
    .first<{ id: string }>();

  if (!existing) {
    return c.json(error("Booking not found"), 404);
  }

  await c.env.DB.prepare("DELETE FROM bookings WHERE id = ?")
    .bind(c.req.param("id"))
    .run();

  return c.body(null, 204);
});

app.notFound((c) => c.json(error("Route not found"), 404));

app.onError((cause, c) => {
  console.error(cause);
  return c.json(error("Internal server error"), 500);
});

export default app;
