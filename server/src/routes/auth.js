import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

const router = express.Router();

const COOKIE_NAME = "admin_token";

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Email и пароль обязательны",
      });
    }

    const result = await query(
      `
        SELECT id, email, password_hash, full_name, role, is_active
        FROM admin_users
        WHERE email = $1
        LIMIT 1
      `,
      [email.trim().toLowerCase()],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        message: "Неверный email или пароль",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        message: "Пользователь деактивирован",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Неверный email или пароль",
      });
    }

    const token = signToken(user);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Не удалось выполнить вход",
      error: error.message,
    });
  }
});

router.post("/logout", async (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  return res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ message: "Не авторизован" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      `
        SELECT id, email, full_name, role, is_active
        FROM admin_users
        WHERE id = $1
        LIMIT 1
      `,
      [payload.id],
    );

    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Пользователь недоступен" });
    }

    return res.json({
      ok: true,
      user,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Сессия недействительна",
    });
  }
});

export default router;
