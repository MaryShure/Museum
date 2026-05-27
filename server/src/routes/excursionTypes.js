import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        id,
        code,
        title,
        description,
        duration_minutes,
        price_from,
        is_active,
        created_at,
        updated_at
      FROM excursion_types
      WHERE is_active = TRUE
      ORDER BY id ASC
      `,
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load excursion types",
      error: error.message,
    });
  }
});

export default router;
