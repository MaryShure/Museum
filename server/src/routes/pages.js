import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `
      SELECT
        id,
        title,
        slug,
        route_path,
        status,
        page_type,
        preview_image,
        created_at,
        updated_at
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
      SELECT
        id,
        title,
        slug,
        route_path,
        status,
        page_type,
        preview_image,
        created_at,
        updated_at
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

    const blocks = blocksResult.rows;
    const cardsGridBlockIds = blocks
      .filter((block) => block.type === "cardsGrid")
      .map((block) => block.id);

    let itemsByBlockId = {};

    if (cardsGridBlockIds.length > 0) {
      const itemsResult = await query(
        `
        SELECT
          id,
          block_id,
          item_type,
          sort_order,
          is_visible,
          props,
          created_at,
          updated_at
        FROM cards_grid_items
        WHERE block_id = ANY($1::bigint[])
        ORDER BY sort_order ASC, id ASC
        `,
        [cardsGridBlockIds],
      );

      itemsByBlockId = itemsResult.rows.reduce((acc, item) => {
        const key = item.block_id;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {});
    }

    const enrichedBlocks = blocks.map((block) => {
      if (block.type !== "cardsGrid") {
        return block;
      }

      return {
        ...block,
        items: itemsByBlockId[block.id] || [],
      };
    });

    res.json({
      ...page,
      blocks: enrichedBlocks,
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
    preview_image = "",
  } = req.body;

  if (!title || !slug || !route_path) {
    return res
      .status(400)
      .json({ message: "title, slug and route_path are required" });
  }

  try {
    const result = await query(
      `
      INSERT INTO pages (
        title,
        slug,
        route_path,
        status,
        page_type,
        preview_image
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [title, slug, route_path, status, page_type, preview_image],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create page", error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  const pageId = req.params.id;
  const { title, slug, route_path, status, page_type, preview_image } =
    req.body;

  try {
    const currentResult = await query(
      `
      SELECT *
      FROM pages
      WHERE id = $1
      LIMIT 1
      `,
      [pageId],
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: "Page not found" });
    }

    const current = currentResult.rows[0];

    const result = await query(
      `
      UPDATE pages
      SET
        title = $1,
        slug = $2,
        route_path = $3,
        status = $4,
        page_type = $5,
        preview_image = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
      `,
      [
        title ?? current.title,
        slug ?? current.slug,
        route_path ?? current.route_path,
        status ?? current.status,
        page_type ?? current.page_type,
        preview_image ?? current.preview_image,
        pageId,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update page", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await query("DELETE FROM page_blocks WHERE page_id = $1", [req.params.id]);

    const result = await query(
      `
      DELETE FROM pages
      WHERE id = $1
      RETURNING id, slug
      `,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json({
      ok: true,
      deletedId: result.rows[0].id,
      deletedSlug: result.rows[0].slug,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete page", error: error.message });
  }
});

export default router;
