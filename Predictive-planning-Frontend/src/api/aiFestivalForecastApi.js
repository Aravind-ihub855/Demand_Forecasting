import axios from "axios";

const FILTERS_URL =
  import.meta.env.VITE_AI_FESTIVAL_FILTERS_URL ||
  (import.meta.env.DEV
    ? "/ai-festival-filters"
    : "https://api.agents.snsihub.ai/webhook/selection-filter");

const FORECAST_URL =
  import.meta.env.VITE_AI_FESTIVAL_FORECAST_URL ||
  (import.meta.env.DEV
    ? "/ai-festival-forecast"
    : "https://api.agents.snsihub.ai/webhook/ai-demand-forecastings");

const FORECAST_TIMEOUT_MS = 600000; // 10 minutes — AI forecast can take several minutes

const filtersClient = axios.create({
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

const forecastClient = axios.create({
  timeout: FORECAST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

export async function fetchFestivalFilters() {
  const { data } = await filtersClient.get(FILTERS_URL);
  return data;
}

export async function generateFestivalForecast({ festival, store }) {
  const { data } = await forecastClient.post(FORECAST_URL, {
    festival,
    store_scope: store,
  });
  return data;
}
