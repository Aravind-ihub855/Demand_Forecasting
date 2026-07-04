const path = require("path");
const fs = require("fs");
const csvParser = require("csv-parser");

const connectDb = require("../config/db");
const SalesTransaction = require("../models/SalesTransaction");

function organizedSalesDir() {
  // repo root -> Datasets/Sales_2025_CSV_Organized
  return path.resolve(__dirname, "..", "..", "..", "Datasets", "Sales_2025_CSV_Organized");
}

function toNumber(v) {
  if (v === "" || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toBool(v) {
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

async function importOneCsv(filePath, batchSize = 2000) {
  return new Promise((resolve, reject) => {
    let ops = [];
    let processed = 0;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (r) => {
        const txId = r.transaction_id;
        if (!txId) return;

        const doc = {
          transaction_id: txId,
          invoice_id: r.invoice_id,
          sales_date: r.sales_date,
          sales_timestamp: r.sales_timestamp,
          store_id: r.store_id,
          warehouse_id: r.warehouse_id,
          sku_id: r.sku_id,
          sku_name: r.sku_name,
          category_id: r.category_id,
          category_name: r.category_name,
          supplier_id: r.supplier_id,
          batch_id: r.batch_id,
          quantity_sold: toNumber(r.quantity_sold),
          unit_price: toNumber(r.unit_price),
          selling_price: toNumber(r.selling_price),
          discount_percentage: toNumber(r.discount_percentage),
          discount_amount: toNumber(r.discount_amount),
          total_sales_amount: toNumber(r.total_sales_amount),
          promotion_flag: toBool(r.promotion_flag),
          promotion_type: r.promotion_type,
          festival_flag: toBool(r.festival_flag),
          festival_name: r.festival_name,
          season_name: r.season_name,
          weather_condition: r.weather_condition,
          temperature_celsius: toNumber(r.temperature_celsius),
          competitor_activity_flag: toBool(r.competitor_activity_flag),
          competitor_discount_percentage: toNumber(r.competitor_discount_percentage),
          trend_score: toNumber(r.trend_score),
          customer_footfall: toNumber(r.customer_footfall),
          inventory_on_hand: toNumber(r.inventory_on_hand),
          inventory_state: r.inventory_state,
          stockout_flag: toBool(r.stockout_flag),
          reorder_level: toNumber(r.reorder_level),
          expiry_date: r.expiry_date,
          days_to_expiry: toNumber(r.days_to_expiry),
          payment_mode: r.payment_mode,
          customer_type: r.customer_type,
          sales_channel: r.sales_channel,
          source_system: r.source_system,
          ingestion_timestamp: r.ingestion_timestamp,
        };

        ops.push({
          updateOne: {
            filter: { transaction_id: txId },
            update: { $set: doc },
            upsert: true,
          },
        });

        if (ops.length >= batchSize) {
          SalesTransaction.bulkWrite(ops, { ordered: false }).catch(() => {});
          processed += ops.length;
          ops = [];
        }
      })
      .on("end", async () => {
        try {
          if (ops.length > 0) {
            await SalesTransaction.bulkWrite(ops, { ordered: false });
            processed += ops.length;
          }
          resolve(processed);
        } catch (e) {
          reject(e);
        }
      })
      .on("error", reject);
  });
}

function listCsvFiles(root) {
  const out = [];
  const months = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const m of months) {
    const monthPath = path.join(root, m.name);
    const dates = fs.readdirSync(monthPath, { withFileTypes: true }).filter((d) => d.isDirectory());
    for (const d of dates) {
      const datePath = path.join(monthPath, d.name);
      const files = fs
        .readdirSync(datePath, { withFileTypes: true })
        .filter((f) => f.isFile() && f.name.toLowerCase().endsWith(".csv"))
        .map((f) => path.join(datePath, f.name));
      out.push(...files);
    }
  }
  return out;
}

async function run() {
  await connectDb();

  const root = organizedSalesDir();
  if (!fs.existsSync(root)) {
    throw new Error(`Organized sales CSV folder not found: ${root}`);
  }

  const files = listCsvFiles(root);
  // eslint-disable-next-line no-console
  console.log(`Found ${files.length} sales CSV files under ${root}`);

  let total = 0;
  for (let i = 0; i < files.length; i += 1) {
    const f = files[i];
    // eslint-disable-next-line no-console
    console.log(`Importing (${i + 1}/${files.length}): ${f}`);
    // eslint-disable-next-line no-await-in-loop
    const inserted = await importOneCsv(f);
    total += inserted;
    if ((i + 1) % 50 === 0) {
      // eslint-disable-next-line no-console
      console.log(`Progress: ${i + 1}/${files.length} files, ~${total} upserts`);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Sales import complete. ~${total} upserts`);
  process.exit(0);
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("Sales import failed:", e);
  process.exit(1);
});

