import { Router } from "express";
import { carts, patterns } from "../data/mockData.js";
import { getContextId } from "../middleware/auth.js";

const router = Router();

function getCartForContext(contextId) {
  if (!carts.has(contextId)) {
    carts.set(contextId, []);
  }
  return carts.get(contextId);
}

function formatCart(items) {
  let totalPrice = 0;
  const enrichedItems = [];

  for (const item of items) {
    const pattern = patterns.find((p) => p.id === item.patternId);
    if (pattern) {
      totalPrice += pattern.price;
      enrichedItems.push({
        patternId: pattern.id,
        title: pattern.title,
        doll: pattern.doll,
        price: pattern.price,
        image: pattern.image,
        format: pattern.format || "PDF (A4 + инструкции)",
        addedAt: item.addedAt,
      });
    }
  }

  return {
    itemsCount: enrichedItems.length,
    totalPrice,
    items: enrichedItems,
  };
}

/**
 * GET /api/cart
 * Получение текущей корзины пользователя
 */
router.get("/", (req, res) => {
  const contextId = getContextId(req);
  if (!contextId) {
    return res.json({
      itemsCount: 0,
      totalPrice: 0,
      items: [],
    });
  }

  const items = getCartForContext(contextId);
  return res.json(formatCart(items));
});

/**
 * POST /api/cart
 * Добавление выкройки в корзину (цифровой товар, 1 экземпляр)
 * Body: { patternId }
 */
router.post("/", (req, res) => {
  const contextId = getContextId(req);
  if (!contextId) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Для добавления в корзину требуется авторизация или гостевая сессия",
    });
  }

  const { patternId } = req.body || {};
  const numId = Number(patternId);

  const pattern = patterns.find((p) => p.id === numId);
  if (!pattern) {
    return res.status(404).json({
      error: "NotFound",
      message: "Выкройка не найдена в каталоге",
    });
  }

  const cart = getCartForContext(contextId);
  const alreadyInCart = cart.some((it) => it.patternId === numId);

  if (alreadyInCart) {
    return res.status(200).json({
      alreadyInCart: true,
      message: `Выкройка «${pattern.title}» уже есть в вашей корзине`,
      cart: formatCart(cart),
    });
  }

  cart.push({
    patternId: numId,
    addedAt: new Date().toISOString(),
  });

  return res.status(201).json({
    alreadyInCart: false,
    message: `«${pattern.title}» добавлена в корзину`,
    cart: formatCart(cart),
  });
});

/**
 * PATCH /api/cart/:patternId
 * Поскольку товар цифровой, изменение количества не применимо
 */
router.patch("/:patternId", (req, res) => {
  return res.status(400).json({
    error: "NotApplicable",
    message: "Выкройка является цифровым товаром и оформляется в одном экземпляре",
  });
});

/**
 * DELETE /api/cart/:patternId
 * Удаление товара из корзины
 */
router.delete("/:patternId", (req, res) => {
  const contextId = getContextId(req);
  if (!contextId) {
    return res.status(401).json({ error: "Unauthorized", message: "Требуется авторизация" });
  }

  const numId = Number(req.params.patternId);
  const cart = getCartForContext(contextId);
  const itemIndex = cart.findIndex((it) => it.patternId === numId);

  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
  }

  return res.json({
    message: "Товар удален из корзины",
    cart: formatCart(cart),
  });
});

/**
 * DELETE /api/cart
 * Полная очистка корзины
 */
router.delete("/", (req, res) => {
  const contextId = getContextId(req);
  if (contextId) {
    carts.set(contextId, []);
  }

  return res.json({
    message: "Корзина очищена",
    cart: { itemsCount: 0, totalPrice: 0, items: [] },
  });
});

export default router;
