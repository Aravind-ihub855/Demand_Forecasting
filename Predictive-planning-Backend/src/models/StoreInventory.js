const mongoose = require("mongoose");

const storeInventorySchema = new mongoose.Schema(
  {
    store_inventory_id: { type: String, required: true, unique: true, index: true },
    store_id: { type: String, required: true, index: true },
    sku_id: { type: String, required: true, index: true },
    batch_id: { type: String, required: true, index: true },
    quantity_on_hand: { type: Number, required: true },
    reserved_quantity: { type: Number, required: true },
    available_quantity: { type: Number, required: true },
    damaged_quantity: { type: Number, required: true },
    expired_quantity: { type: Number, required: true },
    inventory_status: { type: String, required: true, index: true },
    reorder_flag: { type: Boolean, required: true, index: true },
    reorder_level: { type: Number, required: true },
    last_restocked_date: { type: String },
    last_stock_update: { type: String },
    expiry_date: { type: String },
    storage_zone: { type: String },
  },
  { timestamps: true }
);

storeInventorySchema.index({ store_id: 1, sku_id: 1, batch_id: 1 }, { unique: true });
storeInventorySchema.index({ store_id: 1, sku_id: 1 });

module.exports = mongoose.model("StoreInventory", storeInventorySchema);

