import { Router } from "express";
import { query } from "../db.js";

const router = Router();

const getLinkedUrlFieldName = (pageFieldName) => {
  const linkedUrlFieldMap = {
    pageId: "linkUrl",
  };

  return linkedUrlFieldMap[pageFieldName] || null;
};

const enrichPropsWithPageUrl = async (props = {}) => {
  const nextProps = { ...props };

  for (const [pageFieldName, urlFieldName] of Object.entries({
    pageId: "linkUrl",
  })) {
    const pageId = nextProps[pageFieldName];

    if (!pageId) continue;

    const pageResult = await query(
      `
      SELECT id, slug, route_path
      FROM pages
      WHERE id = $1
      LIMIT 1
      `,
      [pageId],
    );

    if (pageResult.rows.length > 0) {
      const page = pageResult.rows[0];
      nextProps[urlFieldName] = page.route_path || `/${page.slug}`;
    }
  }

  return nextProps;
};

const ensureCardsGridBlock = async (blockId) => {
  const result = await query(
    `
    SELECT pb.id, bt.code
    FROM page_blocks pb
    JOIN block_types bt ON bt.id = pb.block_type_id
    WHERE pb.id = $1
    LIMIT 1
    `,
    [blockId],
  );

  if (result.rows.length === 0) {
    return { ok: false, status: 404, message: "Block not found" };
  }

  if (result.rows[0].code !== "cardsGrid") {
    return {
      ok: false,
      status: 400,
      message: "Block is not cardsGrid",
    };
  }

  return { ok: true, block: result.rows[0] };
};

router.get("/:blockId/items", async (req, res) => {
  const { blockId } = req.params;

  try {
    const check = await ensureCardsGridBlock(blockId);

    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    const result = await query(
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
      WHERE block_id = $1
      ORDER BY sort_order ASC, id ASC
      `,
      [blockId],
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load cards grid items",
      error: error.message,
    });
  }
});

router.post("/:blockId/items", async (req, res) => {
  const { blockId } = req.params;
  const { item_type, props = {}, is_visible = true } = req.body;

  if (!item_type) {
    return res.status(400).json({ message: "item_type is required" });
  }

  try {
    const check = await ensureCardsGridBlock(blockId);

    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    const orderResult = await query(
      `
      SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order
      FROM cards_grid_items
      WHERE block_id = $1
      `,
      [blockId],
    );

    const nextSortOrder = Number(orderResult.rows[0].next_sort_order);
    const normalizedProps = await enrichPropsWithPageUrl(props);

    const insertResult = await query(
      `
      INSERT INTO cards_grid_items (
        block_id,
        item_type,
        sort_order,
        is_visible,
        props
      )
      VALUES ($1, $2, $3, $4, $5::jsonb)
      RETURNING *
      `,
      [
        blockId,
        item_type,
        nextSortOrder,
        is_visible,
        JSON.stringify(normalizedProps),
      ],
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create cards grid item",
      error: error.message,
    });
  }
});

router.patch("/:blockId/items/:itemId", async (req, res) => {
  const { blockId, itemId } = req.params;
  const { props, sort_order, is_visible } = req.body;

  try {
    const check = await ensureCardsGridBlock(blockId);

    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    const currentResult = await query(
      `
      SELECT *
      FROM cards_grid_items
      WHERE id = $1 AND block_id = $2
      LIMIT 1
      `,
      [itemId, blockId],
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: "Cards grid item not found" });
    }

    const current = currentResult.rows[0];
    const mergedProps = {
      ...(current.props || {}),
      ...(props || {}),
    };
    const normalizedProps = await enrichPropsWithPageUrl(mergedProps);

    const result = await query(
      `
      UPDATE cards_grid_items
      SET
        props = $1::jsonb,
        sort_order = $2,
        is_visible = $3,
        updated_at = NOW()
      WHERE id = $4 AND block_id = $5
      RETURNING *
      `,
      [
        JSON.stringify(normalizedProps),
        sort_order ?? current.sort_order,
        is_visible ?? current.is_visible,
        itemId,
        blockId,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update cards grid item",
      error: error.message,
    });
  }
});

router.delete("/:blockId/items/:itemId", async (req, res) => {
  const { blockId, itemId } = req.params;

  try {
    const check = await ensureCardsGridBlock(blockId);

    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    const result = await query(
      `
      DELETE FROM cards_grid_items
      WHERE id = $1 AND block_id = $2
      RETURNING id
      `,
      [itemId, blockId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cards grid item not found" });
    }

    res.json({ ok: true, deletedId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete cards grid item",
      error: error.message,
    });
  }
});

export default router;
