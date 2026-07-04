const mongoose = require("mongoose");

const salesTransactionSchema = new mongoose.Schema(
  {
    transaction_id: { type: String, required: true, unique: true, index: true },
    invoice_id: { type: String, required: true, index: true },
    sales_date: { type: String, required: true, index: true }, // YYYY-MM-DD
    sales_timestamp: { type: String, required: true, index: true }, // ISO string
    store_id: { type: String, required: true, index: true },
    warehouse_id: { type: String, required: true, index: true },
    sku_id: { type: String, required: true, index: true },
    sku_name: { type: String, required: true },
    category_id: { type: String, required: true, index: true },
    category_name: { type: String, required: true },
    supplier_id: { type: String, required: true, index: true },
    batch_id: { type: String, required: true, index: true },
    quantity_sold: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    selling_price: { type: Number, required: true },
    discount_percentage: { type: Number, required: true },
    discount_amount: { type: Number, required: true },
    total_sales_amount: { type: Number, required: true },
    promotion_flag: { type: Boolean, required: true, index: true },
    promotion_type: { type: String },
    festival_flag: { type: Boolean, required: true, index: true },
    festival_name: { type: String },
    season_name: { type: String, required: true, index: true },
    weather_condition: { type: String, required: true, index: true },
    temperature_celsius: { type: Number, required: true },
    competitor_activity_flag: { type: Boolean, required: true, index: true },
    competitor_discount_percentage: { type: Number, required: true },
    trend_score: { type: Number, required: true },
    customer_footfall: { type: Number, required: true },
    inventory_on_hand: { type: Number, required: true },
    inventory_state: { type: String, required: true, index: true },
    stockout_flag: { type: Boolean, required: true, index: true },
    reorder_level: { type: Number, required: true },
    expiry_date: { type: String },
    days_to_expiry: { type: Number, required: true },
    payment_mode: { type: String, required: true, index: true },
    customer_type: { type: String, required: true, index: true },
    sales_channel: { type: String, required: true, index: true },
    source_system: { type: String, required: true, index: true },
    ingestion_timestamp: { type: String, required: true },
  },
  { timestamps: true }
);

salesTransactionSchema.index({ sales_date: 1, store_id: 1, sku_id: 1 });
salesTransactionSchema.index({ store_id: 1, sales_timestamp: 1 });

module.exports = mongoose.model("SalesTransaction", salesTransactionSchema);

