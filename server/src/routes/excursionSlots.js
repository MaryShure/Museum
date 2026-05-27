import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { excursion_type_id, month } = req.query;

  if (!excursion_type_id || !month) {
    return res.status(400).json({
      message: "excursion_type_id and month are required",
    });
  }

  try {
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
        et.title AS excursion_title
      FROM excursion_slots es
      JOIN excursion_types et ON et.id = es.excursion_type_id
      WHERE es.excursion_type_id = $1
        AND TO_CHAR(es.slot_date, 'YYYY-MM') = $2
      ORDER BY es.slot_date ASC, es.start_time ASC
      `,
      [excursion_type_id, month],
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load excursion slots",
      error: error.message,
    });
  }
});

export default router;
