const mongoose = require("mongoose");

const warehouseInventorySchema = new mongoose.Schema(
  {
    warehouse_inventory_id: { type: String, required: true, unique: true, index: true },
    warehouse_id: { type: String, required: true, index: true },
    sku_id: { type: String, required: true, index: true },
    batch_id: { type: String, required: true, index: true },
    quantity_on_hand: { type: Number, required: true },
    allocated_quantity: { type: Number, required: true },
    available_quantity: { type: Number, required: true },
    damaged_quantity: { type: Number, required: true },
    inbound_quantity: { type: Number, required: true },
    outbound_quantity: { type: Number, required: true },
    reorder_flag: { type: Boolean, required: true, index: true },
    reorder_level: { type: Number, required: true },
    inventory_status: { type: String, required: true, index: true },
    last_stock_update: { type: String, required: true },
    expiry_date: { type: String },
    storage_zone: { type: String },
  },
  { timestamps: true }
);

warehouseInventorySchema.index({ warehouse_id: 1, sku_id: 1, batch_id: 1 }, { unique: true });
warehouseInventorySchema.index({ warehouse_id: 1, sku_id: 1 });

module.exports = mongoose.model("WarehouseInventory", warehouseInventorySchema);

