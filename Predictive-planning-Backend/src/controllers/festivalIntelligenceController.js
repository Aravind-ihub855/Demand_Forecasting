const Store = require("../models/Store");
const Warehouse = require("../models/Warehouse");
const Product = require("../models/Product");
const ProductCategory = require("../models/ProductCategory");
const { analyzeFestivalDemand } = require("../services/festivalDemandService");

exports.getFestivalIntelligenceFilters = async (_req, res) => {
  const [stores, warehouses, products, categories] = await Promise.all([
    Store.find().select("store_id store_name").lean(),
    Warehouse.find().select("warehouse_id warehouse_name").lean(),
    Product.find().select("sku_id sku_name").limit(1000).lean(),
    ProductCategory.find().select("category_id category_name").lean(),
  ]);

  res.json({
    festivals: ["Diwali", "Pongal", "Ramzan", "Christmas", "New Year"],
    stores,
    warehouses,
    products,
    categories,
  });
};

exports.getFestivalIntelligenceAnalysis = async (req, res) => {
  const result = await analyzeFestivalDemand(req.query || {});
  res.json(result);
};

