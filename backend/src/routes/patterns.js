import { Router } from "express";
import prisma from "../db.js";

const router = Router();

/**
 * GET /api/patterns
 * Возвращает список выкроек из базы данных PostgreSQL
 * Поддерживает фильтрацию:
 *  - ?category=girls-1-6 (по slug категории)
 *  - ?dollId=2 (выкройки, которые подходят конкретной кукле)
 *  - ?search=боди (поиск по названию или описанию)
 */
router.get("/", async (req, res, next) => {
  try {
    const { category, dollId, search } = req.query;

    const where = {};

    const dollConditions = [];
    if (category && category !== "all") {
      dollConditions.push({
        category: {
          slug: String(category),
        },
      });
    }

    if (dollId) {
      const parsedDollId = parseInt(String(dollId), 10);
      if (!isNaN(parsedDollId)) {
        dollConditions.push({
          id: parsedDollId,
        });
      }
    }

    if (dollConditions.length > 0) {
      where.dolls = {
        some: {
          AND: dollConditions,
        },
      };
    }

    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        {
          dolls: {
            some: {
              OR: [
                { nameRu: { contains: q, mode: "insensitive" } },
                { nameEn: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    const patterns = await prisma.pattern.findMany({
      where,
      include: {
        dolls: {
          include: {
            category: true,
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });

    return res.json({
      total: patterns.length,
      items: patterns,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/patterns/featured
 * Возвращает популярные / рекомендуемые выкройки
 */
router.get("/featured", async (req, res, next) => {
  try {
    const POPULAR_IDS = [27, 19, 1, 22, 8, 21, 34, 25];
    const patterns = await prisma.pattern.findMany({
      where: {
        id: { in: POPULAR_IDS },
      },
      include: {
        dolls: {
          include: {
            category: true,
          },
          orderBy: { id: "asc" },
        },
      },
    });

    // Сохраняем исходный порядок популярных выкроек для главной страницы
    const sorted = POPULAR_IDS
      .map((id) => patterns.find((p) => p.id === id))
      .filter(Boolean);

    return res.json({
      total: sorted.length,
      items: sorted,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/patterns/:id
 * Возвращает детальные данные выкройки со списком подходящих кукол
 */
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        error: "InvalidID",
        message: "Некорректный ID выкройки",
      });
    }

    const pattern = await prisma.pattern.findUnique({
      where: { id },
      include: {
        dolls: {
          include: {
            category: true,
          },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!pattern) {
      return res.status(404).json({
        error: "NotFound",
        message: "Выкройка не найдена",
      });
    }

    return res.json(pattern);
  } catch (err) {
    next(err);
  }
});

export default router;
