const express = require("express");
const retailPulseController = require("../controllers/retailPulseController");

const router = express.Router();

router.get("/catalog", retailPulseController.getCatalog);
router.get("/overview", retailPulseController.getOverview);
router.get("/filters", retailPulseController.getFilters);
router.get("/phase-comparison", retailPulseController.getPhaseComparison);
router.get("/monthly-trend", retailPulseController.getMonthlyTrend);
router.get("/store-breakdown", retailPulseController.getStoreBreakdown);
router.get("/category-breakdown", retailPulseController.getCategoryBreakdown);
router.get("/festival-spike-products", retailPulseController.getFestivalSpikeProducts);
router.get("/festival-category-spikes", retailPulseController.getFestivalCategorySpikes);
router.get("/confidence-report", retailPulseController.getConfidenceReport);
router.get("/daily-sales/products", retailPulseController.getDailySalesProducts);
router.get("/daily-sales", retailPulseController.getDailySales);
router.post("/refresh-cache", retailPulseController.refreshCache);

module.exports = router;
