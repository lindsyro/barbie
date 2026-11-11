import { Router } from "express";
import { reviews } from "../data/mockData.js";

const router = Router();

/**
 * GET /api/reviews
 * Список отзывов покупателей
 */
router.get("/", (req, res) => {
  return res.json({
    total: reviews.length,
    items: reviews,
  });
});

/**
 * POST /api/reviews
 * Добавление нового отзыва
 */
router.post("/", (req, res) => {
  const { author, doll, patternTitle, rating, text } = req.body || {};

  const trimmedAuthor = typeof author === "string" ? author.trim() : "";
  const trimmedText = typeof text === "string" ? text.trim() : "";

  if (!trimmedAuthor || !trimmedText) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Пожалуйста, заполните имя автора и текст отзыва",
    });
  }

  const numRating = Math.min(5, Math.max(1, Number(rating) || 5));

  const newReview = {
    id: reviews.length + 1,
    author: trimmedAuthor,
    doll: typeof doll === "string" ? doll.trim() : "Барби",
    patternTitle: typeof patternTitle === "string" ? patternTitle.trim() : "Выкройка",
    rating: numRating,
    text: trimmedText,
    createdAt: new Date().toISOString().split("T")[0],
  };

  reviews.unshift(newReview);

  return res.status(201).json({
    message: "Спасибо за ваш отзыв!",
    review: newReview,
  });
});

export default router;
