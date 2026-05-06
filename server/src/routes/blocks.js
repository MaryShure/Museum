import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  const { page_id, block_code, sort_order, props = {} } = req.body;

  if (!page_id || !block_code || sort_order === undefined) {
    return res.status(400).json({
      message: "page_id, block_code and sort_order are required",
    });
  }

  try {
    const blockTypeResult = await query(
      `
      SELECT id, code, name
      FROM block_types
      WHERE code = $1
      LIMIT 1
      `,
      [block_code],
    );

    if (blockTypeResult.rows.length === 0) {
      return res.status(404).json({ message: "Block type not found" });
    }

    const blockType = blockTypeResult.rows[0];

    const insertResult = await query(
      `
      INSERT INTO page_blocks (page_id, block_type_id, sort_order, props)
      VALUES ($1, $2, $3, $4::jsonb)
      RETURNING *
      `,
      [page_id, blockType.id, sort_order, JSON.stringify(props)],
    );

    res.status(201).json({
      ...insertResult.rows[0],
      type: blockType.code,
      type_name: blockType.name,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create block", error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { props, sort_order, is_visible } = req.body;
  const blockId = req.params.id;

  try {
    const currentResult = await query(
      `
      SELECT *
      FROM page_blocks
      WHERE id = $1
      LIMIT 1
      `,
      [blockId],
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: "Block not found" });
    }

    const current = currentResult.rows[0];

    const result = await query(
      `
      UPDATE page_blocks
      SET
        props = $1::jsonb,
        sort_order = $2,
        is_visible = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *
      `,
      [
        JSON.stringify(props ?? current.props),
        sort_order ?? current.sort_order,
        is_visible ?? current.is_visible,
        blockId,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update block", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await query(
      `
      DELETE FROM page_blocks
      WHERE id = $1
      RETURNING id
      `,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Block not found" });
    }

    res.json({ ok: true, deletedId: result.rows[0].id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete block", error: error.message });
  }
});

export default router;
