import jwt from "jsonwebtoken";
import { query } from "../db.js";

const COOKIE_NAME = "admin_token";

export async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        message: "Требуется авторизация",
      });
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
      return res.status(401).json({
        message: "Пользователь недоступен",
      });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Необходим повторный вход",
    });
  }
}
