import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { excursion_type_id = "" } = req.query;

  try {
    const values = [];
    const conditions = [];
    let index = 1;

    if (excursion_type_id) {
      conditions.push(`bd.excursion_type_id = $${index++}`);
      values.push(excursion_type_id);
    }

    const whereSql = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await query(
      `
      SELECT
        bd.id,
        bd.public_token,
        bd.excursion_type_id,
        bd.excursion_slot_id,
        bd.people_count,
        bd.source,
        bd.status,
        bd.telegram_user_id,
        bd.expires_at,
        et.title AS excursion_title,
        es.slot_date,
        es.start_time
      FROM booking_drafts bd
      JOIN excursion_types et ON et.id = bd.excursion_type_id
      JOIN excursion_slots es ON es.id = bd.excursion_slot_id
      ${whereSql}
      ORDER BY bd.id DESC
      `,
      values,
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load booking drafts",
      error: error.message,
    });
  }
});

export default router;
