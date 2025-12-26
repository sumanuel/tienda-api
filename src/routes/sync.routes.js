const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { push, pull } = require("../controllers/syncController");

const router = express.Router();

router.use(requireAuth);

router.post("/push", push);
router.get("/pull", pull);

module.exports = router;
