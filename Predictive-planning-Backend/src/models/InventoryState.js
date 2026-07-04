const mongoose = require("mongoose");

const inventoryStateSchema = new mongoose.Schema(
  {
    inventory_state_id: { type: String, required: true, unique: true, index: true },
    state_name: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    severity_level: { type: String, required: true, index: true },
    replenishment_required: { type: Boolean, required: true },
    sellable_flag: { type: Boolean, required: true },

    auto_alert_flag: { type: Boolean },
    dashboard_color_code: { type: String },
    escalation_required: { type: Boolean },
    warehouse_action_required: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryState", inventoryStateSchema);

