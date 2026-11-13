import { Router } from "express";
import crypto from "node:crypto";
import prisma from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/orders
 * Оформление заказа цифровых выкроек в PostgreSQL
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items: customItems, paymentMethod = "card" } = req.body || {};

    let patternIdsToOrder = [];

    if (Array.isArray(customItems) && customItems.length > 0) {
      patternIdsToOrder = customItems.map((it) => it.patternId || it.id).filter(Boolean);
    } else {
      const userCartItems = await prisma.cartItem.findMany({
        where: { contextId: userId },
      });
      patternIdsToOrder = userCartItems.map((it) => it.patternId);
    }

    // Дедупликация: каждая цифровая выкройка в 1 экземпляре
    const uniquePatternIds = Array.from(new Set(patternIdsToOrder));

    if (uniquePatternIds.length === 0) {
      return res.status(400).json({
        error: "EmptyOrder",
        message: "Корзина пуста. Добавьте выкройки перед оформлением заказа.",
      });
    }

    const patterns = await prisma.pattern.findMany({
      where: { id: { in: uniquePatternIds } },
    });

    if (patterns.length === 0) {
      return res.status(404).json({
        error: "NotFound",
        message: "Выбранные выкройки не найдены",
      });
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const totalAmount = patterns.reduce((sum, p) => sum + p.price, 0);

    const orderItemsData = patterns.map((p) => ({
      patternId: p.id,
      title: p.title,
      doll: p.doll,
      price: p.price,
      format: p.format,
      downloadUrl: `/downloads/patterns/${p.id}-pattern.pdf`,
    }));

    // Создаем заказ и очищаем корзину в транзакции
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          id: orderId,
          userId,
          userEmail: req.user.email,
          userName: req.user.name,
          status: "paid",
          paymentMethod,
          totalAmount,
          currency: "RUB",
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      await tx.cartItem.deleteMany({
        where: { contextId: userId },
      });

      return createdOrder;
    });

    return res.status(201).json({
      message: "Заказ успешно оформлен! Ссылки на скачивание PDF отправлены на email.",
      order,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/purchased
 * Список всех купленных выкроек текущего пользователя со ссылками на скачивание
 */
router.get("/purchased", requireAuth, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id, status: "paid" },
      include: {
        items: {
          include: {
            pattern: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const purchasedMap = new Map();
    for (const order of orders) {
      for (const item of order.items) {
        if (!purchasedMap.has(item.patternId)) {
          purchasedMap.set(item.patternId, {
            id: item.id,
            patternId: item.patternId,
            title: item.title,
            doll: item.doll,
            price: item.price,
            format: item.format,
            downloadUrl: item.downloadUrl,
            orderId: order.id,
            purchasedAt: order.createdAt,
            image: item.pattern?.image || `/patterns/${item.patternId}.png`,
            tag: item.pattern?.tag || "Куплено",
            difficulty: item.pattern?.difficulty || "Легкий",
          });
        }
      }
    }

    const items = Array.from(purchasedMap.values());
    return res.json({
      total: items.length,
      items,
      ordersCount: orders.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders
 * Список заказов текущего пользователя
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const userOrders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            pattern: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      total: userOrders.length,
      orders: userOrders,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
