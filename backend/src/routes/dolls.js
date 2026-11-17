import { Router } from "express";
import prisma from "../db.js";

const router = Router();

/**
 * GET /api/dolls
 * Возвращает полный список кукол из PostgreSQL
 */
router.get("/", async (req, res, next) => {
  try {
    const dolls = await prisma.doll.findMany({
      include: {
        category: true,
      },
      orderBy: { id: "asc" },
    });

    return res.json({
      total: dolls.length,
      items: dolls,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dolls/categories
 * Возвращает список категорий кукол с вложенными куклами (для меню и фильтров)
 */
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await prisma.dollCategory.findMany({
      include: {
        dolls: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return res.json({
      total: categories.length,
      items: categories,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dolls/:id
 * Получение информации о конкретной кукле по ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({
        error: "ValidationError",
        message: "Некорректный ID куклы",
      });
    }

    const doll = await prisma.doll.findUnique({
      where: { id },
      include: {
        category: true,
        patterns: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!doll) {
      return res.status(404).json({
        error: "NotFound",
        message: `Кукла с ID ${id} не найдена`,
      });
    }

    return res.json(doll);
  } catch (err) {
    next(err);
  }
});

export default router;
