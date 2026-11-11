import { Router } from "express";
import crypto from "node:crypto";
import { orders, carts, patterns } from "../data/mockData.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/orders
 * Оформление заказа выкроек
 */
router.post("/", requireAuth, (req, res) => {
  const userId = req.user.id;
  const { items: customItems, paymentMethod = "card" } = req.body || {};

  let itemsToOrder = [];

  if (Array.isArray(customItems) && customItems.length > 0) {
    itemsToOrder = customItems;
  } else {
    // Берём из корзины пользователя
    const userCart = carts.get(userId) || [];
    itemsToOrder = userCart;
  }

  if (itemsToOrder.length === 0) {
    return res.status(400).json({
      error: "EmptyOrder",
      message: "Корзина пуста. Добавьте выкройки перед оформлением заказа.",
    });
  }

  let totalAmount = 0;
  const orderItems = [];
  const seenPatternIds = new Set();

  for (const item of itemsToOrder) {
    const patternId = item.patternId || item.id;
    if (seenPatternIds.has(patternId)) {
      continue;
    }
    seenPatternIds.add(patternId);

    const pattern = patterns.find((p) => p.id === patternId);
    if (pattern) {
      totalAmount += pattern.price;
      orderItems.push({
        patternId: pattern.id,
        title: pattern.title,
        doll: pattern.doll,
        price: pattern.price,
        format: pattern.format || "PDF (A4 + инструкции)",
        // Ссылка на скачивание PDF после оплаты
        downloadUrl: `/downloads/patterns/${pattern.id}-pattern.pdf`,
      });
    }
  }

  const orderId = `ORD-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

  const newOrder = {
    id: orderId,
    userId,
    userEmail: req.user.email,
    userName: req.user.name,
    status: "paid",
    paymentMethod,
    totalAmount,
    currency: "RUB",
    items: orderItems,
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);

  // Очищаем корзину пользователя после оформления
  carts.set(userId, []);

  return res.status(201).json({
    message: "Заказ успешно оформлен! Ссылки на скачивание PDF отправлены на email.",
    order: newOrder,
  });
});

/**
 * GET /api/orders
 * Список заказов текущего пользователя
 */
router.get("/", requireAuth, (req, res) => {
  const userOrders = orders.filter((o) => o.userId === req.user.id);
  return res.json({
    total: userOrders.length,
    orders: userOrders,
  });
});

export default router;
