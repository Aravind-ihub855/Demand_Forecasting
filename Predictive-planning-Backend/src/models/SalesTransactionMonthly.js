const mongoose = require("mongoose");

const salesTransactionMonthlySchema = new mongoose.Schema(
  {
    month: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },
    sku_id: { type: String, required: true, index: true },
    sku_name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, required: true, index: true },
    monthly_units_sold: { type: Number, required: true, default: 0 },
    avg_daily_sales: { type: Number, required: true, default: 0 },
    total_revenue: { type: Number, required: true, default: 0 },
    spike_percentage: { type: Number, required: true, default: 0 },
    spike_reason: { type: String, required: true },
    event_type: { type: String, required: true, index: true },
    inventory_impact: { type: String, required: true },
    demand_trend: { type: String, required: true, index: true },
    festival_effect: { type: String, default: "None" },
    seasonal_effect: { type: String, default: "None" },
    promotion_effect: { type: String, default: "None" },
    weekend_effect: { type: String, required: true },
    stockout_days: { type: Number, required: true, default: 0 },
    lost_sales_units: { type: Number, required: true, default: 0 },
    business_notes: { type: String },
  },
  { timestamps: true }
);

salesTransactionMonthlySchema.index({ year: 1, month: 1, sku_id: 1 }, { unique: true });
salesTransactionMonthlySchema.index({ category: 1, year: 1, month: 1 });
salesTransactionMonthlySchema.index({ event_type: 1, year: 1, month: 1 });
salesTransactionMonthlySchema.index({ demand_trend: 1 });

module.exports = mongoose.model("SalesTransactionMonthly", salesTransactionMonthlySchema);
