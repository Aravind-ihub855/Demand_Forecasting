const express = require("express");
const router = express.Router();
const monthlyAnalysisController = require("../controllers/monthlyAnalysisController");

// GET /api/monthly-analysis/filters
router.get("/filters", monthlyAnalysisController.getFilters);

// GET /api/monthly-analysis/festival-spike-by-month?year=2024
router.get("/festival-spike-by-month", monthlyAnalysisController.getFestivalSpikeByMonth);

// GET /api/monthly-analysis/product-spike-by-month?month=January&year=2024
router.get("/product-spike-by-month", monthlyAnalysisController.getProductSpikeByMonth);

// GET /api/monthly-analysis/product-spike-by-festival?festival=Diwali&year=2024
router.get("/product-spike-by-festival", monthlyAnalysisController.getProductSpikeByFestival);

module.exports = router;
