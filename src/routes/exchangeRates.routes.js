const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  list,
  create,
  setActive,
} = require("../controllers/exchangeRateController");

const router = express.Router();

router.use(requireAuth);

router.get("/", list);
router.post("/", create);
router.post("/:id/activate", setActive);

module.exports = router;
