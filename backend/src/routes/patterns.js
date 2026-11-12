import { Router } from "express";
import prisma from "../db.js";

const router = Router();

/**
 * GET /api/patterns
 * Список выкроек из базы PostgreSQL с фильтрацией, поиском и сортировкой
 */
router.get("/", async (req, res, next) => {
  try {
    const { category, doll, scale, tag, q, featured, sort } = req.query;

    const where = {};

    // Фильтр по категории
    if (category && category !== "all") {
      where.categoryId = String(category);
    }

    // Фильтр по кукле
    if (doll) {
      where.doll = { contains: String(doll), mode: "insensitive" };
    }

    // Фильтр по масштабу (1/6, 1/4, kids)
    if (scale && scale !== "all") {
      where.scale = String(scale);
    }

    // Фильтр по тегу
    if (tag) {
      where.tag = { equals: String(tag), mode: "insensitive" };
    }

    // Фильтр по популярным
    if (featured === "true") {
      where.isFeatured = true;
    }

    // Полнотекстовый поиск по названию, кукле или описанию
    if (q && typeof q === "string" && q.trim()) {
      const query = q.trim();
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { doll: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    // Сортировка
    let orderBy = { id: "asc" };
    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "rating_desc") {
      orderBy = { rating: "desc" };
    } else if (sort === "newest") {
      orderBy = { id: "desc" };
    }

    const items = await prisma.pattern.findMany({
      where,
      orderBy,
    });

    return res.json({
      total: items.length,
      items,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/patterns/featured
 * Популярные выкройки (хиты продаж для главной страницы)
 */
router.get("/featured", async (req, res, next) => {
  try {
    const items = await prisma.pattern.findMany({
      where: { isFeatured: true },
      orderBy: { id: "asc" },
    });

    return res.json({
      total: items.length,
      items,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/patterns/:id
 * Детальная карточка выкройки по ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const patternId = Number(req.params.id);
    if (isNaN(patternId)) {
      return res.status(400).json({ error: "ValidationError", message: "Некорректный ID выкройки" });
    }

    const pattern = await prisma.pattern.findUnique({
      where: { id: patternId },
      include: { category: true },
    });

    if (!pattern) {
      return res.status(404).json({
        error: "NotFound",
        message: `Выкройка с ID #${req.params.id} не найдена`,
      });
    }

    return res.json({ pattern });
  } catch (err) {
    next(err);
  }
});

export default router;
