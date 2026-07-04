const fs = require("fs");
const path = require("path");

const CACHE_PATH = path.resolve(__dirname, "..", "data", "retailPulseCache.json");
const DAILY_SALES_CACHE_PATH = path.resolve(__dirname, "..", "data", "dailySalesCache.json");
const BUILD_SCRIPT = path.resolve(__dirname, "..", "scripts", "buildRetailPulseCache.js");
const DATASET_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "Demand_forecasting dataset"
);

let cache = null;
let dailySalesCache = null;
let loadPromise = null;

function readCacheFile() {
  if (!fs.existsSync(CACHE_PATH)) {
    return null;
  }
  const raw = fs.readFileSync(CACHE_PATH, "utf8");
  return JSON.parse(raw);
}

function datasetFolderAvailable() {
  return fs.existsSync(DATASET_DIR);
}

function readDailySalesCacheFile() {
  if (!fs.existsSync(DAILY_SALES_CACHE_PATH)) {
    return null;
  }
  const raw = fs.readFileSync(DAILY_SALES_CACHE_PATH, "utf8");
  return JSON.parse(raw);
}

function loadDailySalesCacheOrThrow() {
  const data = readDailySalesCacheFile();
  if (!data) {
    const err = new Error(
      "Daily sales cache not found. Run `npm run build:retail-pulse` while the Demand_forecasting dataset folder is available."
    );
    err.status = 503;
    throw err;
  }
  return data;
}

async function ensureDailySalesCache() {
  if (dailySalesCache) return dailySalesCache;
  dailySalesCache = loadDailySalesCacheOrThrow();
  return dailySalesCache;
}

function padMonth(month) {
  return String(month).padStart(2, "0");
}

function padDay(day) {
  return String(day).padStart(2, "0");
}

function daysInMonth(year, month) {
  return new Date(Number(year), Number(month), 0).getDate();
}

function dayName(year, month, day) {
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(
    "en-US",
    { weekday: "long" }
  );
}

function formatFestivalLabel(name) {
  if (!name || name === "None") return "—";
  return String(name).replace(/_/g, " ");
}

async function getDailySalesProducts(categoryId) {
  const data = await ensureDailySalesCache();
  let products = data.products || [];
  if (categoryId) {
    products = products.filter((p) => p.categoryId === categoryId);
  }
  return products;
}

async function getDailySales({ skuId, year, month, storeId }) {
  const data = await ensureDailySalesCache();

  if (!skuId || !year || !month) {
    const err = new Error("sku_id, year, and month are required");
    err.status = 400;
    throw err;
  }

  const product = (data.products || []).find((p) => p.skuId === skuId);
  if (!product) {
    const err = new Error("Product not found");
    err.status = 404;
    throw err;
  }

  const ym = `${year}-${padMonth(month)}`;
  const cacheKey = storeId ? `${ym}-${skuId}@${storeId}` : `${ym}-${skuId}`;
  const rawDays = data.byKey[cacheKey] || [];

  const dayMap = new Map(
    rawDays.map(([day, units, revenue, festivalName, festivalPhase, season]) => [
      padDay(day),
      { units, revenue, festivalName, festivalPhase, season },
    ])
  );

  const totalDays = daysInMonth(year, month);
  const days = [];
  let peakUnits = 0;
  let peakDay = null;

  for (let d = 1; d <= totalDays; d += 1) {
    const dayKey = padDay(d);
    const date = `${ym}-${dayKey}`;
    const entry = dayMap.get(dayKey);
    const units = entry?.units || 0;
    const revenue = entry?.revenue || 0;
    const festivalName = entry?.festivalName || "None";
    const festivalPhase = entry?.festivalPhase || "normal";
    const season = entry?.season || "Normal";
    const isFestival = festivalName !== "None";

    if (units > peakUnits) {
      peakUnits = units;
      peakDay = d;
    }

    days.push({
      date,
      day: d,
      dayName: dayName(year, month, d),
      unitsSold: units,
      revenue,
      isFestival,
      festivalName: formatFestivalLabel(festivalName),
      festivalPhase: festivalPhase.replace(/_/g, " "),
      season,
      isPeak: false,
    });
  }

  if (peakDay !== null) {
    const peak = days.find((d) => d.day === peakDay);
    if (peak) peak.isPeak = true;
  }

  const totalUnits = days.reduce((sum, d) => sum + d.unitsSold, 0);
  const totalRevenue = days.reduce((sum, d) => sum + d.revenue, 0);
  const festivalDays = days.filter((d) => d.isFestival);
  const avgUnits = totalDays ? Number((totalUnits / totalDays).toFixed(1)) : 0;

  return {
    product,
    year: Number(year),
    month: Number(month),
    monthLabel: new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
      month: "long",
    }),
    storeId: storeId || null,
    days,
    summary: {
      totalDays,
      totalUnits,
      totalRevenue,
      avgUnits,
      peakDay,
      peakUnits,
      peakDate: peakDay ? `${ym}-${padDay(peakDay)}` : null,
      festivalDayCount: festivalDays.length,
      nonFestivalDayCount: totalDays - festivalDays.length,
    },
  };
}

function loadCacheOrThrow() {
  const data = readCacheFile();
  if (!data) {
    const err = new Error(
      "Retail pulse cache not found. Run `npm run build:retail-pulse` once while the Demand_forecasting dataset folder is present, or copy retailPulseCache.json into src/data/."
    );
    err.status = 503;
    throw err;
  }
  return data;
}

async function ensureCache() {
  if (cache) return cache;
  if (loadPromise) return loadPromise;

  loadPromise = Promise.resolve().then(() => {
    cache = loadCacheOrThrow();
    return cache;
  });

  return loadPromise;
}

async function rebuildCacheFromDataset() {
  if (!datasetFolderAvailable()) {
    const err = new Error(
      "Demand_forecasting dataset folder not found. Spike Observatory runs from the bundled cache — no CSV folder is required at runtime."
    );
    err.status = 404;
    throw err;
  }

  // eslint-disable-next-line global-require
  const { execSync } = require("child_process");
  execSync(`node "${BUILD_SCRIPT}"`, { stdio: "inherit" });

  cache = null;
  loadPromise = null;
  dailySalesCache = null;
  return ensureCache();
}

function refreshCache() {
  cache = null;
  loadPromise = null;
  return ensureCache();
}

async function getCatalog() {
  const data = await ensureCache();
  return {
    generatedAt: data.generatedAt,
    dataSource: data.dataSource || "bundled",
    tables: data.catalog,
    summary: {
      totalTables: data.catalog.length,
      dimensionTables: data.catalog.filter((t) => t.type === "dimension").length,
      factTables: data.catalog.filter((t) => t.type === "fact").length,
      externalTables: data.catalog.filter((t) => t.type === "external").length,
      totalRows: data.catalog.reduce((sum, t) => sum + t.rowCount, 0),
      totalSizeMb: Number(
        data.catalog.reduce((sum, t) => sum + t.sizeMb, 0).toFixed(2)
      ),
    },
  };
}

async function getOverview() {
  const data = await ensureCache();
  return data.overview;
}

async function getFilters() {
  const data = await ensureCache();
  return data.filters;
}

async function getPhaseComparison() {
  const data = await ensureCache();
  return data.phaseComparison;
}

async function getMonthlyTrend() {
  const data = await ensureCache();
  return data.monthlyTrend;
}

async function getStoreBreakdown() {
  const data = await ensureCache();
  return data.storeBreakdown;
}

async function getCategoryBreakdown() {
  const data = await ensureCache();
  return data.categoryBreakdown;
}

async function getFestivalSpikeProducts({ festival, year, storeId, limit = 50 }) {
  const data = await ensureCache();
  if (!festival || !year) {
    return { festival: null, year: null, products: [] };
  }

  const yearKey = String(year);
  let products = data.festivalSpikeProducts?.[yearKey]?.[festival] || [];
  const storeKey = storeId || "__ALL__";
  products = products.filter((p) => p.storeId === storeKey);

  return {
    festival,
    year: Number(year),
    dataSource: "fact_daily_sales",
    granularity: "daily",
    methodology:
      "Average daily units sold during festival window (pre-festival, festival day, post-festival) vs average on normal days in the same year",
    storeScope: storeId ? storeId : "all_stores",
    products: products.slice(0, Number(limit)),
  };
}

async function getFestivalCategorySpikes({ festival, year }) {
  const data = await ensureCache();
  const yearKey = year ? String(year) : null;
  return {
    festival,
    year: year ? Number(year) : null,
    dataSource: "fact_daily_sales",
    granularity: "daily",
    categories:
      yearKey && festival
        ? data.festivalCategorySpikes?.[yearKey]?.[festival] || []
        : [],
  };
}

async function getConfidenceReport() {
  const data = await ensureCache();
  const { overview, catalog, phaseComparison } = data;

  const checks = [
    {
      id: "date_coverage",
      label: "3-Year Date Coverage",
      status: overview.dateRange?.from === "2023-01-01" ? "pass" : "warn",
      detail: `${overview.dateRange?.from} → ${overview.dateRange?.to}`,
    },
    {
      id: "sales_volume",
      label: "Sales Fact Volume",
      status: overview.recordCount > 1000000 ? "pass" : "warn",
      detail: `${overview.recordCount.toLocaleString()} daily sales rows`,
    },
    {
      id: "festival_signal",
      label: "Festival Demand Signal",
      status: overview.festivalUpliftPct > 10 ? "pass" : "warn",
      detail: `${overview.festivalUpliftPct}% uplift on festival days vs normal`,
    },
    {
      id: "multi_store",
      label: "Multi-Store Coverage",
      status: overview.activeStores >= 5 ? "pass" : "warn",
      detail: `${overview.activeStores} stores with sales history`,
    },
    {
      id: "sku_breadth",
      label: "SKU Breadth",
      status: overview.activeSkus >= 400 ? "pass" : "warn",
      detail: `${overview.activeSkus} SKUs in product master`,
    },
    {
      id: "external_signals",
      label: "External Enrichment Tables",
      status: catalog.filter((t) => t.type === "external").length >= 4 ? "pass" : "warn",
      detail: `${catalog.filter((t) => t.type === "external").length} weather/festival/competitor/trend tables`,
    },
    {
      id: "phase_decomposition",
      label: "Festival Phase Decomposition",
      status: phaseComparison.length >= 4 ? "pass" : "warn",
      detail: "Normal, pre-festival, festival day, and post-festival phases tracked",
    },
  ];

  const passCount = checks.filter((c) => c.status === "pass").length;
  const score = Math.round((passCount / checks.length) * 100);

  return {
    score,
    verdict:
      score >= 85
        ? "Production-Ready for Forecasting Pilots"
        : score >= 70
          ? "Suitable with Known Gaps"
          : "Needs Data Enrichment",
    checks,
  };
}

module.exports = {
  ensureCache,
  refreshCache,
  rebuildCacheFromDataset,
  datasetFolderAvailable,
  getCatalog,
  getOverview,
  getFilters,
  getPhaseComparison,
  getMonthlyTrend,
  getStoreBreakdown,
  getCategoryBreakdown,
  getFestivalSpikeProducts,
  getFestivalCategorySpikes,
  getConfidenceReport,
  getDailySalesProducts,
  getDailySales,
};
