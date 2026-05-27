import { Router } from "express";
import crypto from "crypto";
import { query } from "../db.js";

const router = Router();

const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;

router.post("/", async (req, res) => {
  const { excursion_type_id, excursion_slot_id, people_count = 1 } = req.body;

  if (!excursion_type_id || !excursion_slot_id) {
    return res.status(400).json({
      message: "excursion_type_id and excursion_slot_id are required",
    });
  }

  try {
    const slotResult = await query(
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
      WHERE es.id = $1
        AND es.excursion_type_id = $2
      LIMIT 1
      `,
      [excursion_slot_id, excursion_type_id],
    );

    if (slotResult.rows.length === 0) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const slot = slotResult.rows[0];

    if (slot.status !== "available") {
      return res.status(400).json({ message: "Slot is not available" });
    }

    if (
      Number(slot.booked_count) + Number(people_count) >
      Number(slot.capacity)
    ) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    const publicToken = `bk_${crypto.randomBytes(6).toString("base64url")}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const draftResult = await query(
      `
      INSERT INTO booking_drafts (
        public_token,
        excursion_type_id,
        excursion_slot_id,
        people_count,
        source,
        status,
        expires_at
      )
      VALUES ($1, $2, $3, $4, 'site_to_telegram', 'draft', $5)
      RETURNING *
      `,
      [
        publicToken,
        excursion_type_id,
        excursion_slot_id,
        people_count,
        expiresAt.toISOString(),
      ],
    );

    res.status(201).json({
      ...draftResult.rows[0],
      telegram_url: `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${publicToken}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create booking draft",
      error: error.message,
    });
  }
});

router.get("/:token", async (req, res) => {
  try {
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
      WHERE bd.public_token = $1
      LIMIT 1
      `,
      [req.params.token],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking draft not found" });
    }

    const draft = result.rows[0];

    if (draft.status !== "draft") {
      return res.status(400).json({ message: "Draft is no longer active" });
    }

    if (new Date(draft.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ message: "Draft has expired" });
    }

    res.json(draft);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load booking draft",
      error: error.message,
    });
  }
});

export default router;
