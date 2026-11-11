import { Router } from "express";
import { categories, patterns } from "../data/mockData.js";

const router = Router();

/**
 * GET /api/categories
 * Список категорий выкроек с актуальным количеством товаров
 */
router.get("/", (req, res) => {
  const categoriesWithCounts = categories.map((cat) => {
    let count = 0;
    if (cat.id === "all") {
      count = patterns.length;
    } else {
      count = patterns.filter((p) => p.category === cat.id).length;
    }
    return {
      ...cat,
      count: String(count),
    };
  });

  return res.json({
    total: categoriesWithCounts.length,
    items: categoriesWithCounts,
  });
});

export default router;
