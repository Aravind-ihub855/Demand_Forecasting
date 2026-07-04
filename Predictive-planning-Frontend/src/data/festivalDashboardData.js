/** Realistic Diwali placeholder — used as fallback when API fields are missing. */
export const DIWALI_PLACEHOLDER = {
  executiveKpis: {
    festival: "Diwali",
    confidence: "High",
    topSpikeProduct: "Dry Fruit Laddu Box",
    expectedPeakGrowth: "+172%",
    highRiskProducts: 4,
    criticalProducts: 2,
  },
  demandSummary: {
    festival: "Diwali",
    demandGrowthRange: "60% - 172%",
    confidence: "High",
    observation:
      "Demand driven by gifting, dry fruits, sweets, ghee and festive apparel.",
  },
  topOpportunities: [
    {
      rank: 1,
      product: "Dry Fruit Laddu Box",
      expectedSpike: "+172%",
      revenueOpportunity: "High",
      driver: "Festive Gifting",
      procurementPriority: "Critical",
    },
    {
      rank: 2,
      product: "Premium Ghee 1L",
      expectedSpike: "+148%",
      revenueOpportunity: "High",
      driver: "Cooking & Sweets",
      procurementPriority: "Critical",
    },
    {
      rank: 3,
      product: "Assorted Dry Fruits 500g",
      expectedSpike: "+134%",
      revenueOpportunity: "High",
      driver: "Festive Gifting",
      procurementPriority: "High",
    },
    {
      rank: 4,
      product: "Festive Sweet Hamper",
      expectedSpike: "+121%",
      revenueOpportunity: "Medium",
      driver: "Gifting Demand",
      procurementPriority: "High",
    },
    {
      rank: 5,
      product: "Diya & Decor Set",
      expectedSpike: "+98%",
      revenueOpportunity: "Medium",
      driver: "Religious Activities",
      procurementPriority: "Medium",
    },
  ],
  inventoryRisks: [
    {
      product: "Ghee 1L",
      risk: "Critical",
      lostSales: 172,
      impact: "Revenue Loss",
      action: "Increase Safety Stock",
    },
    {
      product: "Dry Fruit Laddu Box",
      risk: "High",
      lostSales: 145,
      impact: "Stockout Risk",
      action: "Expedite Procurement",
    },
    {
      product: "Assorted Dry Fruits 500g",
      risk: "High",
      lostSales: 98,
      impact: "Revenue Loss",
      action: "Increase Safety Stock",
    },
    {
      product: "Festive Sweet Hamper",
      risk: "Medium",
      lostSales: 64,
      impact: "Shelf Gap",
      action: "Monitor Daily Sell-through",
    },
  ],
  procurementPlan: [
    {
      product: "Ghee 1L",
      priority: "Critical",
      action: "Increase Procurement",
      timeline: "2 Weeks Before Festival",
    },
    {
      product: "Dry Fruit Laddu Box",
      priority: "Critical",
      action: "Early Bulk Order",
      timeline: "3 Weeks Before Festival",
    },
    {
      product: "Assorted Dry Fruits 500g",
      priority: "High",
      action: "Increase Procurement",
      timeline: "2 Weeks Before Festival",
    },
    {
      product: "Festive Sweet Hamper",
      priority: "High",
      action: "Expand Shelf Space",
      timeline: "1 Week Before Festival",
    },
  ],
  categoryInsights: [
    { category: "Grocery", expectedGrowth: "+142%", revenueImpact: "Very High", riskLevel: "High" },
    { category: "Lifestyle", expectedGrowth: "+86%", revenueImpact: "High", riskLevel: "Medium" },
    { category: "Snacks", expectedGrowth: "+74%", revenueImpact: "Medium", riskLevel: "Low" },
    { category: "Frozen Foods", expectedGrowth: "+52%", revenueImpact: "Medium", riskLevel: "Low" },
    { category: "Household", expectedGrowth: "+38%", revenueImpact: "Low", riskLevel: "Low" },
  ],
  demandDrivers: [
    { name: "Festival Impact", level: "Very High", icon: "🪔" },
    { name: "Seasonal Impact", level: "High", icon: "🍂" },
    { name: "Promotion Impact", level: "Medium", icon: "🏷️" },
    { name: "Gifting Demand", level: "Very High", icon: "🎁" },
    { name: "Family Gatherings", level: "High", icon: "👨‍👩‍👧‍👦" },
    { name: "Religious Activities", level: "High", icon: "🛕" },
  ],
  businessImpact: {
    topRevenueProduct: "Dry Fruit Laddu Box",
    highestRiskProduct: "Ghee 1L",
    totalRiskProducts: 4,
    totalCriticalProducts: 2,
    expectedRevenueOpportunity: "Rs 18.4 Lakhs",
  },
  aiRecommendations: [
    "Increase Ghee inventory by 120%",
    "Procure Dry Fruits early — lead time risk detected",
    "Expand shelf space for festive gifting products",
    "Prioritize ST-03 replenishment for top 3 spike SKUs",
    "Align promotion calendar with peak gifting week",
  ],
  charts: {
    productSpike: [
      { product: "Laddu Box", spike: 172 },
      { product: "Ghee 1L", spike: 148 },
      { product: "Dry Fruits", spike: 134 },
      { product: "Sweet Hamper", spike: 121 },
      { product: "Diya Set", spike: 98 },
    ],
    categoryGrowth: [
      { category: "Grocery", growth: 142 },
      { category: "Lifestyle", growth: 86 },
      { category: "Snacks", growth: 74 },
      { category: "Frozen", growth: 52 },
      { category: "Household", growth: 38 },
    ],
    riskDistribution: [
      { name: "Critical", value: 2 },
      { name: "High", value: 2 },
      { name: "Medium", value: 3 },
      { name: "Low", value: 5 },
    ],
    procurementPriority: [
      { priority: "Critical", count: 2 },
      { priority: "High", count: 4 },
      { priority: "Medium", count: 3 },
      { priority: "Low", count: 2 },
    ],
  },
  requestMeta: {
    festival_name: "Diwali",
    store_id: "ST-03",
    store_name: "D-Mart Singanallur",
    forecast_year: 2025,
  },
};

function pick(obj, keys, fallback = undefined) {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return fallback;
}

function formatGrowth(v) {
  if (v == null) return "—";
  const s = String(v);
  if (s.startsWith("+") || s.startsWith("-")) return s;
  const n = Number(v);
  if (Number.isNaN(n)) return s;
  return n >= 0 ? `+${n}%` : `${n}%`;
}

function mapPriority(v) {
  const s = String(v || "").toLowerCase();
  if (s.includes("crit")) return "Critical";
  if (s.includes("high")) return "High";
  if (s.includes("med")) return "Medium";
  return v || "Low";
}

/** Normalize webhook / backend payloads into dashboard shape. */
export function normalizeFestivalDashboard(raw, requestMeta = {}) {
  const base = structuredClone(DIWALI_PLACEHOLDER);
  if (!raw || typeof raw !== "object") {
    return { ...base, requestMeta: { ...base.requestMeta, ...requestMeta } };
  }

  const payload = raw.data && typeof raw.data === "object" ? raw.data : raw;
  const festival = pick(payload, ["festival", "festival_name"], requestMeta.festival_name || "Diwali");

  const topProducts =
    payload.top_demand_opportunities ||
    payload.top_opportunities ||
    payload.top_festival_products ||
    payload.festival_demand_forecast ||
    [];

  const risks =
    payload.inventory_risks ||
    payload.inventory_risk ||
    payload.stockout_alerts ||
    [];

  const procurement =
    payload.procurement_plan ||
    payload.procurement_action_plan ||
    payload.inventory_recommendations ||
    [];

  const categories =
    payload.category_insights ||
    payload.category_analysis ||
    payload.top_categories ||
    [];

  const recommendations =
    payload.ai_recommendations ||
    payload.recommendations ||
    payload.ai_inventory_recommendations ||
    (Array.isArray(payload.ai_key_insights) ? payload.ai_key_insights : null) ||
    base.aiRecommendations;

  const exec = payload.executive_kpis || payload.executiveKpis || payload.kpis || {};
  const summary = payload.demand_summary || payload.demandSummary || {};

  const mappedOpportunities =
    topProducts.length > 0
      ? topProducts.slice(0, 15).map((r, i) => ({
          rank: r.rank ?? i + 1,
          product: r.product || r.sku_name || r.product_name || r.name || "—",
          expectedSpike: formatGrowth(
            r.expectedSpike || r.expected_spike || r.demand_growth_pct || r.spike_pct
          ),
          revenueOpportunity: r.revenueOpportunity || r.revenue_opportunity || "Medium",
          driver: r.driver || r.demand_driver || "Festival Impact",
          procurementPriority: mapPriority(
            r.procurementPriority || r.procurement_priority || r.priority
          ),
        }))
      : base.topOpportunities;

  const mappedRisks =
    risks.length > 0
      ? risks.slice(0, 15).map((r) => ({
          product: r.product || r.sku_name || r.product_name || "—",
          risk: mapPriority(r.risk || r.risk_level),
          lostSales: r.lostSales ?? r.lost_sales ?? r.lost_sales_units ?? 0,
          impact: r.impact || "Revenue Loss",
          action: r.action || r.recommended_action || "Increase Safety Stock",
        }))
      : base.inventoryRisks;

  const mappedProcurement =
    procurement.length > 0
      ? procurement.slice(0, 12).map((r) => ({
          product: r.product || r.sku_name || r.product_name || "—",
          priority: mapPriority(r.priority || r.procurement_priority),
          action: r.action || r.action_required || r.recommendation || "Increase Procurement",
          timeline: r.timeline || r.procurement_timeline || "2 Weeks Before Festival",
        }))
      : base.procurementPlan;

  const mappedCategories =
    categories.length > 0
      ? categories.slice(0, 8).map((c) => ({
          category: c.category || c.category_name || c.name || "—",
          expectedGrowth: formatGrowth(c.expectedGrowth || c.expected_growth || c.growth_pct),
          revenueImpact: c.revenueImpact || c.revenue_impact || "Medium",
          riskLevel: mapPriority(c.riskLevel || c.risk_level),
        }))
      : base.categoryInsights;

  const topSpike = mappedOpportunities[0];
  const criticalCount = mappedRisks.filter((r) => r.risk === "Critical").length;
  const highRiskCount = mappedRisks.filter((r) =>
    ["Critical", "High"].includes(r.risk)
  ).length;

  const productChart =
    payload.charts?.productSpike ||
    mappedOpportunities.slice(0, 6).map((r) => ({
      product: r.product.length > 12 ? `${r.product.slice(0, 12)}…` : r.product,
      spike: parseInt(String(r.expectedSpike).replace(/[^\d-]/g, ""), 10) || 0,
    }));

  const categoryChart =
    payload.charts?.categoryGrowth ||
    mappedCategories.map((c) => ({
      category: c.category,
      growth: parseInt(String(c.expectedGrowth).replace(/[^\d-]/g, ""), 10) || 0,
    }));

  const riskChart =
    payload.charts?.riskDistribution ||
    ["Critical", "High", "Medium", "Low"].map((name) => ({
      name,
      value: mappedRisks.filter((r) => r.risk === name).length,
    }));

  const procChart =
    payload.charts?.procurementPriority ||
    ["Critical", "High", "Medium", "Low"].map((priority) => ({
      priority,
      count: mappedProcurement.filter((p) => p.priority === priority).length,
    }));

  return {
    executiveKpis: {
      festival,
      confidence: exec.confidence || summary.confidence || base.executiveKpis.confidence,
      topSpikeProduct:
        exec.topSpikeProduct ||
        exec.top_spike_product ||
        topSpike?.product ||
        base.executiveKpis.topSpikeProduct,
      expectedPeakGrowth: formatGrowth(
        exec.expectedPeakGrowth ||
          exec.expected_peak_growth ||
          topSpike?.expectedSpike ||
          base.executiveKpis.expectedPeakGrowth
      ),
      highRiskProducts:
        exec.highRiskProducts ??
        exec.high_risk_products ??
        highRiskCount ??
        base.executiveKpis.highRiskProducts,
      criticalProducts:
        exec.criticalProducts ??
        exec.critical_products ??
        criticalCount ??
        base.executiveKpis.criticalProducts,
    },
    demandSummary: {
      festival,
      demandGrowthRange:
        summary.demandGrowthRange ||
        summary.demand_growth_range ||
        payload.demand_growth_range ||
        base.demandSummary.demandGrowthRange,
      confidence: summary.confidence || exec.confidence || "High",
      observation:
        summary.observation ||
        summary.key_observation ||
        payload.ai_demand_explanation ||
        payload.ai_executive_summary ||
        base.demandSummary.observation,
    },
    topOpportunities: mappedOpportunities,
    inventoryRisks: mappedRisks,
    procurementPlan: mappedProcurement,
    categoryInsights: mappedCategories,
    demandDrivers: payload.demand_drivers || payload.demandDrivers || base.demandDrivers,
    businessImpact: {
      topRevenueProduct:
        payload.business_impact?.topRevenueProduct ||
        payload.businessImpact?.topRevenueProduct ||
        topSpike?.product ||
        base.businessImpact.topRevenueProduct,
      highestRiskProduct:
        payload.business_impact?.highestRiskProduct ||
        mappedRisks[0]?.product ||
        base.businessImpact.highestRiskProduct,
      totalRiskProducts: mappedRisks.length || base.businessImpact.totalRiskProducts,
      totalCriticalProducts: criticalCount || base.businessImpact.totalCriticalProducts,
      expectedRevenueOpportunity:
        payload.business_impact?.expectedRevenueOpportunity ||
        payload.expected_revenue_opportunity ||
        base.businessImpact.expectedRevenueOpportunity,
    },
    aiRecommendations: Array.isArray(recommendations)
      ? recommendations.map((r) => (typeof r === "string" ? r : r.text || r.recommendation || String(r)))
      : base.aiRecommendations,
    charts: {
      productSpike: productChart.length ? productChart : base.charts.productSpike,
      categoryGrowth: categoryChart.length ? categoryChart : base.charts.categoryGrowth,
      riskDistribution: riskChart.some((r) => r.value > 0) ? riskChart : base.charts.riskDistribution,
      procurementPriority: procChart.some((p) => p.count > 0)
        ? procChart
        : base.charts.procurementPriority,
    },
    requestMeta: {
      ...base.requestMeta,
      ...requestMeta,
      festival_name: festival,
    },
  };
}

export const FESTIVAL_OPTIONS = [
  "Diwali",
  "Pongal",
  "Ramadan",
  "Bakrid",
  "Christmas",
  "Tamil New Year",
];

export const FORECAST_YEARS = [2024, 2025, 2026];
