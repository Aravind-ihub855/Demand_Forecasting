const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    supplier_id: { type: String, required: true, unique: true, index: true },
    supplier_name: { type: String, required: true, index: true },
    supplier_type: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    pincode: { type: String },
    contact_number: { type: String },
    supplied_categories: { type: String }, // pipe-delimited CATxx|CATyy
    lead_time_days: { type: Number, required: true },
    minimum_order_quantity: { type: Number, required: true },
    payment_terms: { type: String, required: true },
    supplier_rating: { type: String, required: true, index: true },
    status: { type: String, required: true, index: true },

    gst_number: { type: String },
    on_time_delivery_percentage: { type: Number },
    defect_rate_percentage: { type: Number },
    average_supply_capacity: { type: Number },
    preferred_supplier_flag: { type: Boolean },
    emergency_supply_support: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);

