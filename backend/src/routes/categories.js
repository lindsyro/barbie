import { Router } from "express";
import prisma from "../db.js";

const router = Router();

/**
 * GET /api/categories
 * Список категорий выкроек с актуальным количеством товаров из PostgreSQL
 */
router.get("/", async (req, res, next) => {
  try {
    const totalPatternsCount = await prisma.pattern.count();

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { patterns: true },
        },
      },
      orderBy: { id: "asc" },
    });

    const items = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      scale: cat.scale,
      count: String(cat.id === "all" ? totalPatternsCount : cat._count.patterns),
    }));

    return res.json({
      total: items.length,
      items,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
