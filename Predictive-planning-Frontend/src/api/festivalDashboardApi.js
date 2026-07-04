import axios from "axios";

const WEBHOOK_URL =
  import.meta.env.VITE_FESTIVAL_WEBHOOK_URL ||
  (import.meta.env.DEV
    ? "/festival-webhook"
    : "https://api.agents.snsihub.ai/webhook-test/forecast/festival-intelligence");

const webhookClient = axios.create({
  timeout: 600000,
  headers: { "Content-Type": "application/json" },
});

export async function triggerFestivalForecast(payload) {
  if (import.meta.env.VITE_USE_MOCK === "true") {
    const delay = Number(import.meta.env.VITE_MOCK_DELAY_MS) || 5000;
    console.log(`Using mock data for Festival Forecast as VITE_USE_MOCK is enabled. Simulating a ${delay / 1000}-second delay...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return {}; // normalizeFestivalDashboard will fall back to DIWALI_PLACEHOLDER
  }

  const body = {
    request_type: "festival_demand_forecast",
    include_inventory_risk: true,
    include_recommendations: true,
    include_category_analysis: true,
    ...payload,
  };

  const { data } = await webhookClient.post(WEBHOOK_URL, body);
  return data;
}
