#!/usr/bin/env node
/**
 * Migration Script: Monthly Sales Summary to MongoDB
 * Reads CSV and imports to salestransactionsmonthly collection
 */

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const SalesTransactionMonthly = require("../src/models/SalesTransactionMonthly");

const inputArg = process.argv[2];
const CSV_PATH = inputArg && (inputArg.includes('/') || inputArg.includes('\\'))
  ? path.resolve(inputArg)  // Full path provided
  : path.join(__dirname, "..", "monthly_sales_generator", "output", inputArg || "monthly_sales_summary_ST003_20260513_095242.csv");

function sanitizeUri(uri) {
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/demand_forecasting";
    console.log(`\n📡 URI: ${sanitizeUri(mongoUri)}`);

    await mongoose.connect(mongoUri);
    const conn = mongoose.connection;

    console.log(`✅ Connected to MongoDB`);
    console.log(`   ├─ Host: ${conn.host}:${conn.port}`);
    console.log(`   ├─ Database: ${conn.db.databaseName}`);
    console.log(`   └─ Collection: ${SalesTransactionMonthly.collection.collectionName}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

async function migrateData() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV file not found: ${CSV_PATH}`);
    console.log("Usage: node migrateMonthlySales.js [csv_filename]");
    process.exit(1);
  }

  const results = [];
  const errors = [];
  let processed = 0;

  console.log(`Reading CSV: ${CSV_PATH}`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (row) => {
        try {
          const doc = {
            month: row.month,
            year: parseInt(row.year),
            sku_id: row.sku_id,
            sku_name: row.sku_name,
            category: row.category,
            subcategory: row.subcategory,
            monthly_units_sold: parseInt(row.monthly_units_sold) || 0,
            avg_daily_sales: parseFloat(row.avg_daily_sales) || 0,
            total_revenue: parseFloat(row.total_revenue) || 0,
            spike_percentage: parseFloat(row.spike_percentage) || 0,
            spike_reason: row.spike_reason || "",
            event_type: row.event_type || "",
            inventory_impact: row.inventory_impact || "",
            demand_trend: row.demand_trend || "",
            festival_effect: row.festival_effect || "None",
            seasonal_effect: row.seasonal_effect || "None",
            promotion_effect: row.promotion_effect || "None",
            weekend_effect: row.weekend_effect || "",
            stockout_days: parseInt(row.stockout_days) || 0,
            lost_sales_units: parseInt(row.lost_sales_units) || 0,
            business_notes: row.business_notes || "",
          };
          results.push(doc);
        } catch (err) {
          errors.push({ row, error: err.message });
        }
      })
      .on("end", async () => {
        console.log(`Parsed ${results.length} rows, ${errors.length} errors`);

        if (errors.length > 0) {
          console.log("Sample errors:", errors.slice(0, 3));
        }

        try {
          const insertResult = await SalesTransactionMonthly.insertMany(results, {
            ordered: false,
            rawResult: true,
          });
          processed = insertResult.insertedCount || results.length;
          console.log(`Inserted ${processed} documents`);
          resolve({ success: true, count: processed, errors: errors.length });
        } catch (err) {
          if (err.writeErrors) {
            console.log(`Inserted with ${err.writeErrors.length} duplicates/ errors`);
            processed = (err.insertedDocs || []).length;
            resolve({ success: true, count: processed, errors: err.writeErrors.length });
          } else {
            reject(err);
          }
        }
      })
      .on("error", (err) => reject(err));
  });
}

async function main() {
  console.log("=".repeat(60));
  console.log("Monthly Sales Migration Script");
  console.log("=".repeat(60));

  await connectDB();
  const conn = mongoose.connection;

  try {
    const stats = await migrateData();
    console.log("\n" + "=".repeat(60));
    console.log("✅ Migration Complete");
    console.log(`   ├─ Destination: ${conn.host}:${conn.port}/${conn.db.databaseName}`);
    console.log(`   ├─ Collection: ${SalesTransactionMonthly.collection.collectionName}`);
    console.log(`   ├─ Documents inserted: ${stats.count}`);
    console.log(`   └─ Errors: ${stats.errors}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

main();
