import { Router } from "express";
import crypto from "node:crypto";
import { users, sessions } from "../data/mockData.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password, salt, originalHash) {
  const hash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
}

/**
 * POST /api/auth/register
 * Регистрация нового пользователя
 */
router.post("/register", (req, res) => {
  const { name, email, password } = req.body || {};

  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!trimmedName) {
    return res.status(400).json({ error: "ValidationError", message: "Укажите ваше имя" });
  }

  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return res.status(400).json({ error: "ValidationError", message: "Введите корректный адрес электронной почты" });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Пароль должен содержать как минимум 6 символов",
    });
  }

  // Проверка уникальности email
  const existingUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (existingUser) {
    return res.status(409).json({
      error: "Conflict",
      message: "Пользователь с таким email уже зарегистрирован",
    });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const userId = `user-${crypto.randomUUID()}`;

  const newUser = {
    id: userId,
    email: trimmedEmail,
    name: trimmedName,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  // Создаем токен сессии
  const token = `token-${crypto.randomUUID()}`;
  sessions.set(token, userId);

  return res.status(201).json({
    message: "Регистрация прошла успешно",
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    },
  });
});

/**
 * POST /api/auth/login
 * Авторизация по email и паролю
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!trimmedEmail || !password) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Пожалуйста, укажите email и пароль",
    });
  }

  const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (!user) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Неверный email или пароль",
    });
  }

  const isPasswordValid = verifyPassword(password, user.salt, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Неверный email или пароль",
    });
  }

  const token = `token-${crypto.randomUUID()}`;
  sessions.set(token, user.id);

  return res.json({
    message: "Вход выполнен успешно",
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
  });
});

/**
 * GET /api/auth/me
 * Получение профиля текущего авторизованного пользователя
 */
router.get("/me", requireAuth, (req, res) => {
  return res.json({
    user: req.user,
  });
});

/**
 * POST /api/auth/logout
 * Завершение сессии (выход)
 */
router.post("/logout", (req, res) => {
  if (req.token) {
    sessions.delete(req.token);
  }
  return res.json({ message: "Вы успешно вышли из аккаунта" });
});

export default router;
