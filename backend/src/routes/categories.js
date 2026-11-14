import { Router } from "express";

const router = Router();

/**
 * GET /api/categories
 * Каталог выкроек вынесен на frontend (статический каталог)
 */
router.get("/", (req, res) => {
  return res.json({
    total: 0,
    items: [],
  });
});

export default router;
