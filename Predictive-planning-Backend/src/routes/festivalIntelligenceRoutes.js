const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getFestivalIntelligenceFilters,
  getFestivalIntelligenceAnalysis,
} = require("../controllers/festivalIntelligenceController");

const router = express.Router();

router.get("/filters", requireAuth, getFestivalIntelligenceFilters);
router.get("/analyze", requireAuth, getFestivalIntelligenceAnalysis);

module.exports = router;

