import http from "./http";

const inflight = new Map();

function stableStringify(obj) {
  if (!obj) return "";
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  const normalized = {};
  for (const k of keys) normalized[k] = obj[k];
  return JSON.stringify(normalized);
}

function withParams(url, params) {
  const key = `${url}?${stableStringify(params)}`;
  const existing = inflight.get(key);
  if (existing) return existing;

  const req = http.get(url, { params }).finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, req);
  return req;
}

export async function getAnalyticsFilters() {
  const { data } = await http.get("/analytics/filters");
  return data;
}

export async function getExecutiveKpis(params = {}) {
  const { data } = await withParams("/analytics/kpis", params);
  return data;
}

export async function getStoreSalesTrend(params = {}) {
  const { data } = await withParams("/analytics/store-sales-trend", params);
  return data;
}

export async function getProductSalesTrend(params = {}) {
  const { data } = await withParams("/analytics/product-sales-trend", params);
  return data;
}

export async function getCategorySalesTrend(params = {}) {
  const { data } = await withParams("/analytics/category-sales-trend", params);
  return data;
}

export async function getWarehouseMovementTrend(params = {}) {
  const { data } = await withParams("/analytics/warehouse-movement-trend", params);
  return data;
}

export async function getFestivalPeakTrend(params = {}) {
  const { data } = await withParams("/analytics/festival-peak-trend", params);
  return data;
}

export async function getPromotionPeakTrend(params = {}) {
  const { data } = await withParams("/analytics/promotion-peak-trend", params);
  return data;
}

export async function getDriverContributionTrend(params = {}) {
  const { data } = await withParams("/analytics/driver-contribution-trend", params);
  return data;
}

export async function getFactorImpact(params = {}) {
  const { data } = await withParams("/analytics/factor-impact", params);
  return data;
}

export async function getEffectShare(params = {}) {
  const { data } = await withParams("/analytics/effect-share", params);
  return data;
}

export async function getFeatureCoverage(params = {}) {
  const { data } = await withParams("/analytics/feature-coverage", params);
  return data;
}

export async function getRealtimeInsights(params = {}) {
  const { data } = await withParams("/analytics/insights", params);
  return data;
}

export async function getFestivalPromotionProducts(params = {}) {
  const { data } = await withParams("/analytics/festival-promotion-products", params);
  return data;
}

