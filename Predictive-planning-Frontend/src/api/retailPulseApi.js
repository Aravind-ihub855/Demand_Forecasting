import http from "./http";

export async function getRetailPulseCatalog() {
  const { data } = await http.get("/retail-pulse/catalog");
  return data;
}

export async function getRetailPulseOverview() {
  const { data } = await http.get("/retail-pulse/overview");
  return data;
}

export async function getRetailPulseFilters() {
  const { data } = await http.get("/retail-pulse/filters");
  return data;
}

export async function getRetailPulsePhaseComparison() {
  const { data } = await http.get("/retail-pulse/phase-comparison");
  return data;
}

export async function getRetailPulseMonthlyTrend() {
  const { data } = await http.get("/retail-pulse/monthly-trend");
  return data;
}

export async function getRetailPulseStoreBreakdown() {
  const { data } = await http.get("/retail-pulse/store-breakdown");
  return data;
}

export async function getRetailPulseCategoryBreakdown() {
  const { data } = await http.get("/retail-pulse/category-breakdown");
  return data;
}

export async function getRetailPulseFestivalSpikeProducts({ festival, year, storeId, limit = 50 }) {
  const { data } = await http.get("/retail-pulse/festival-spike-products", {
    params: { festival, year, store_id: storeId, limit },
  });
  return data;
}

export async function getRetailPulseFestivalCategorySpikes(festival, year) {
  const { data } = await http.get("/retail-pulse/festival-category-spikes", {
    params: { festival, year },
  });
  return data;
}

export async function getRetailPulseConfidenceReport() {
  const { data } = await http.get("/retail-pulse/confidence-report");
  return data;
}

export async function getRetailPulseDailySalesProducts(categoryId) {
  const { data } = await http.get("/retail-pulse/daily-sales/products", {
    params: categoryId ? { category_id: categoryId } : {},
  });
  return data;
}

export async function getRetailPulseDailySales({ skuId, year, month }) {
  const { data } = await http.get("/retail-pulse/daily-sales", {
    params: { sku_id: skuId, year, month },
  });
  return data;
}
