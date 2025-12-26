const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  list,
  getById,
  create,
  cancel,
} = require("../controllers/saleController");

const router = express.Router();

router.use(requireAuth);

router.get("/", list);
router.get("/:id", getById);
router.post("/", create);
router.post("/:id/cancel", cancel);

module.exports = router;
