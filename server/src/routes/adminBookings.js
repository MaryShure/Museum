import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { status, excursion_type_id, date_from, date_to } = req.query;

  try {
    const conditions = [];
    const values = [];

    if (status) {
      values.push(status);
      conditions.push(`b.status = $${values.length}`);
    }

    if (excursion_type_id) {
      values.push(excursion_type_id);
      conditions.push(`b.excursion_type_id = $${values.length}`);
    }

    if (date_from) {
      values.push(date_from);
      conditions.push(`es.slot_date >= $${values.length}::date`);
    }

    if (date_to) {
      values.push(date_to);
      conditions.push(`es.slot_date <= $${values.length}::date`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await query(
      `
      SELECT
        b.id,
        b.booking_draft_id,
        b.excursion_type_id,
        b.excursion_slot_id,
        b.telegram_user_id,
        b.customer_name,
        b.customer_phone,
        b.people_count,
        b.comment,
        b.source,
        b.status,
        b.created_at,
        b.updated_at,
        et.title AS excursion_title,
        es.slot_date,
        es.start_time
      FROM bookings b
      JOIN excursion_types et ON et.id = b.excursion_type_id
      JOIN excursion_slots es ON es.id = b.excursion_slot_id
      ${whereClause}
      ORDER BY es.slot_date DESC, es.start_time DESC, b.created_at DESC
      `,
      values,
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load bookings",
      error: error.message,
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const currentResult = await query(
      `
      SELECT *
      FROM bookings
      WHERE id = $1
      LIMIT 1
      `,
      [req.params.id],
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const current = currentResult.rows[0];
    const { status, comment, customer_name, customer_phone } = req.body;

    const result = await query(
      `
      UPDATE bookings
      SET
        status = $1,
        comment = $2,
        customer_name = $3,
        customer_phone = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
      [
        status ?? current.status,
        comment ?? current.comment,
        customer_name ?? current.customer_name,
        customer_phone ?? current.customer_phone,
        req.params.id,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update booking",
      error: error.message,
    });
  }
});

export default router;
