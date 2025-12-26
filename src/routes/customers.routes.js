const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../controllers/customerController");

const router = express.Router();

router.use(requireAuth);

router.get("/", list);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
