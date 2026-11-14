import { Router } from "express";

const router = Router();

/**
 * GET /api/patterns
 * Каталог выкроек вынесен на frontend (статический каталог)
 */
router.get("/", (req, res) => {
  return res.json({
    total: 0,
    items: [],
  });
});

router.get("/featured", (req, res) => {
  return res.json({
    total: 0,
    items: [],
  });
});

router.get("/:id", (req, res) => {
  return res.status(404).json({
    error: "NotFound",
    message: "Каталог выкроек управляется через frontend",
  });
});

export default router;
