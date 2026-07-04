import axios from "axios";
import { MOCK_DEMAND_INTELLIGENCE } from "../components/demand-intelligence/mockData";
import responseData from "../data/response.json";

export const FILTERS_WEBHOOK_URL =
  import.meta.env.VITE_DEMAND_INTEL_FILTERS_URL ||
  (import.meta.env.DEV
    ? "/demand-intel-filters"
    : "https://api.agents.snsihub.ai/webhook/selection-filter");

export const WEBHOOK_URL =
  import.meta.env.VITE_DEMAND_INTEL_WEBHOOK_URL ||
  (import.meta.env.DEV
    ? "/demand-intelligence"
    : "https://api.agents.snsihub.ai/webhook/ai-demand-forecastings");

const FORECAST_TIMEOUT_MS = 600000;

const filtersClient = axios.create({
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

const forecastClient = axios.create({
  timeout: FORECAST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

export async function fetchDemandIntelFilters() {
  if (import.meta.env.VITE_USE_MOCK === "true") {
    return {
      success: true,
      festivals: [
        { fest_value: "Pongal", fest_name: "Pongal" },
        { fest_value: "Christmas", fest_name: "Christmas" }
      ],
      stores: [
        { store_value: "D-Mart Saravanampatti", store_name: "D-Mart Saravanampatti" }
      ]
    };
  }
  const { data } = await filtersClient.get(FILTERS_WEBHOOK_URL);
  return data;
}

export async function generateDemandIntelligence({ festival, store, planning_date }) {
  if (import.meta.env.VITE_USE_MOCK === "true") {
    const delay = Number(import.meta.env.VITE_MOCK_DELAY_MS) || 5000;
    console.log(`Using mock data from response.json as VITE_USE_MOCK is enabled. Simulating a ${delay / 1000}-second delay...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    const matchingData = Array.isArray(responseData)
      ? responseData.find(item =>
        item.executive_summary?.festival?.toLowerCase() === festival?.toLowerCase()
      )
      : responseData;
    return matchingData || (Array.isArray(responseData) ? responseData[0] : responseData);
  }
  try {
    const { data } = await forecastClient.post(WEBHOOK_URL, {
      festival,
      store,
      planning_date,
    });
    return data?.kpis ? data : data?.data ?? data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(
        "Demand Intelligence webhook unavailable — using mock data.",
        error?.message
      );
      return MOCK_DEMAND_INTELLIGENCE;
    }
    throw error;
  }
}

