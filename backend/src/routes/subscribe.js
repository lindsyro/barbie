import { Router } from "express";
import { subscribers } from "../data/mockData.js";

const router = Router();

/**
 * POST /api/subscribe
 * Подписка на новости и получение скидки 10%
 */
router.post("/", (req, res) => {
  const { email } = req.body || {};
  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Введите корректный email для оформления подписки",
    });
  }

  const alreadySubscribed = subscribers.has(trimmedEmail);
  subscribers.add(trimmedEmail);

  return res.json({
    message: alreadySubscribed
      ? "Вы уже подписаны на рассылку GOOSE Fashion House!"
      : "Спасибо за подписку! Ваш промокод на скидку 10%: GOOSE10",
    promoCode: "GOOSE10",
    discount: "10%",
  });
});

export default router;
