const mongoose = require("mongoose");

const stockPatternSchema = new mongoose.Schema(
  {
    stock_pattern_id: { type: String, required: true, unique: true, index: true },
    sku_id: { type: String, required: true, unique: true, index: true },
    movement_type: { type: String, required: true, index: true },
    avg_daily_sales: { type: Number, required: true },
    replenishment_frequency_days: { type: Number, required: true },
    demand_variability_score: { type: Number, required: true },
    stockout_risk_level: { type: String, required: true },
    shelf_life_risk: { type: String, required: true },
    lead_time_days: { type: Number, required: true },
    seasonal_peak_months: { type: String },
    weather_sensitivity: { type: String },
    promotion_sensitivity: { type: String },
    markdown_risk: { type: String },
    return_rate_percentage: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockPattern", stockPatternSchema);

