const mongoose = require("mongoose");

const productDistributionSchema = new mongoose.Schema(
  {
    distribution_id: { type: String, required: true, unique: true, index: true },
    sku_id: { type: String, required: true, index: true },
    store_id: { type: String, required: true, index: true },
    demand_priority: { type: String, required: true, index: true },
    assortment_type: { type: String, required: true, index: true },
    min_stock_allocation: { type: Number, required: true },
    max_stock_allocation: { type: Number, required: true },
    preferred_customer_segment: { type: String, required: true },
    active_flag: { type: Boolean, required: true },
    local_preference_score: { type: Number },
    festival_relevance_score: { type: Number },
    climate_relevance: { type: String },
    promotion_priority: { type: String },
  },
  { timestamps: true }
);

productDistributionSchema.index({ sku_id: 1, store_id: 1 }, { unique: true });

module.exports = mongoose.model("ProductDistribution", productDistributionSchema);

