import { Router } from "express";
import { patterns } from "../data/mockData.js";

const router = Router();

/**
 * GET /api/patterns
 * Список выкроек с фильтрацией, поиском и сортировкой
 */
router.get("/", (req, res) => {
  const { category, doll, scale, tag, q, featured, sort } = req.query;

  let result = [...patterns];

  // Фильтр по категории
  if (category && category !== "all") {
    result = result.filter((item) => item.category === category);
  }

  // Фильтр по кукле
  if (doll) {
    const dollQuery = String(doll).toLowerCase();
    result = result.filter((item) => item.doll.toLowerCase().includes(dollQuery));
  }

  // Фильтр по масштабу (1/6, 1/4, kids)
  if (scale && scale !== "all") {
    result = result.filter((item) => item.scale === scale);
  }

  // Фильтр по тегу
  if (tag) {
    result = result.filter((item) => item.tag.toLowerCase() === String(tag).toLowerCase());
  }

  // Фильтр по популярным
  if (featured === "true") {
    result = result.filter((item) => item.isFeatured);
  }

  // Полнотекстовый поиск по названию или описанию
  if (q && typeof q === "string") {
    const query = q.trim().toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.doll.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }

  // Сортировка
  if (sort === "price_asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === "rating_desc") {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sort === "newest") {
    result.sort((a, b) => b.id - a.id);
  }

  return res.json({
    total: result.length,
    items: result,
  });
});

/**
 * GET /api/patterns/featured
 * Популярные выкройки (хиты продаж для главной страницы)
 */
router.get("/featured", (req, res) => {
  const featuredPatterns = patterns.filter((item) => item.isFeatured);
  return res.json({
    total: featuredPatterns.length,
    items: featuredPatterns,
  });
});

/**
 * GET /api/patterns/:id
 * Детальная карточка выкройки
 */
router.get("/:id", (req, res) => {
  const patternId = Number(req.params.id);
  const pattern = patterns.find((p) => p.id === patternId);

  if (!pattern) {
    return res.status(404).json({
      error: "NotFound",
      message: `Выкройка с ID #${req.params.id} не найдена`,
    });
  }

  return res.json({ pattern });
});

export default router;
