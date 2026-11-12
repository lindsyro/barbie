import { Router } from "express";
import prisma from "../db.js";

const router = Router();

/**
 * GET /api/reviews
 * Список отзывов покупателей из PostgreSQL
 */
router.get("/", async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      total: reviews.length,
      items: reviews,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/reviews
 * Добавление нового отзыва
 */
router.post("/", async (req, res, next) => {
  try {
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

    const newReview = await prisma.review.create({
      data: {
        author: trimmedAuthor,
        doll: typeof doll === "string" ? doll.trim() : "Барби",
        patternTitle: typeof patternTitle === "string" ? patternTitle.trim() : "Выкройка",
        rating: numRating,
        text: trimmedText,
      },
    });

    return res.status(201).json({
      message: "Спасибо за ваш отзыв!",
      review: newReview,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
