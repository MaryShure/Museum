import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `
      SELECT id, code, header_config, footer_config, updated_at
      FROM site_settings
      WHERE code = 'main'
      LIMIT 1
      `,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Site settings not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load site settings",
      error: error.message,
    });
  }
});

router.patch("/", async (req, res) => {
  const { header_config, footer_config } = req.body;

  try {
    const currentResult = await query(
      `
      SELECT *
      FROM site_settings
      WHERE code = 'main'
      LIMIT 1
      `,
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: "Site settings not found" });
    }

    const current = currentResult.rows[0];

    const result = await query(
      `
      UPDATE site_settings
      SET
        header_config = $1::jsonb,
        footer_config = $2::jsonb,
        updated_at = NOW()
      WHERE code = 'main'
      RETURNING *
      `,
      [
        JSON.stringify(header_config ?? current.header_config ?? {}),
        JSON.stringify(footer_config ?? current.footer_config ?? {}),
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update site settings",
      error: error.message,
    });
  }
});

export default router;
