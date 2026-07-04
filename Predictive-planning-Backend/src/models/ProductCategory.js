const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema(
  {
    category_id: { type: String, required: true, unique: true, index: true },
    category_name: { type: String, required: true, index: true },
    department: { type: String, required: true, index: true },
    storage_requirement: { type: String, required: true },
    perishable_flag: { type: Boolean, required: true, index: true },
    status: { type: String, required: true, index: true },

    category_description: { type: String },
    avg_margin_percentage: { type: Number },
    avg_inventory_turnover: { type: Number },
    seasonality_type: { type: String },
    demand_pattern: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductCategory", productCategorySchema);

