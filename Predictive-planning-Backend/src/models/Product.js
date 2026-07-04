const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sku_id: { type: String, required: true, unique: true, index: true },
    sku_code: { type: String, required: true, index: true },
    sku_name: { type: String, required: true, index: true },
    category_id: { type: String, required: true, index: true },
    subcategory_id: { type: String, required: true, index: true },
    brand: { type: String, required: true, index: true },
    package_size: { type: String, required: true },
    unit_type: { type: String, required: true },
    mrp: { type: Number, required: true },
    selling_price: { type: Number, required: true },
    cost_price: { type: Number, required: true },
    gst_percentage: { type: Number, required: true },
    shelf_life_days: { type: Number, required: true },
    perishable_flag: { type: Boolean, required: true, index: true },
    storage_type: { type: String, required: true, index: true },
    behavior_type: { type: String, required: true, index: true },
    seasonal_flag: { type: Boolean, required: true, index: true },
    festival_relevance: { type: String },
    private_label_flag: { type: Boolean, required: true, index: true },
    supplier_id: { type: String, required: true, index: true },
    reorder_level: { type: Number, required: true },
    reorder_quantity: { type: Number, required: true },
    status: { type: String, required: true, index: true },
    product_margin_percentage: { type: Number },
    weight_grams: { type: Number },
    lead_time_days: { type: Number },
  },
  { timestamps: true }
);

productSchema.index({ category_id: 1, brand: 1 });

module.exports = mongoose.model("Product", productSchema);

