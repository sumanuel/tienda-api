const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { getMyOrg, updatePlan } = require("../controllers/orgController");

const router = express.Router();

router.use(requireAuth);

router.get("/me", getMyOrg);

// Simple admin/owner endpoint to change plan (demo). In real life this would be driven by payments.
router.patch("/plan", requireRole(["owner", "admin"]), updatePlan);

module.exports = router;
