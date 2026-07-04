const mongoose = require("mongoose");

const analyticsCacheSchema = new mongoose.Schema(
  {
    cache_key: { type: String, required: true, unique: true, index: true },
    cache_type: { type: String, required: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    expires_at: { type: Date, required: true },
  },
  { timestamps: true }
);

analyticsCacheSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AnalyticsCache", analyticsCacheSchema);

