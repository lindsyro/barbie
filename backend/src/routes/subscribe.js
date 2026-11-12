import { Router } from "express";
import prisma from "../db.js";

const router = Router();

/**
 * POST /api/subscribe
 * Подписка на новости и получение промокода со скидкой
 */
router.post("/", async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.status(400).json({
        error: "ValidationError",
        message: "Введите корректный email для оформления подписки",
      });
    }

    const existing = await prisma.subscriber.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      return res.json({
        message: "Вы уже подписаны на рассылку GOOSE Fashion House!",
        promoCode: existing.promoCode,
        discount: "10%",
      });
    }

    const newSub = await prisma.subscriber.create({
      data: {
        email: trimmedEmail,
        promoCode: "GOOSE10",
      },
    });

    return res.json({
      message: "Спасибо за подписку! Ваш промокод на скидку 10%: GOOSE10",
      promoCode: newSub.promoCode,
      discount: "10%",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
