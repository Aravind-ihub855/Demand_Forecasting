const mongoose = require("mongoose");

const productCategoryDistributionSchema = new mongoose.Schema(
  {
    distribution_id: { type: String, required: true, unique: true, index: true },
    category_id: { type: String, required: true, index: true },
    expected_sku_count: { type: Number, required: true },
    demand_priority: { type: String, required: true, index: true },
    storage_share_percentage: { type: Number, required: true },

    avg_sales_share_percentage: { type: Number },
    avg_profit_share: { type: Number },
    seasonal_weight: { type: Number },
    promotion_frequency: { type: String },
  },
  { timestamps: true }
);

productCategoryDistributionSchema.index({ category_id: 1 });

module.exports = mongoose.model(
  "ProductCategoryDistribution",
  productCategoryDistributionSchema
);

