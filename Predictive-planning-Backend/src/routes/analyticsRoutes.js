const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getAnalyticsFilters,
  getExecutiveKpis,
  getStoreSalesTrend,
  getProductSalesTrend,
  getCategorySalesTrend,
  getWarehouseMovementTrend,
  getFestivalPeakTrend,
  getPromotionPeakTrend,
  getDriverContributionTrend,
  getFactorImpact,
  getEffectShare,
  getFeatureCoverage,
  getRealtimeInsights,
  getFestivalPromotionProducts,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/filters", requireAuth, getAnalyticsFilters);
router.get("/kpis", requireAuth, getExecutiveKpis);
router.get("/store-sales-trend", requireAuth, getStoreSalesTrend);
router.get("/product-sales-trend", requireAuth, getProductSalesTrend);
router.get("/category-sales-trend", requireAuth, getCategorySalesTrend);
router.get("/warehouse-movement-trend", requireAuth, getWarehouseMovementTrend);
router.get("/festival-peak-trend", requireAuth, getFestivalPeakTrend);
router.get("/promotion-peak-trend", requireAuth, getPromotionPeakTrend);
router.get("/driver-contribution-trend", requireAuth, getDriverContributionTrend);
router.get("/factor-impact", requireAuth, getFactorImpact);
router.get("/effect-share", requireAuth, getEffectShare);
router.get("/feature-coverage", requireAuth, getFeatureCoverage);
router.get("/insights", requireAuth, getRealtimeInsights);
router.get("/festival-promotion-products", requireAuth, getFestivalPromotionProducts);

module.exports = router;

