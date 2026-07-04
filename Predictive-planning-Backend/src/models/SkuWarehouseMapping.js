const mongoose = require("mongoose");

const skuWarehouseMappingSchema = new mongoose.Schema(
  {
    sku_warehouse_mapping_id: { type: String, required: true, unique: true, index: true },
    sku_id: { type: String, required: true, index: true },
    warehouse_id: { type: String, required: true, index: true },
    storage_priority: { type: String, required: true },
    max_storage_quantity: { type: Number, required: true },
    min_storage_quantity: { type: Number, required: true },
    preferred_storage_zone: { type: String, required: true },
    replenishment_source: { type: String, required: true },
    active_flag: { type: Boolean, required: true },
    regional_demand_score: { type: Number },
    procurement_priority: { type: String },
    storage_cost_per_unit: { type: Number },
    emergency_stock_flag: { type: Boolean },
  },
  { timestamps: true }
);

skuWarehouseMappingSchema.index({ sku_id: 1, warehouse_id: 1 }, { unique: true });

module.exports = mongoose.model("SkuWarehouseMapping", skuWarehouseMappingSchema);

