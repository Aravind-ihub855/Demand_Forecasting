const retailPulseService = require("../services/retailPulseService");

exports.getCatalog = async (_req, res) => {
  try {
    const data = await retailPulseService.getCatalog();
    res.json(data);
  } catch (error) {
    console.error("Retail pulse catalog error:", error);
    res.status(500).json({ error: "Failed to load dataset catalog" });
  }
};

exports.getOverview = async (_req, res) => {
  try {
    const data = await retailPulseService.getOverview();
    res.json(data);
  } catch (error) {
    console.error("Retail pulse overview error:", error);
    res.status(500).json({ error: "Failed to load overview" });
  }
};

exports.getFilters = async (_req, res) => {
  try {
    const data = await retailPulseService.getFilters();
    res.json(data);
  } catch (error) {
    console.error("Retail pulse filters error:", error);
    res.status(500).json({ error: "Failed to load filters" });
  }
};

exports.getPhaseComparison = async (_req, res) => {
  try {
    const data = await retailPulseService.getPhaseComparison();
    res.json(data);
  } catch (error) {
    console.error("Retail pulse phase comparison error:", error);
    res.status(500).json({ error: "Failed to load phase comparison" });
  }
};

exports.getMonthlyTrend = async (_req, res) => {
  try {
    const data = await retailPulseService.getMonthlyTrend();
    res.json(data);
  } catch (error) {
    console.error("Retail pulse monthly trend error:", error);
    res.status(500).json({ error: "Failed to load monthly trend" });
  }
};

exports.getStoreBreakdown = async (_req, res) => {
  try {
    const data = await retailPulseService.getStoreBreakdown();
    res.json(data);
  } catch (error) {
    console.error("Retail pulse store breakdown error:", error);
    res.status(500).json({ error: "Failed to load store breakdown" });
  }
};

exports.getCategoryBreakdown = async (_req, res) => {
  try {
    const data = await retailPulseService.getCategoryBreakdown();
    res.json(data);
  } catch (error) {
    console.error("Retail pulse category breakdown error:", error);
    res.status(500).json({ error: "Failed to load category breakdown" });
  }
};

exports.getFestivalSpikeProducts = async (req, res) => {
  try {
    const { festival, year, store_id: storeId, limit = 50 } = req.query;
    if (!festival) {
      return res.status(400).json({ error: "festival is required" });
    }
    if (!year) {
      return res.status(400).json({ error: "year is required" });
    }
    const data = await retailPulseService.getFestivalSpikeProducts({
      festival,
      year,
      storeId,
      limit,
    });
    res.json(data);
  } catch (error) {
    console.error("Retail pulse festival spike products error:", error);
    res.status(500).json({ error: "Failed to load festival spike products" });
  }
};

exports.getFestivalCategorySpikes = async (req, res) => {
  try {
    const { festival, year } = req.query;
    if (!festival) {
      return res.status(400).json({ error: "festival is required" });
    }
    if (!year) {
      return res.status(400).json({ error: "year is required" });
    }
    const data = await retailPulseService.getFestivalCategorySpikes({ festival, year });
    res.json(data);
  } catch (error) {
    console.error("Retail pulse festival category spikes error:", error);
    res.status(500).json({ error: "Failed to load festival category spikes" });
  }
};

exports.getConfidenceReport = async (_req, res) => {
  try {
    const data = await retailPulseService.getConfidenceReport();
    res.json(data);
  } catch (error) {
    console.error("Retail pulse confidence report error:", error);
    res.status(500).json({ error: "Failed to load confidence report" });
  }
};

exports.getDailySalesProducts = async (req, res) => {
  try {
    const { category_id: categoryId } = req.query;
    const products = await retailPulseService.getDailySalesProducts(categoryId);
    res.json({ products });
  } catch (error) {
    console.error("Retail pulse daily sales products error:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to load products" });
  }
};

exports.getDailySales = async (req, res) => {
  try {
    const { sku_id: skuId, year, month, store_id: storeId } = req.query;
    const data = await retailPulseService.getDailySales({
      skuId,
      year,
      month,
      storeId,
    });
    res.json(data);
  } catch (error) {
    console.error("Retail pulse daily sales error:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to load daily sales" });
  }
};

exports.refreshCache = async (_req, res) => {
  try {
    const data = await retailPulseService.rebuildCacheFromDataset();
    res.json({
      message: "Retail pulse cache rebuilt from CSV datasets",
      generatedAt: data.generatedAt,
    });
  } catch (error) {
    console.error("Retail pulse cache refresh error:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to refresh cache" });
  }
};
