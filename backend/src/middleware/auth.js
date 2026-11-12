import prisma from "../db.js";

/**
 * Middleware для извлечения пользователя из Bearer токена в PostgreSQL
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    let token = null;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    } else if (req.headers["x-auth-token"]) {
      token = String(req.headers["x-auth-token"]).trim();
    }

    if (token) {
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (session?.user) {
        req.user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          createdAt: session.user.createdAt,
        };
        req.token = token;
      }
    }
  } catch (err) {
    console.error("Ошибка аутентификации:", err);
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
