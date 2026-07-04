import http from "./http";

export async function getFestivalIntelligenceFilters() {
  const { data } = await http.get("/festival-intelligence/filters");
  return data;
}

export async function analyzeFestivalIntelligence(params = {}) {
  const { data } = await http.get("/festival-intelligence/analyze", { params });
  return data;
}

