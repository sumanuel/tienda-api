const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  list,
  getById,
  create,
  cancel,
  resolvePending,
} = require("../controllers/saleController");

const router = express.Router();

router.use(requireAuth);

router.get("/", list);
router.get("/:id", getById);
router.post("/", create);
router.post("/:id/resolve", requireRole(["owner", "admin"]), resolvePending);
router.post("/:id/cancel", cancel);

module.exports = router;
