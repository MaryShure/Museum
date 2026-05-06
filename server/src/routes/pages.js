import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await query(
      `
      SELECT id, title, slug, route_path, status, page_type, created_at, updated_at
      FROM pages
      ORDER BY id DESC
      `,
    );

    res.json(result.rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to load pages", error: error.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const pageResult = await query(
      `
      SELECT id, title, slug, route_path, status, page_type
      FROM pages
      WHERE slug = $1
      LIMIT 1
      `,
      [req.params.slug],
    );

    if (pageResult.rows.length === 0) {
      return res.status(404).json({ message: "Page not found" });
    }

    const page = pageResult.rows[0];

    const blocksResult = await query(
      `
      SELECT
        pb.id,
        pb.sort_order,
        pb.is_visible,
        pb.props,
        bt.code AS type,
        bt.name AS type_name
      FROM page_blocks pb
      JOIN block_types bt ON bt.id = pb.block_type_id
      WHERE pb.page_id = $1
      ORDER BY pb.sort_order ASC
      `,
      [page.id],
    );

    res.json({
      ...page,
      blocks: blocksResult.rows,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to load page", error: error.message });
  }
});

router.post("/", async (req, res) => {
  const {
    title,
    slug,
    route_path,
    status = "draft",
    page_type = "custom",
  } = req.body;

  if (!title || !slug || !route_path) {
    return res
      .status(400)
      .json({ message: "title, slug and route_path are required" });
  }

  try {
    const result = await query(
      `
      INSERT INTO pages (title, slug, route_path, status, page_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [title, slug, route_path, status, page_type],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create page", error: error.message });
  }
});

export default router;
