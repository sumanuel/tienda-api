const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getAll,
  create,
  update,
  remove,
} = require("../controllers/productController");

const router = express.Router();

router.use(requireAuth);

router.get("/", getAll);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
