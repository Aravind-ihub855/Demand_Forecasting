require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "",
  nodeEnv: process.env.NODE_ENV || "development",

  jwtSecret: process.env.JWT_SECRET || "default_super_secret_key_dev_only",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "3d",
  jwtIssuer: process.env.JWT_ISSUER || "predictive-planning-backend",
  jwtAudience: process.env.JWT_AUDIENCE || "predictive-planning-client",

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  // clientUrl: process.env.CLIENT_URL || "https://k52vrrsp-5173.inc1.devtunnels.ms/",

  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
};