import http from "./http";

export async function getMonthlyAnalysisFilters() {
  const { data } = await http.get("/monthly-analysis/filters");
  return data;
}

export async function getFestivalSpikeByMonth(year = 2024) {
  const { data } = await http.get("/monthly-analysis/festival-spike-by-month", {
    params: { year }
  });
  return data;
}

export async function getProductSpikeByMonth(month, year = 2024) {
  const { data } = await http.get("/monthly-analysis/product-spike-by-month", {
    params: { month, year }
  });
  return data;
}

export async function getProductSpikeByFestival(festival, year = 2024) {
  const { data } = await http.get("/monthly-analysis/product-spike-by-festival", {
    params: { festival, year }
  });
  return data;
}
