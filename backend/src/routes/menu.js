import { Router } from "express";
import prisma from "../db.js";

const router = Router();

/**
 * GET /api/menu
 * Возвращает список пунктов меню (по умолчанию только видимые, отсортированные по order)
 * Query: ?all=true — возвращает все пункты, включая скрытые (для админ-панели)
 */
router.get("/", async (req, res, next) => {
  try {
    const showAll = req.query.all === "true";

    const items = await prisma.menuItem.findMany({
      where: showAll ? {} : { isVisible: true },
      orderBy: { order: "asc" },
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
 * POST /api/menu
 * Создание нового пункта меню (для админ-панели)
 */
router.post("/", async (req, res, next) => {
  try {
    const { title, url, order, target, isVisible, isDynamic } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Поле title обязательно" });
    }
    if (!url || typeof url !== "string" || !url.trim()) {
      return res.status(400).json({ error: "Поле url обязательно" });
    }

    let itemOrder = Number(order);
    if (isNaN(itemOrder)) {
      const lastItem = await prisma.menuItem.findFirst({
        orderBy: { order: "desc" },
      });
      itemOrder = (lastItem?.order ?? 0) + 1;
    }

    const newItem = await prisma.menuItem.create({
      data: {
        title: title.trim(),
        url: url.trim(),
        order: itemOrder,
        target: target?.trim() || "_self",
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
        isDynamic: isDynamic !== undefined ? Boolean(isDynamic) : false,
      },
    });

    return res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/menu/reorder
 * Массовое обновление порядка пунктов меню
 */
router.put("/reorder", async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Поле items должно быть массивом { id, order }" });
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.menuItem.update({
          where: { id: Number(item.id) },
          data: { order: Number(item.order) },
        })
      )
    );

    const updatedItems = await prisma.menuItem.findMany({
      orderBy: { order: "asc" },
    });

    return res.json({
      total: updatedItems.length,
      items: updatedItems,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/menu/:id
 * Редактирование пункта меню
 */
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Некорректный ID пункта меню" });
    }

    const { title, url, order, target, isVisible, isDynamic } = req.body;

    const data = {};
    if (title !== undefined) data.title = String(title).trim();
    if (url !== undefined) data.url = String(url).trim();
    if (order !== undefined) data.order = Number(order);
    if (target !== undefined) data.target = String(target).trim();
    if (isVisible !== undefined) data.isVisible = Boolean(isVisible);
    if (isDynamic !== undefined) data.isDynamic = Boolean(isDynamic);

    const updated = await prisma.menuItem.update({
      where: { id },
      data,
    });

    return res.json(updated);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Пункт меню не найден" });
    }
    next(err);
  }
});

/**
 * DELETE /api/menu/:id
 * Удаление пункта меню
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Некорректный ID пункта меню" });
    }

    await prisma.menuItem.delete({
      where: { id },
    });

    return res.json({ success: true, message: `Пункт меню с ID ${id} удален` });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Пункт меню не найден" });
    }
    next(err);
  }
});

export default router;
