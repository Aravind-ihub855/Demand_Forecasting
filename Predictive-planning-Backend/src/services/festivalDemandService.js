const SalesTransaction = require("../models/SalesTransaction");
const StoreInventory = require("../models/StoreInventory");
const WarehouseStoreRelationship = require("../models/WarehouseStoreRelationship");
const AnalyticsCache = require("../models/AnalyticsCache");
const { callGemini } = require("./geminiService");

const memoryCache = new Map();
const FESTIVAL_INTELLIGENCE_VERSION = "v2_daily_normalized";

function normalize(value) {
  if (value === null || value === undefined || value === "") return undefined;
  return value;
}

function buildKey(input) {
  return JSON.stringify(
    Object.keys(input)
      .sort()
      .reduce((acc, k) => {
        acc[k] = input[k];
        return acc;
      }, {})
  );
}

async function getCached(cacheKey) {
  const mem = memoryCache.get(cacheKey);
  if (mem && mem.expiresAt > Date.now()) return mem.value;

  const db = await AnalyticsCache.findOne({ cache_key: cacheKey }).lean();
  if (!db || new Date(db.expires_at).getTime() < Date.now()) return null;

  memoryCache.set(cacheKey, { value: db.payload, expiresAt: new Date(db.expires_at).getTime() });
  return db.payload;
}

async function setCached(cacheKey, cacheType, payload, ttlMs) {
  const expiresAt = new Date(Date.now() + ttlMs);
  memoryCache.set(cacheKey, { value: payload, expiresAt: expiresAt.getTime() });
  await AnalyticsCache.updateOne(
    { cache_key: cacheKey },
    {
      $set: {
        cache_key: cacheKey,
        cache_type: cacheType,
        payload,
        expires_at: expiresAt,
      },
    },
    { upsert: true }
  );
}

function baseMatch(filters) {
  const match = {};
  if (normalize(filters.store_id)) match.store_id = filters.store_id;
  if (normalize(filters.warehouse_id)) match.warehouse_id = filters.warehouse_id;
  if (normalize(filters.sku_id)) match.sku_id = filters.sku_id;
  if (normalize(filters.category_id)) match.category_id = filters.category_id;
  if (normalize(filters.from_date) || normalize(filters.to_date)) {
    match.sales_date = {};
    if (normalize(filters.from_date)) match.sales_date.$gte = filters.from_date;
    if (normalize(filters.to_date)) match.sales_date.$lte = filters.to_date;
  }
  return match;
}

function pctChange(base, now) {
  if (!base || base <= 0) return now > 0 ? 100 : 0;
  return ((now - base) / base) * 100;
}

function scoreClamp(v) {
  return Math.max(0, Math.min(100, v));
}

function buildGeminiPrompt(summary) {
  return `
You are a senior retail demand intelligence analyst.
Given token-compressed analytics summary JSON, generate a strict JSON response with:
- demand_explanation (string)
- executive_summary (string)
- inventory_recommendations (array of {sku, reason, action})
- risk_alerts (array of strings)
- key_insights (array of strings)

Important:
- Do not request raw data.
- Keep reasoning specific to festival demand.
- Mention stores, products, promotions, inventory and risk.
- Return valid JSON only (no markdown).

Summary JSON:
${JSON.stringify(summary)}
`;
}

function heuristicAi(summary) {
  const top = summary.top_products?.[0];
  const risky = (summary.stockout_alerts || []).slice(0, 3);

  const demand_explanation = top
    ? `Demand for ${top.sku_name} is expected to rise during ${summary.festival} due to historical uplift (${top.demand_uplift_pct.toFixed(
        1
      )}%), promotion activity, increased footfall, and trend intensity.`
    : `Demand for ${summary.festival} is expected to rise due to historical festival uplift, promotion activity and footfall acceleration.`;

  const executive_summary = `Festival intelligence indicates elevated demand risk for ${summary.festival}. Focus replenishment 7-10 days in advance in high-growth stores, prioritize top uplift SKUs, and monitor stockout-prone items during peak days.`;

  return {
    demand_explanation,
    executive_summary,
    inventory_recommendations: (summary.inventory_recommendations || []).slice(0, 8).map((r) => ({
      sku: r.sku_name,
      reason: "Forecast demand exceeds current available stock",
      action: `Refill +${r.suggested_refill_qty}`,
    })),
    risk_alerts: risky.map((r) => `${r.sku_name} (${r.store_id}) risk=${r.risk_level}`),
    key_insights: [
      `Festival footfall uplift estimated at ${summary.footfall_growth_pct.toFixed(1)}%.`,
      `Promotion uplift estimated at ${summary.promotion_impact_pct.toFixed(1)}%.`,
      `Top category by growth: ${summary.top_categories?.[0]?.category_name || "N/A"}.`,
    ],
  };
}

async function aggregateFestivalDemand(filters) {
  const match = baseMatch(filters);
  const festival = normalize(filters.festival_name) || "Diwali";

  const [skuRows, storeRows, topProducts, topCategories, promoRows, footfallAgg, weatherAgg] =
    await Promise.all([
      SalesTransaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              sku_id: "$sku_id",
              sku_name: "$sku_name",
              store_id: "$store_id",
              category_name: "$category_name",
            },
            festival_qty: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$festival_flag", true] }, { $eq: ["$festival_name", festival] }] },
                  "$quantity_sold",
                  0,
                ],
              },
            },
            festival_days_set: {
              $addToSet: {
                $cond: [
                  { $and: [{ $eq: ["$festival_flag", true] }, { $eq: ["$festival_name", festival] }] },
                  "$sales_date",
                  null,
                ],
              },
            },
            normal_qty: {
              $sum: {
                $cond: [
                  { $or: [{ $eq: ["$festival_flag", false] }, { $ne: ["$festival_name", festival] }] },
                  "$quantity_sold",
                  0,
                ],
              },
            },
            normal_days_set: {
              $addToSet: {
                $cond: [
                  { $or: [{ $eq: ["$festival_flag", false] }, { $ne: ["$festival_name", festival] }] },
                  "$sales_date",
                  null,
                ],
              },
            },
            festival_sales: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$festival_flag", true] }, { $eq: ["$festival_name", festival] }] },
                  "$total_sales_amount",
                  0,
                ],
              },
            },
            normal_sales: {
              $sum: {
                $cond: [
                  { $or: [{ $eq: ["$festival_flag", false] }, { $ne: ["$festival_name", festival] }] },
                  "$total_sales_amount",
                  0,
                ],
              },
            },
            stockout_events: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$festival_flag", true] },
                      { $eq: ["$festival_name", festival] },
                      { $eq: ["$stockout_flag", true] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      SalesTransaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$store_id",
            festival_qty: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$festival_flag", true] }, { $eq: ["$festival_name", festival] }] },
                  "$quantity_sold",
                  0,
                ],
              },
            },
            festival_days_set: {
              $addToSet: {
                $cond: [
                  { $and: [{ $eq: ["$festival_flag", true] }, { $eq: ["$festival_name", festival] }] },
                  "$sales_date",
                  null,
                ],
              },
            },
            normal_qty: {
              $sum: {
                $cond: [
                  { $or: [{ $eq: ["$festival_flag", false] }, { $ne: ["$festival_name", festival] }] },
                  "$quantity_sold",
                  0,
                ],
              },
            },
            normal_days_set: {
              $addToSet: {
                $cond: [
                  { $or: [{ $eq: ["$festival_flag", false] }, { $ne: ["$festival_name", festival] }] },
                  "$sales_date",
                  null,
                ],
              },
            },
          },
        },
      ]),
      SalesTransaction.aggregate([
        { $match: { ...match, festival_flag: true, festival_name: festival } },
        { $group: { _id: { sku_id: "$sku_id", sku_name: "$sku_name" }, qty: { $sum: "$quantity_sold" } } },
        { $sort: { qty: -1 } },
        { $limit: 10 },
      ]),
      SalesTransaction.aggregate([
        { $match: { ...match, festival_flag: true, festival_name: festival } },
        {
          $group: {
            _id: { category_id: "$category_id", category_name: "$category_name" },
            fest: { $sum: "$quantity_sold" },
          },
        },
        { $sort: { fest: -1 } },
        { $limit: 8 },
      ]),
      SalesTransaction.aggregate([
        { $match: { ...match, festival_flag: true, festival_name: festival } },
        {
          $group: {
            _id: "$promotion_type",
            festival_qty: { $sum: "$quantity_sold" },
            festival_days_set: { $addToSet: "$sales_date" },
            promo_flag: { $max: { $cond: [{ $eq: ["$promotion_flag", true] }, 1, 0] } },
          },
        },
      ]),
      SalesTransaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            festival_footfall: {
              $avg: {
                $cond: [
                  { $and: [{ $eq: ["$festival_flag", true] }, { $eq: ["$festival_name", festival] }] },
                  "$customer_footfall",
                  null,
                ],
              },
            },
            normal_footfall: {
              $avg: {
                $cond: [
                  { $or: [{ $eq: ["$festival_flag", false] }, { $ne: ["$festival_name", festival] }] },
                  "$customer_footfall",
                  null,
                ],
              },
            },
          },
        },
      ]),
      SalesTransaction.aggregate([
        { $match: { ...match, festival_flag: true, festival_name: festival } },
        { $group: { _id: "$weather_condition", avg_temp: { $avg: "$temperature_celsius" }, qty: { $sum: "$quantity_sold" } } },
        { $sort: { qty: -1 } },
        { $limit: 3 },
      ]),
    ]);

  const inventoryRows = await StoreInventory.aggregate([
    {
      $group: {
        _id: { store_id: "$store_id", sku_id: "$sku_id" },
        current_stock: { $sum: "$available_quantity" },
      },
    },
  ]);

  const leadRows = await WarehouseStoreRelationship.aggregate([
    { $group: { _id: "$store_id", avg_lead_time_hours: { $avg: "$lead_time_hours" } } },
  ]);

  const stockMap = new Map(inventoryRows.map((r) => [`${r._id.store_id}::${r._id.sku_id}`, r.current_stock]));
  const leadMap = new Map(leadRows.map((r) => [r._id, r.avg_lead_time_hours]));

  const festivalDemandForecast = skuRows
    .filter((r) => r.festival_qty > 0)
    .map((r) => {
      const festivalDays = (r.festival_days_set || []).filter(Boolean).length || 1;
      const normalDays = (r.normal_days_set || []).filter(Boolean).length || 1;
      const normalDaily = (r.normal_qty || 0) / normalDays;
      const festivalDaily = (r.festival_qty || 0) / festivalDays;
      const uplift = pctChange(normalDaily, festivalDaily);
      const forecastDaily = Math.round(festivalDaily * 1.08);
      const incrementalDaily = Math.max(0, forecastDaily - Math.round(normalDaily));
      return {
        sku_id: r._id.sku_id,
        sku_name: r._id.sku_name,
        store_id: r._id.store_id,
        category_name: r._id.category_name,
        normal_demand: Math.round(normalDaily),
        festival_forecast: forecastDaily,
        incremental_demand: incrementalDaily,
        festival_days: festivalDays,
        normal_days: normalDays,
        demand_uplift_pct: Number(uplift.toFixed(2)),
      };
    })
    // Rank by business impact first (units), not percentage.
    .sort((a, b) => {
      if (b.incremental_demand !== a.incremental_demand) return b.incremental_demand - a.incremental_demand;
      if (b.festival_forecast !== a.festival_forecast) return b.festival_forecast - a.festival_forecast;
      return b.demand_uplift_pct - a.demand_uplift_pct;
    })
    .slice(0, 50);

  const inventoryRecommendations = festivalDemandForecast
    .map((r) => {
      const current = stockMap.get(`${r.store_id}::${r.sku_id}`) || 0;
      const refill = Math.max(0, Math.ceil(r.festival_forecast - current));
      return {
        sku_id: r.sku_id,
        sku_name: r.sku_name,
        store_id: r.store_id,
        current_stock: current,
        forecast_demand: r.festival_forecast,
        suggested_refill_qty: refill,
      };
    })
    .filter((r) => r.suggested_refill_qty > 0)
    .slice(0, 50);

  const stockoutAlerts = skuRows
    .filter((r) => r.festival_qty > 0)
    .map((r) => {
      const current = stockMap.get(`${r._id.store_id}::${r._id.sku_id}`) || 0;
      const expected = Math.round((r.festival_qty || 0) * 1.08);
      const shortageRatio = expected > 0 ? (expected - current) / expected : 0;
      const risk =
        shortageRatio > 0.4 || r.stockout_events > 5
          ? "High"
          : shortageRatio > 0.15 || r.stockout_events > 0
          ? "Medium"
          : "Low";
      return {
        sku_id: r._id.sku_id,
        sku_name: r._id.sku_name,
        store_id: r._id.store_id,
        risk_level: risk,
      };
    })
    .filter((r) => r.risk_level !== "Low")
    .slice(0, 50);

  const storeComparison = storeRows
    .map((r) => {
      const festivalDays = (r.festival_days_set || []).filter(Boolean).length || 1;
      const normalDays = (r.normal_days_set || []).filter(Boolean).length || 1;
      const normalDaily = (r.normal_qty || 0) / normalDays;
      const festivalDaily = (r.festival_qty || 0) / festivalDays;
      return {
        store_id: r._id,
        festival: festival,
        demand_growth_pct: Number(pctChange(normalDaily, festivalDaily).toFixed(2)),
      };
    })
    .sort((a, b) => b.demand_growth_pct - a.demand_growth_pct);

  const topFestivalProducts = topProducts.map((r, idx) => ({
    rank: idx + 1,
    sku_id: r._id.sku_id,
    sku_name: r._id.sku_name,
    units_sold: r.qty,
  }));

  const promotionImpact = promoRows
    .filter((r) => r._id && r.promo_flag === 1)
    .map((r) => {
      const noPromoRow = promoRows.find((x) => !x._id || x.promo_flag === 0);
      const festivalDays = (r.festival_days_set || []).filter(Boolean).length || 1;
      const baselineDays = (noPromoRow?.festival_days_set || []).filter(Boolean).length || 1;
      const normalDaily = (noPromoRow?.festival_qty || 0) / baselineDays;
      const festivalDaily = (r.festival_qty || 0) / festivalDays;
      return {
        promotion_type: r._id,
        demand_increase_pct: Number(pctChange(normalDaily, festivalDaily).toFixed(2)),
      };
    })
    .sort((a, b) => b.demand_increase_pct - a.demand_increase_pct);

  const readiness = storeComparison.map((s) => {
    const leadTime = leadMap.get(s.store_id) || 48;
    const riskCount = stockoutAlerts.filter((r) => r.store_id === s.store_id).length;
    const refillCount = inventoryRecommendations.filter((r) => r.store_id === s.store_id).length;
    const readinessScore = scoreClamp(100 - riskCount * 8 - refillCount * 2 - leadTime / 12);
    return { store_id: s.store_id, readiness_score: Number(readinessScore.toFixed(1)) };
  });

  const footfallGrowth = pctChange(
    footfallAgg[0]?.normal_footfall || 0,
    footfallAgg[0]?.festival_footfall || 0
  );
  const promoAvg =
    promotionImpact.length > 0
      ? promotionImpact.reduce((acc, p) => acc + p.demand_increase_pct, 0) / promotionImpact.length
      : 0;

  return {
    festival,
    filters_used: filters,
    festival_demand_forecast: festivalDemandForecast,
    inventory_recommendations: inventoryRecommendations,
    stockout_alerts: stockoutAlerts,
    store_comparison: storeComparison,
    top_festival_products: topFestivalProducts,
    promotion_impact: promotionImpact,
    festival_readiness_score: readiness,
    top_categories: topCategories.map((c) => ({
      category_id: c._id.category_id,
      category_name: c._id.category_name,
      festival_units: c.fest,
    })),
    weather_summary: weatherAgg.map((w) => ({
      weather_condition: w._id,
      avg_temp: Number((w.avg_temp || 0).toFixed(1)),
      units: w.qty,
    })),
    footfall_growth_pct: Number(footfallGrowth.toFixed(2)),
    promotion_impact_pct: Number(promoAvg.toFixed(2)),
  };
}

async function enrichWithAi(aggregated) {
  const summaryForLlm = {
    festival: aggregated.festival,
    top_products: aggregated.festival_demand_forecast.slice(0, 8),
    top_categories: aggregated.top_categories.slice(0, 5),
    store_growth: aggregated.store_comparison.slice(0, 5),
    promotion_impact: aggregated.promotion_impact.slice(0, 5),
    stockout_alerts: aggregated.stockout_alerts.slice(0, 8),
    inventory_recommendations: aggregated.inventory_recommendations.slice(0, 8),
    footfall_growth_pct: aggregated.footfall_growth_pct,
    promotion_impact_pct: aggregated.promotion_impact_pct,
    weather_summary: aggregated.weather_summary,
  };

  const prompt = buildGeminiPrompt(summaryForLlm);
  const aiJson = (await callGemini(prompt)) || heuristicAi(summaryForLlm);
  const fallback = heuristicAi(summaryForLlm);

  return {
    ...aggregated,
    ai_demand_explanation: aiJson.demand_explanation || fallback.demand_explanation,
    ai_executive_summary: aiJson.executive_summary || fallback.executive_summary,
    ai_inventory_recommendations:
      aiJson.inventory_recommendations || fallback.inventory_recommendations,
    ai_risk_alerts: aiJson.risk_alerts || fallback.risk_alerts,
    ai_key_insights: aiJson.key_insights || fallback.key_insights,
  };
}

async function analyzeFestivalDemand(filters) {
  const normalized = {
    festival_name: normalize(filters.festival_name) || "Diwali",
    store_id: normalize(filters.store_id),
    warehouse_id: normalize(filters.warehouse_id),
    sku_id: normalize(filters.sku_id),
    category_id: normalize(filters.category_id),
    from_date: normalize(filters.from_date) || "2025-01-01",
    to_date: normalize(filters.to_date) || "2025-12-31",
  };

  const aggregateKey = `festival:aggregate:${buildKey(normalized)}`;
  const aiKey = `festival:ai:${buildKey(normalized)}`;
  const aggregateKeyVersioned = `${FESTIVAL_INTELLIGENCE_VERSION}:${aggregateKey}`;
  const aiKeyVersioned = `${FESTIVAL_INTELLIGENCE_VERSION}:${aiKey}`;

  const cachedAgg = await getCached(aggregateKeyVersioned);
  const aggregated = cachedAgg || (await aggregateFestivalDemand(normalized));
  if (!cachedAgg) {
    await setCached(aggregateKeyVersioned, "festival_aggregate", aggregated, 1000 * 60 * 30);
  }

  const cachedAi = await getCached(aiKeyVersioned);
  if (cachedAi) return cachedAi;

  const aiResult = await enrichWithAi(aggregated);
  await setCached(aiKeyVersioned, "festival_ai", aiResult, 1000 * 60 * 15);
  return aiResult;
}

module.exports = { analyzeFestivalDemand };

