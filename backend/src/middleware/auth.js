import { users, sessions } from "../data/mockData.js";

/**
 * Middleware для извлечения пользователя из Bearer токена
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  let token = null;

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (req.headers["x-auth-token"]) {
    token = String(req.headers["x-auth-token"]).trim();
  }

  if (token && sessions.has(token)) {
    const userId = sessions.get(token);
    const user = users.find((u) => u.id === userId);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      };
      req.token = token;
    }
  }

  next();
}

/**
 * Middleware для защиты маршрутов (требует обязательной авторизации)
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Для выполнения этого действия необходимо войти в аккаунт",
    });
  }
  next();
}

/**
 * Вспомогательная функция для получения идентификатора пользователя
 * (для авторизованных — user.id, для гостей — x-guest-id или "guest")
 */
export function getContextId(req) {
  if (req.user?.id) {
    return req.user.id;
  }
  const guestId = req.headers["x-guest-id"];
  return typeof guestId === "string" && guestId.trim() ? `guest-${guestId.trim()}` : null;
}
