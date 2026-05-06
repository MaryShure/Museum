import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";
import pagesRouter from "./routes/pages.js";
import blocksRouter from "./routes/blocks.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/health", async (req, res) => {
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

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API started on http://localhost:${PORT}`);
});
