const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { list, upsert } = require("../controllers/settingController");

const router = express.Router();

router.use(requireAuth);

router.get("/", list);
router.put("/", upsert);

module.exports = router;
