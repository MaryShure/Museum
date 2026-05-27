import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import { query } from "./db.js";
import pagesRouter from "./routes/pages.js";
import blocksRouter from "./routes/blocks.js";
import uploadRouter from "./routes/upload.js";
import siteSettingsRouter from "./routes/siteSettings.js";
import cardsGridItemsRouter from "./routes/cardsGridItems.js";
import excursionTypesRouter from "./routes/excursionTypes.js";
import excursionSlotsRouter from "./routes/excursionSlots.js";
import bookingDraftsRouter from "./routes/bookingDrafts.js";
import bookingsRouter from "./routes/bookings.js";
import adminExcursionSlotsRouter from "./routes/adminExcursionSlots.js";
import adminBookingsRouter from "./routes/adminBookings.js";
import adminBookingDraftsRouter from "./routes/adminBookingDrafts.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/site-settings", siteSettingsRouter);

app.get("/api/health", async (_req, res) => {
  try {
    const result = await query("SELECT NOW() AS now");
    res.json({
      ok: true,
      message: "Server is running",
      dbTime: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Database connection error",
      error: error.message,
    });
  }
});

app.use("/api/pages", pagesRouter);
app.use("/api/blocks", blocksRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/blocks", cardsGridItemsRouter);

app.use("/api/excursion-types", excursionTypesRouter);
app.use("/api/excursion-slots", excursionSlotsRouter);
app.use("/api/booking-drafts", bookingDraftsRouter);
app.use("/api/bookings", bookingsRouter);

app.use("/api/admin/excursion-slots", adminExcursionSlotsRouter);
app.use("/api/admin/bookings", adminBookingsRouter);
app.use("/api/admin/booking-drafts", adminBookingDraftsRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API started on http://localhost:${PORT}`);
});
