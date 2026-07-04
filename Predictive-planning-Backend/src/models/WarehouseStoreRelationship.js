const mongoose = require("mongoose");

const warehouseStoreRelationshipSchema = new mongoose.Schema(
  {
    relationship_id: { type: String, required: true, unique: true, index: true },
    warehouse_id: { type: String, required: true, index: true },
    store_id: { type: String, required: true, index: true },
    primary_supply_flag: { type: Boolean, required: true },
    lead_time_hours: { type: Number, required: true },
    delivery_frequency: { type: String, required: true },
    transport_mode: { type: String, required: true },
    max_daily_capacity: { type: Number, required: true },
    status: { type: String, required: true, index: true },

    backup_warehouse_flag: { type: Boolean },
    average_delivery_delay: { type: Number },
    fuel_cost_estimate: { type: Number },
    preferred_route: { type: String },
    traffic_risk_level: { type: String },
  },
  { timestamps: true }
);

warehouseStoreRelationshipSchema.index({ warehouse_id: 1, store_id: 1 }, { unique: true });

module.exports = mongoose.model(
  "WarehouseStoreRelationship",
  warehouseStoreRelationshipSchema
);

