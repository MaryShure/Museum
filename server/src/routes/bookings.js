import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  const {
    public_token,
    telegram_user_id,
    telegram_username = null,
    customer_name,
    customer_phone,
    comment = "",
  } = req.body;

  if (!public_token || !customer_name || !customer_phone) {
    return res.status(400).json({
      message: "public_token, customer_name and customer_phone are required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const draftResult = await client.query(
      `
      SELECT
        bd.*,
        es.slot_date,
        es.start_time,
        es.capacity,
        es.booked_count,
        es.status AS slot_status
      FROM booking_drafts bd
      JOIN excursion_slots es ON es.id = bd.excursion_slot_id
      WHERE bd.public_token = $1
      FOR UPDATE
      `,
      [public_token],
    );

    if (draftResult.rows.length === 0) {
      throw new Error("Booking draft not found");
    }

    const draft = draftResult.rows[0];

    if (draft.status !== "draft") {
      throw new Error("Draft is no longer active");
    }

    if (new Date(draft.expires_at).getTime() < Date.now()) {
      throw new Error("Draft has expired");
    }

    if (draft.slot_status !== "available") {
      throw new Error("Slot is not available");
    }

    if (
      Number(draft.booked_count) + Number(draft.people_count) >
      Number(draft.capacity)
    ) {
      throw new Error("Not enough seats available");
    }

    const bookingResult = await client.query(
      `
      INSERT INTO bookings (
        booking_draft_id,
        excursion_type_id,
        excursion_slot_id,
        telegram_user_id,
        telegram_username,
        customer_name,
        customer_phone,
        people_count,
        comment,
        source,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'telegram', 'confirmed')
      RETURNING *
      `,
      [
        draft.id,
        draft.excursion_type_id,
        draft.excursion_slot_id,
        telegram_user_id ?? null,
        telegram_username ?? null,
        customer_name,
        customer_phone,
        draft.people_count,
        comment,
      ],
    );

    await client.query(
      `
      UPDATE excursion_slots
      SET
        booked_count = booked_count + $1,
        updated_at = NOW()
      WHERE id = $2
      `,
      [draft.people_count, draft.excursion_slot_id],
    );

    await client.query(
      `
      UPDATE booking_drafts
      SET
        status = 'completed',
        telegram_user_id = $1
      WHERE id = $2
      `,
      [telegram_user_id ?? null, draft.id],
    );

    await client.query("COMMIT");

    res.status(201).json({
      ...bookingResult.rows[0],
      slot_date: draft.slot_date,
      start_time: draft.start_time,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({
      message: error.message || "Failed to create booking",
    });
  } finally {
    client.release();
  }
});

router.post("/manual", async (req, res) => {
  const {
    excursion_type_id,
    excursion_slot_id,
    customer_name,
    customer_phone,
    people_count = 1,
    comment = "",
  } = req.body;

  if (
    !excursion_type_id ||
    !excursion_slot_id ||
    !customer_name ||
    !customer_phone
  ) {
    return res.status(400).json({
      message:
        "excursion_type_id, excursion_slot_id, customer_name and customer_phone are required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const slotResult = await client.query(
      `
      SELECT
        es.id,
        es.excursion_type_id,
        es.slot_date,
        es.start_time,
        es.capacity,
        es.booked_count,
        es.status,
        et.title AS excursion_title
      FROM excursion_slots es
      JOIN excursion_types et ON et.id = es.excursion_type_id
      WHERE es.id = $1
        AND es.excursion_type_id = $2
      FOR UPDATE
      `,
      [excursion_slot_id, excursion_type_id],
    );

    if (slotResult.rows.length === 0) {
      throw new Error("Слот не найден");
    }

    const slot = slotResult.rows[0];

    if (slot.status !== "available") {
      throw new Error("Слот недоступен");
    }

    if (
      Number(slot.booked_count) + Number(people_count) >
      Number(slot.capacity)
    ) {
      throw new Error("Недостаточно свободных мест");
    }

    const bookingResult = await client.query(
      `
      INSERT INTO bookings (
        excursion_type_id,
        excursion_slot_id,
        customer_name,
        customer_phone,
        people_count,
        comment,
        source,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'site_manual', 'pending')
      RETURNING *
      `,
      [
        excursion_type_id,
        excursion_slot_id,
        customer_name,
        customer_phone,
        people_count,
        comment,
      ],
    );

    await client.query(
      `
      UPDATE excursion_slots
      SET
        booked_count = booked_count + $1,
        updated_at = NOW()
      WHERE id = $2
      `,
      [people_count, excursion_slot_id],
    );

    await client.query("COMMIT");

    res.status(201).json({
      ...bookingResult.rows[0],
      excursion_title: slot.excursion_title,
      slot_date: slot.slot_date,
      start_time: slot.start_time,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({
      message: error.message || "Не удалось создать заявку",
    });
  } finally {
    client.release();
  }
});

export default router;
