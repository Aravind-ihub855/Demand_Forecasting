const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    store_id: { type: String, required: true, unique: true, index: true },
    store_code: { type: String, required: true, index: true },
    store_name: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    area: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    pincode: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    opening_time: { type: String },
    closing_time: { type: String },
    store_size_sqft: { type: Number },
    warehouse_id: { type: String, required: true, index: true },
    max_storage_capacity: { type: Number },
    avg_daily_customers: { type: Number },
    store_type: { type: String, required: true, index: true },
    status: { type: String, required: true, index: true },

    parking_available: { type: Boolean },
    premium_customer_ratio: { type: Number },
    footfall_peak_hours: { type: String },
    online_delivery_supported: { type: Boolean },
    demographic_profile: { type: String },
    income_segment: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", storeSchema);

