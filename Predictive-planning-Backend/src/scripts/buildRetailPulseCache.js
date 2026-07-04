/**
 * Pre-aggregates Demand_forecasting dataset into retailPulseCache.json
 * Run: node src/scripts/buildRetailPulseCache.js
 */
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");

const DATASET_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "Demand_forecasting dataset"
);
const CACHE_PATH = path.resolve(__dirname, "..", "data", "retailPulseCache.json");
const DAILY_SALES_CACHE_PATH = path.resolve(__dirname, "..", "data", "dailySalesCache.json");

const DATASET_META = {
  "dim_date_calendar.csv": {
    type: "dimension",
    label: "Date Calendar",
    description: "Daily calendar with festivals, seasons, weekends, and demand multipliers",
  },
  "dim_product_category.csv": {
    type: "dimension",
    label: "Product Categories",
    description: "Category master with shelf life, elasticity, and festival affinity",
  },
  "dim_sku_master.csv": {
    type: "dimension",
    label: "SKU Master",
    description: "500 SKUs with pricing, lead times, safety stock, and demand baselines",
  },
  "dim_store_master.csv": {
    type: "dimension",
    label: "Store Master",
    description: "5 D-Mart Coimbatore stores with demographics and warehouse mapping",
  },
  "dim_supplier_master.csv": {
    type: "dimension",
    label: "Supplier Master",
    description: "Supplier reliability, fill rates, and risk scores",
  },
  "dim_vehicle_master.csv": {
    type: "dimension",
    label: "Vehicle Fleet",
    description: "Warehouse delivery fleet capacity and drivers",
  },
  "dim_warehouse_master.csv": {
    type: "dimension",
    label: "Warehouse Master",
    description: "North & South distribution centers serving store clusters",
  },
  "ext_competitor_events.csv": {
    type: "external",
    label: "Competitor Events",
    description: "Local competitor promotions and estimated demand impact",
  },
  "ext_festival_calendar.csv": {
    type: "external",
    label: "Festival Calendar",
    description: "Festival dates, demand multipliers, and affected categories",
  },
  "ext_trend_signals.csv": {
    type: "external",
    label: "Trend Signals",
    description: "Weekly consumer trend scores mapped to product categories",
  },
  "ext_weather_data.csv": {
    type: "external",
    label: "Weather Data",
    description: "Daily weather with category-specific demand indices",
  },
  "fact_basket_transactions.csv": {
    type: "fact",
    label: "Basket Transactions",
    description: "Line-item basket transactions for market-basket analysis",
  },
  "fact_daily_sales.csv": {
    type: "fact",
    label: "Daily Sales",
    description: "Primary sales fact — store × SKU × day with demand decomposition",
  },
  "fact_expiry_tracking.csv": {
    type: "fact",
    label: "Expiry Tracking",
    description: "Perishable batch expiry, disposal, and waste value",
  },
  "fact_hourly_sales.csv": {
    type: "fact",
    label: "Hourly Sales",
    description: "Intraday sales granularity for staffing and replenishment",
  },
  "fact_inventory_snapshot.csv": {
    type: "fact",
    label: "Inventory Snapshots",
    description: "Daily on-hand stock, days of supply, and stockout flags",
  },
  "fact_logistics_trips.csv": {
    type: "fact",
    label: "Logistics Trips",
    description: "Warehouse-to-store delivery trips with utilization metrics",
  },
  "fact_price_history.csv": {
    type: "fact",
    label: "Price History",
    description: "SKU price changes with elasticity impact estimates",
  },
  "fact_promotions.csv": {
    type: "fact",
    label: "Promotions",
    description: "Promotional campaigns with predicted vs actual demand lift",
  },
  "fact_replenishment_orders.csv": {
    type: "fact",
    label: "Replenishment Orders",
    description: "Store replenishment POs triggered by reorder-point breaches",
  },
  "fact_returns.csv": {
    type: "fact",
    label: "Returns",
    description: "Customer returns with reasons and refund values",
  },
  "fact_stock_transfers.csv": {
    type: "fact",
    label: "Stock Transfers",
    description: "Inter-warehouse emergency stock transfers",
  },
  "fact_store_footfall.csv": {
    type: "fact",
    label: "Store Footfall",
    description: "Daily store traffic with conversion rates",
  },
  "fact_supplier_deliveries.csv": {
    type: "fact",
    label: "Supplier Deliveries",
    description: "Supplier-to-warehouse delivery performance",
  },
};

function streamCsv(filePath, onRow) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      resolve(0);
      return;
    }
    let count = 0;
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        count += 1;
        onRow(row, count);
      })
      .on("end", () => resolve(count))
      .on("error", reject);
  });
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(String(value).slice(0, 10));
  return Number.isNaN(d.getTime()) ? null : d;
}

async function buildDatasetCatalog() {
  const catalog = [];

  for (const [fileName, meta] of Object.entries(DATASET_META)) {
    const filePath = path.join(DATASET_DIR, fileName);
    if (!fs.existsSync(filePath)) continue;

    const stat = fs.statSync(filePath);
    let rowCount = 0;
    let columns = [];
    let dateMin = null;
    let dateMax = null;

    await streamCsv(filePath, (row) => {
      if (!columns.length) columns = Object.keys(row);
      for (const [key, value] of Object.entries(row)) {
        if (!key.toLowerCase().includes("date") && key !== "date") continue;
        const d = parseDate(value);
        if (!d) continue;
        if (!dateMin || d < dateMin) dateMin = d;
        if (!dateMax || d > dateMax) dateMax = d;
      }
    }).then((n) => {
      rowCount = n;
    });

    catalog.push({
      fileName,
      tableName: fileName.replace(".csv", ""),
      ...meta,
      rowCount,
      columnCount: columns.length,
      columns,
      sizeMb: Number((stat.size / 1024 / 1024).toFixed(2)),
      dateRange:
        dateMin && dateMax
          ? {
              from: dateMin.toISOString().slice(0, 10),
              to: dateMax.toISOString().slice(0, 10),
            }
          : null,
    });
  }

  return catalog.sort((a, b) => a.type.localeCompare(b.type) || a.fileName.localeCompare(b.fileName));
}

async function buildSalesAggregates() {
  const skuMaster = new Map();
  const categoryMaster = new Map();
  const storeMaster = new Map();

  await streamCsv(path.join(DATASET_DIR, "dim_sku_master.csv"), (row) => {
    skuMaster.set(row.sku_id, {
      skuId: row.sku_id,
      productName: row.product_name,
      categoryId: row.category_id,
      categoryName: row.category_name,
      brand: row.brand,
      isPerishable: row.is_perishable === "True",
    });
  });

  await streamCsv(path.join(DATASET_DIR, "dim_product_category.csv"), (row) => {
    categoryMaster.set(row.category_id, {
      categoryId: row.category_id,
      categoryName: row.category_name,
      festivalAffinity: row.festival_affinity,
      isPerishable: row.is_perishable === "True",
    });
  });

  await streamCsv(path.join(DATASET_DIR, "dim_store_master.csv"), (row) => {
    storeMaster.set(row.store_id, {
      storeId: row.store_id,
      storeName: row.store_name,
      storeType: row.store_type,
      location: row.location,
    });
  });

  const festivals = new Set();
  const years = new Set();
  const stores = new Set();
  const categories = new Set();

  let totalUnits = 0;
  let totalRevenue = 0;
  let stockouts = 0;
  let lostSales = 0;
  let recordCount = 0;
  let dateMin = null;
  let dateMax = null;

  const phaseStats = {
    normal: { units: 0, records: 0, revenue: 0 },
    pre_festival: { units: 0, records: 0, revenue: 0 },
    festival_day: { units: 0, records: 0, revenue: 0 },
    post_festival: { units: 0, records: 0, revenue: 0 },
  };

  const storeTotals = new Map();
  const categoryTotals = new Map();
  const monthlyTrend = new Map();

  // skuKey = sku|store|festival for spike analysis
  const skuSpike = new Map();
  const dailySalesIndex = new Map();

  function bumpDaily(key, day, units, revenue, festivalName, festivalPhase, season) {
    if (!dailySalesIndex.has(key)) dailySalesIndex.set(key, new Map());
    const days = dailySalesIndex.get(key);
    if (!days.has(day)) {
      days.set(day, {
        u: 0,
        r: 0,
        fn: festivalName && festivalName !== "None" ? festivalName : "None",
        fp: festivalPhase || "normal",
        s: season || "Normal",
      });
    }
    const entry = days.get(day);
    entry.u += units;
    entry.r += Math.round(revenue);
  }

  function bumpSpike(key, phase, units) {
    if (!skuSpike.has(key)) {
      skuSpike.set(key, {
        normal: { units: 0, count: 0 },
        festival: { units: 0, count: 0 },
      });
    }
    const bucket = skuSpike.get(key);
    const isFestivalPhase =
      phase === "festival_day" || phase === "pre_festival" || phase === "post_festival";
    if (phase === "normal") {
      bucket.normal.units += units;
      bucket.normal.count += 1;
    } else if (isFestivalPhase) {
      bucket.festival.units += units;
      bucket.festival.count += 1;
    }
  }

  await streamCsv(path.join(DATASET_DIR, "fact_daily_sales.csv"), (row) => {
    recordCount += 1;
    const units = Number(row.units_sold) || 0;
    const revenue = Number(row.revenue_inr) || 0;
    const phase = row.festival_phase || "normal";
    const festival = row.festival_name && row.festival_name !== "None" ? row.festival_name : null;
    const storeId = row.store_id;
    const skuId = row.sku_id;
    const categoryId = row.category_id;
    const saleDate = row.sale_date;
    const year = saleDate ? saleDate.slice(0, 4) : null;
    const month = saleDate ? saleDate.slice(0, 7) : null;
    const monthNum = saleDate ? saleDate.slice(5, 7) : null;
    const dayNum = saleDate ? saleDate.slice(8, 10) : null;

    totalUnits += units;
    totalRevenue += revenue;
    stockouts += Number(row.stockout_flag) || 0;
    lostSales += Number(row.lost_sales_units) || 0;

    const d = parseDate(saleDate);
    if (d) {
      if (!dateMin || d < dateMin) dateMin = d;
      if (!dateMax || d > dateMax) dateMax = d;
    }

    if (year) years.add(year);
    if (storeId) stores.add(storeId);
    if (categoryId) categories.add(categoryId);
    if (festival) festivals.add(festival);

    if (phaseStats[phase]) {
      phaseStats[phase].units += units;
      phaseStats[phase].records += 1;
      phaseStats[phase].revenue += revenue;
    }

    if (storeId) {
      const s = storeTotals.get(storeId) || { units: 0, revenue: 0, stockouts: 0 };
      s.units += units;
      s.revenue += revenue;
      s.stockouts += Number(row.stockout_flag) || 0;
      storeTotals.set(storeId, s);
    }

    if (categoryId) {
      const c = categoryTotals.get(categoryId) || { units: 0, revenue: 0 };
      c.units += units;
      c.revenue += revenue;
      categoryTotals.set(categoryId, c);
    }

    if (month) {
      const m = monthlyTrend.get(month) || {
        month,
        normalUnits: 0,
        festivalUnits: 0,
        totalUnits: 0,
        totalRevenue: 0,
      };
      m.totalUnits += units;
      m.totalRevenue += revenue;
      if (phase === "normal") m.normalUnits += units;
      else m.festivalUnits += units;
      monthlyTrend.set(month, m);
    }

    if (year && skuId && storeId) {
      if (phase === "normal") {
        bumpSpike(`${year}|${skuId}|${storeId}|__baseline__`, phase, units);
        bumpSpike(`${year}|${skuId}|__ALL__|__baseline__`, phase, units);
      } else if (
        festival &&
        (phase === "pre_festival" || phase === "festival_day" || phase === "post_festival")
      ) {
        bumpSpike(`${year}|${skuId}|${storeId}|${festival}`, phase, units);
        bumpSpike(`${year}|${skuId}|__ALL__|${festival}`, phase, units);
      }
    }

    if (year && monthNum && dayNum && skuId) {
      const ym = `${year}-${monthNum}`;
      bumpDaily(
        `${ym}-${skuId}`,
        dayNum,
        units,
        revenue,
        row.festival_name,
        row.festival_phase,
        row.season
      );
    }
  });

  // Build per-year, per-festival product spikes from daily sales (fact_daily_sales)
  const baseline = new Map();
  for (const [key, val] of skuSpike.entries()) {
    if (!key.endsWith("|__baseline__")) continue;
    const baseKey = key.replace("|__baseline__", "");
    const avg = val.normal.count ? val.normal.units / val.normal.count : 0;
    baseline.set(baseKey, { avg, dayCount: val.normal.count });
  }

  const festivalProductSpikesByYear = {};

  for (const [key, val] of skuSpike.entries()) {
    if (key.includes("__baseline__")) continue;
    const parts = key.split("|");
    if (parts.length < 4) continue;

    const year = parts[0];
    const skuId = parts[1];
    const storeId = parts[2];
    const festival = parts[3];
    const baseKey = `${year}|${skuId}|${storeId}`;
    const baselineEntry = baseline.get(baseKey) || { avg: 0, dayCount: 0 };
    const normalAvg = baselineEntry.avg;
    const festivalAvg = val.festival.count ? val.festival.units / val.festival.count : 0;
    if (festivalAvg <= 0) continue;

    const spikeRatio = normalAvg > 0 ? festivalAvg / normalAvg : festivalAvg > 0 ? 2 : 1;
    const spikePct = Number(((spikeRatio - 1) * 100).toFixed(1));
    if (spikePct <= 0) continue;

    const sku = skuMaster.get(skuId) || { productName: skuId, categoryName: "Unknown" };
    const store =
      storeId === "__ALL__"
        ? { storeId: "__ALL__", storeName: "All Stores (aggregated)" }
        : storeMaster.get(storeId) || { storeName: storeId };

    if (!festivalProductSpikesByYear[year]) festivalProductSpikesByYear[year] = {};
    if (!festivalProductSpikesByYear[year][festival]) {
      festivalProductSpikesByYear[year][festival] = [];
    }

    festivalProductSpikesByYear[year][festival].push({
      skuId,
      productName: sku.productName,
      categoryId: sku.categoryId,
      categoryName: sku.categoryName,
      brand: sku.brand,
      storeId,
      storeName: store.storeName,
      year: Number(year),
      normalAvg: Number(normalAvg.toFixed(1)),
      festivalAvg: Number(festivalAvg.toFixed(1)),
      spikeRatio: Number(spikeRatio.toFixed(2)),
      spikePct,
      festivalUnits: val.festival.units,
      normalDayCount: baselineEntry.dayCount,
      festivalDayCount: val.festival.count,
      dataSource: "fact_daily_sales",
    });
  }

  const festivalSpikeProducts = {};
  for (const [year, festivals] of Object.entries(festivalProductSpikesByYear)) {
    festivalSpikeProducts[year] = {};
    for (const [festival, products] of Object.entries(festivals)) {
      festivalSpikeProducts[year][festival] = products
        .sort((a, b) => b.spikePct - a.spikePct)
        .slice(0, 100);
    }
  }

  // Category spikes per festival per year
  const festivalCategorySpikes = {};
  for (const [year, festivals] of Object.entries(festivalSpikeProducts)) {
    festivalCategorySpikes[year] = {};
    for (const [festival, products] of Object.entries(festivals)) {
      const catMap = new Map();
      for (const p of products) {
        const c = catMap.get(p.categoryId) || {
          units: 0,
          spikeSum: 0,
          count: 0,
          categoryName: p.categoryName,
        };
        c.units += p.festivalUnits;
        c.spikeSum += p.spikePct;
        c.count += 1;
        catMap.set(p.categoryId, c);
      }
      festivalCategorySpikes[year][festival] = [...catMap.entries()]
        .map(([categoryId, v]) => ({
          categoryId,
          categoryName: v.categoryName,
          festivalUnits: v.units,
          avgSpikePct: Number((v.spikeSum / v.count).toFixed(1)),
          productCount: v.count,
        }))
        .sort((a, b) => b.avgSpikePct - a.avgSpikePct);
    }
  }

  const phaseComparison = Object.entries(phaseStats).map(([phase, v]) => ({
    phase,
    label: phase.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    totalUnits: v.units,
    avgUnitsPerRecord: v.records ? Number((v.units / v.records).toFixed(1)) : 0,
    totalRevenue: Number(v.revenue.toFixed(0)),
    recordCount: v.records,
    sharePct: totalUnits ? Number(((v.units / totalUnits) * 100).toFixed(1)) : 0,
  }));

  const normalAvg = phaseStats.normal.records
    ? phaseStats.normal.units / phaseStats.normal.records
    : 0;
  const festivalDayAvg = phaseStats.festival_day.records
    ? phaseStats.festival_day.units / phaseStats.festival_day.records
    : 0;

  return {
    overview: {
      recordCount,
      totalUnits,
      totalRevenue: Number(totalRevenue.toFixed(0)),
      stockoutRate: recordCount ? Number(((stockouts / recordCount) * 100).toFixed(2)) : 0,
      stockoutCount: stockouts,
      lostSalesUnits: Number(lostSales.toFixed(0)),
      activeSkus: skuMaster.size,
      activeStores: storeMaster.size,
      dateRange: {
        from: dateMin ? dateMin.toISOString().slice(0, 10) : null,
        to: dateMax ? dateMax.toISOString().slice(0, 10) : null,
      },
      normalAvgUnits: Number(normalAvg.toFixed(1)),
      festivalDayAvgUnits: Number(festivalDayAvg.toFixed(1)),
      festivalUpliftPct: normalAvg
        ? Number((((festivalDayAvg - normalAvg) / normalAvg) * 100).toFixed(1))
        : 0,
      coveragePct: Number(((recordCount / (1096 * 5 * 500)) * 100).toFixed(1)),
    },
    filters: {
      years: [...years].sort(),
      festivals: [...festivals].sort(),
      stores: [...stores].map((id) => ({
        storeId: id,
        ...(storeMaster.get(id) || { storeName: id }),
      })),
      categories: [...categories].map((id) => ({
        categoryId: id,
        ...(categoryMaster.get(id) || { categoryName: id }),
      })),
    },
    phaseComparison,
    monthlyTrend: [...monthlyTrend.values()].sort((a, b) => a.month.localeCompare(b.month)),
    storeBreakdown: [...storeTotals.entries()].map(([storeId, v]) => ({
      storeId,
      ...(storeMaster.get(storeId) || { storeName: storeId }),
      units: v.units,
      revenue: Number(v.revenue.toFixed(0)),
      stockouts: v.stockouts,
    })),
    categoryBreakdown: [...categoryTotals.entries()]
      .map(([categoryId, v]) => ({
        categoryId,
        ...(categoryMaster.get(categoryId) || { categoryName: categoryId }),
        units: v.units,
        revenue: Number(v.revenue.toFixed(0)),
      }))
      .sort((a, b) => b.units - a.units),
    festivalSpikeProducts,
    festivalCategorySpikes,
    dailySalesIndex,
    skuMaster,
  };
}

function serializeDailySalesCache(dailySalesIndex, skuMaster, years) {
  const byKey = {};
  for (const [key, daysMap] of dailySalesIndex.entries()) {
    byKey[key] = [...daysMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, v]) => [Number(day), v.u, v.r, v.fn, v.fp, v.s]);
  }

  const products = [...skuMaster.values()]
    .map((s) => ({
      skuId: s.skuId,
      productName: s.productName,
      categoryId: s.categoryId,
      categoryName: s.categoryName,
      brand: s.brand,
    }))
    .sort((a, b) => a.skuId.localeCompare(b.skuId));

  return {
    generatedAt: new Date().toISOString(),
    years: [...years].sort(),
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    products,
    byKey,
  };
}

async function main() {
  console.log("Building Retail Pulse cache from:", DATASET_DIR);
  const catalog = await buildDatasetCatalog();
  const sales = await buildSalesAggregates();

  const { dailySalesIndex, skuMaster, filters, ...salesRest } = sales;
  const dailySalesCache = serializeDailySalesCache(
    dailySalesIndex,
    skuMaster,
    filters.years
  );

  const cache = {
    generatedAt: new Date().toISOString(),
    dataSource: "bundled",
    catalog,
    ...salesRest,
    filters,
  };

  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  fs.writeFileSync(DAILY_SALES_CACHE_PATH, JSON.stringify(dailySalesCache));

  const dailyMb = (fs.statSync(DAILY_SALES_CACHE_PATH).size / 1024 / 1024).toFixed(2);
  console.log("Cache written to:", CACHE_PATH);
  console.log("Daily sales cache written to:", DAILY_SALES_CACHE_PATH, `(${dailyMb} MB)`);
  console.log("Catalog tables:", catalog.length);
  console.log("Sales records:", salesRest.overview.recordCount);
  console.log("Daily sales keys:", Object.keys(dailySalesCache.byKey).length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
