import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { month, excursion_type_id } = req.query;

  try {
    const conditions = [];
    const values = [];

    if (month) {
      values.push(`${month}-01`);
      conditions.push(
        `date_trunc('month', es.slot_date) = date_trunc('month', $${values.length}::date)`,
      );
    }

    if (excursion_type_id) {
      values.push(excursion_type_id);
      conditions.push(`es.excursion_type_id = $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await query(
      `
      SELECT
        es.id,
        es.excursion_type_id,
        es.slot_date,
        es.start_time,
        es.capacity,
        es.booked_count,
        es.status,
        es.created_at,
        es.updated_at,
        et.title AS excursion_title,
        et.code AS excursion_code
      FROM excursion_slots es
      JOIN excursion_types et ON et.id = es.excursion_type_id
      ${whereClause}
      ORDER BY es.slot_date ASC, es.start_time ASC
      `,
      values,
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load admin excursion slots",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  const {
    excursion_type_id,
    slot_date,
    start_time,
    capacity = 10,
    booked_count = 0,
    status = "available",
  } = req.body;

  if (!excursion_type_id || !slot_date || !start_time) {
    return res.status(400).json({
      message: "excursion_type_id, slot_date and start_time are required",
    });
  }

  try {
    const result = await query(
      `
      INSERT INTO excursion_slots (
        excursion_type_id,
        slot_date,
        start_time,
        capacity,
        booked_count,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        excursion_type_id,
        slot_date,
        start_time,
        capacity,
        booked_count,
        status,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create excursion slot",
      error: error.message,
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const currentResult = await query(
      `
      SELECT *
      FROM excursion_slots
      WHERE id = $1
      LIMIT 1
      `,
      [req.params.id],
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: "Excursion slot not found" });
    }

    const current = currentResult.rows[0];
    const {
      excursion_type_id,
      slot_date,
      start_time,
      capacity,
      booked_count,
      status,
    } = req.body;

    const result = await query(
      `
      UPDATE excursion_slots
      SET
        excursion_type_id = $1,
        slot_date = $2,
        start_time = $3,
        capacity = $4,
        booked_count = $5,
        status = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
      `,
      [
        excursion_type_id ?? current.excursion_type_id,
        slot_date ?? current.slot_date,
        start_time ?? current.start_time,
        capacity ?? current.capacity,
        booked_count ?? current.booked_count,
        status ?? current.status,
        req.params.id,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update excursion slot",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await query(
      `
      DELETE FROM excursion_slots
      WHERE id = $1
      RETURNING id
      `,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Excursion slot not found" });
    }

    res.json({ ok: true, deletedId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete excursion slot",
      error: error.message,
    });
  }
});

export default router;
