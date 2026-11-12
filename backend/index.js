import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./src/db.js";
import { authenticate } from "./src/middleware/auth.js";
import authRouter from "./src/routes/auth.js";
import patternsRouter from "./src/routes/patterns.js";
import categoriesRouter from "./src/routes/categories.js";
import cartRouter from "./src/routes/cart.js";
import wishlistRouter from "./src/routes/wishlist.js";
import ordersRouter from "./src/routes/orders.js";
import reviewsRouter from "./src/routes/reviews.js";
import subscribeRouter from "./src/routes/subscribe.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// 1. CORS: разрешаем запросы от Vite dev-сервера (localhost:5173) и любых клиентов
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// 2. Парсеры тела запросов
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 3. Простое и аккуратное логирование входящих HTTP-запросов
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const time = new Date().toLocaleTimeString("ru-RU", { hour12: false });
    console.log(`[${time}] ${req.method} ${req.originalUrl} ${res.statusCode} — ${duration}ms`);
  });
  next();
});

// 4. Определение текущего пользователя по Bearer-токену в PostgreSQL
app.use(authenticate);

// 5. Корневой маршрут и проверка работоспособности
app.get("/", (req, res) => {
  res.json({
    name: "GOOSE Fashion House API",
    version: "1.0.0",
    database: "PostgreSQL (goose)",
    status: "running",
    endpoints: {
      health: "GET /api/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        me: "GET /api/auth/me",
        logout: "POST /api/auth/logout",
      },
      patterns: {
        list: "GET /api/patterns",
        featured: "GET /api/patterns/featured",
        detail: "GET /api/patterns/:id",
      },
      categories: "GET /api/categories",
      cart: {
        get: "GET /api/cart",
        add: "POST /api/cart",
        remove: "DELETE /api/cart/:patternId",
        clear: "DELETE /api/cart",
      },
      wishlist: {
        get: "GET /api/wishlist",
        toggle: "POST /api/wishlist/toggle",
        remove: "DELETE /api/wishlist/:patternId",
      },
      orders: {
        create: "POST /api/orders",
        list: "GET /api/orders",
      },
      reviews: {
        list: "GET /api/reviews",
        create: "POST /api/reviews",
      },
      subscribe: "POST /api/subscribe",
    },
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected (PostgreSQL / goose)",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      error: err.message,
    });
  }
});

// 6. Подключение маршрутов API
app.use("/api/auth", authRouter);
app.use("/api/patterns", patternsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/subscribe", subscribeRouter);

// 7. Обработка неизвестных маршрутов (404)
app.use((req, res) => {
  res.status(404).json({
    error: "NotFound",
    message: `Маршрут ${req.method} ${req.originalUrl} не найден`,
  });
});

// 8. Централизованная обработка ошибок (500)
app.use((err, req, res, next) => {
  console.error("Ошибка сервера:", err);
  res.status(err.status || 500).json({
    error: err.name || "InternalServerError",
    message: err.message || "Внутренняя ошибка сервера",
  });
});

// 9. Запуск сервера
const server = app.listen(PORT, () => {
  console.log(`
==================================================
  🦢 GOOSE Fashion House API Server
  🗄️  База данных:   PostgreSQL (база: goose)
  🚀 Сервер запущен: http://localhost:${PORT}
  📡 Проверка API:   http://localhost:${PORT}/api/health
  📚 Каталог выкроек: http://localhost:${PORT}/api/patterns
==================================================
  `);
});

// Корректная остановка (graceful shutdown)
const handleShutdown = async () => {
  console.log("\nОстановка сервера GOOSE Fashion House...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Сервер остановлен, соединение с БД закрыто.");
    process.exit(0);
  });
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

export default app;
