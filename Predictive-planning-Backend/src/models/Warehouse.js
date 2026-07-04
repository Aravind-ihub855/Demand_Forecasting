const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    warehouse_id: { type: String, required: true, unique: true, index: true },
    warehouse_code: { type: String, required: true, index: true },
    warehouse_name: { type: String, required: true, index: true },
    warehouse_type: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    area: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    pincode: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    total_capacity_units: { type: Number, required: true },
    cold_storage_available: { type: Boolean, required: true },
    loading_docks: { type: Number, required: true },
    operating_hours: { type: String, required: true },
    manager_name: { type: String },
    status: { type: String, required: true, index: true },
    avg_dispatch_time_hours: { type: Number },
    power_backup_flag: { type: Boolean },
    automation_level: { type: String },
    warehouse_zone: { type: String },
    transport_partners: { type: String },
    security_level: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Warehouse", warehouseSchema);

