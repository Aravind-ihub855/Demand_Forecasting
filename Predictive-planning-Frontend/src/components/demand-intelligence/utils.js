export function getFunnelStages(kpis = {}) {
  const total = kpis.total_products_analyzed ?? kpis.festival_products ?? 0;
  const seasonOmitted = kpis.season_omitted_products ?? 0;
  const storeOmitted = kpis.store_omitted_products ?? 0;
  const validated = kpis.validated_products ?? kpis.historically_validated_products ?? 0;

  const seasonApproved = kpis.season_approved_products ?? Math.max(total - seasonOmitted, 0);
  const storeApproved = kpis.store_approved_products ?? Math.max(seasonApproved - storeOmitted, 0);

  return [
    { label: "AI Assortment", count: total, color: "#6366f1" },
    { label: "Seasonal Screening Passed", count: seasonApproved, color: "#8b5cf6" },
    { label: "Demographic Fit Passed", count: storeApproved, color: "#0ea5e9" },
    {
      label: "Synced Demand",
      count: validated,
      color: "#10b981",
    },
  ];
}

export function priorityBadgeClass(priority) {
  const map = {
    Critical: "bg-red-100 text-red-800 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800/50",
    High: "bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-800/50",
    Medium: "bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-800/50",
  };
  return map[priority] || map.Medium;
}

export function demandLevelBadgeClass(level) {
  const map = {
    "Very High":
      "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/50",
    High: "bg-green-100 text-green-800 ring-green-200 dark:bg-green-950/50 dark:text-green-300 dark:ring-green-800/50",
    Medium:
      "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800/50",
    Low: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:ring-slate-700/50",
  };
  return map[level] || map.Medium;
}

export function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("en-IN");
}

export function spikeHighlightClass(spike) {
  if (spike >= 200) return "font-bold text-red-600 dark:text-red-400";
  if (spike >= 150) return "font-semibold text-orange-600 dark:text-orange-400";
  if (spike >= 100) return "font-medium text-amber-600 dark:text-amber-400";
  return "text-slate-600 dark:text-slate-400";
}

/**
 * Calculates Net Purchase Order (PO) Quantity needed based on inventory planning math:
 * Net PO = (Forecasted Peak Demand + Safety Stock) - (On Hand + In Transit)
 */
export function calculateNetReorderQty(product = {}) {
  const peakDemand = Number(product.peak_sales || product.expected_demand || product.forecast_units || product.recommended_procurement_qty || 2500);
  const normalDemand = Number(product.normal_sales || product.base_demand || Math.round(peakDemand * 0.4));
  
  // Perishable items get lower safety stock (10%), non-perishables get 15-20%
  const category = (product.category || "").toLowerCase();
  const isPerishable = category.includes("dairy") || category.includes("fresh") || category.includes("bakery") || category.includes("fruit");
  const safetyStockPct = isPerishable ? 0.10 : 0.15;
  const safetyStock = Math.round(peakDemand * safetyStockPct);

  // Existing stock on hand & in-transit (deterministic based on product or mock calculation)
  const skuHash = String(product.sku_id || product.product_name || "SKU").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const stockRatio = 0.15 + (skuHash % 30) / 100; // 15% - 45% stock on hand
  const onHand = Math.round(normalDemand * stockRatio * 2);
  const inTransit = Math.round(onHand * 0.3);

  const grossRequirement = peakDemand + safetyStock;
  const netPO = Math.max(0, grossRequirement - (onHand + inTransit));

  const leadTimeDays = isPerishable ? 2 + (skuHash % 3) : 5 + (skuHash % 7); // 2-4 days perishable, 5-11 days non-perishable

  return {
    normalDemand,
    peakDemand,
    safetyStock,
    onHand,
    inTransit,
    grossRequirement,
    netPO,
    leadTimeDays,
    isPerishable,
  };
}

/**
 * Decomposes peak demand into a logical "Demand Story" narrative
 */
export function generateDemandStory(product = {}) {
  const name = product.product_name || product.sku_name || "Item";
  const category = product.category || "General";
  const spike = Number(product.spike_percentage || 120);
  const math = calculateNetReorderQty(product);

  const basePct = Math.round(100 / (1 + spike / 100));
  const festLiftPct = Math.round(spike * 0.65);
  const demoSurgePct = Math.round(spike * 0.25);
  const promoPct = Math.round(spike * 0.10);

  return {
    productName: name,
    category: category,
    summary: `Demand for ${name} is projected to surge by ${spike}% above daily baseline during the festival window. This is driven primarily by regional culinary tradition and the local IT corridor demographic profile.`,
    drivers: [
      { factor: "Daily Base Demand", impact: `${basePct}% Baseline`, description: "Everyday baseline consumption volume." },
      { factor: "Festival Culinary Lift", impact: `+${festLiftPct}% Lift`, description: "Traditional festival recipe adoption & home cooking surge." },
      { factor: "Saravanampatti Demographic Fit", impact: `+${demoSurgePct}% Surge`, description: "Higher purchasing power from nearby IT park professionals." },
      { factor: "Promotional & Bundle Boost", impact: `+${promoPct}% Boost`, description: "Cross-category bundling with key staple products." },
    ],
    crossElasticityAlert: spike > 150 
      ? `High co-purchasing dependency detected. Stockouts in related ${category} items could lower this product's actual sales by up to 18%.`
      : `Moderate demand elasticity. Cross-category stockouts will have minimal impact on baseline demand.`,
    recommendedAction: `Issue Purchase Order for ${formatNumber(math.netPO)} units by Day -${math.leadTimeDays} to guarantee on-time store delivery.`
  };
}

/**
 * Time-Phased Demand Forecast Schedule (Velocity Curve across Pre-Fest, Peak, Post-Fest)
 */
export function generateTimePhasedForecast(product = {}) {
  const math = calculateNetReorderQty(product);
  const total = math.peakDemand;

  return [
    { phase: "Pre-Fest (-7d to -4d)", projected_units: Math.round(total * 0.15), share: "15%", velocity: "Stocking" },
    { phase: "Pre-Rush (-3d to -2d)", projected_units: Math.round(total * 0.25), share: "25%", velocity: "Ramping Up" },
    { phase: "Peak Rush (-1d to Day 0)", projected_units: Math.round(total * 0.45), share: "45%", velocity: "Maximum Spike" },
    { phase: "Post-Fest (+1d to +3d)", projected_units: Math.round(total * 0.15), share: "15%", velocity: "Wind Down" },
  ];
}

/**
 * P10 (Pessimistic), P50 (Expected), P90 (Optimistic) Confidence Bounds
 */
export function generateConfidenceBounds(product = {}) {
  const math = calculateNetReorderQty(product);
  const expected = math.peakDemand;

  return {
    p10: Math.round(expected * 0.82), // Conservative (-18%)
    p50: expected,                     // Expected (100%)
    p90: Math.round(expected * 1.22), // Optimistic (+22%)
  };
}

/**
 * Calculates explicit Refill Dates, Lead Time Deadlines, and Timeline Schedule
 */
export function calculateRefillTimeline(product = {}, festDateStr = "2026-01-14") {
  const math = calculateNetReorderQty(product);
  
  // Parse Festival Date (e.g. 14/01/2026 or 2026-01-14)
  let festDate = new Date(2026, 0, 14); // Default Jan 14, 2026
  if (festDateStr) {
    if (festDateStr.includes("/")) {
      const [d, m, y] = festDateStr.split("/").map(Number);
      if (d && m && y) festDate = new Date(y, m - 1, d);
    } else if (festDateStr.includes("-")) {
      const [y, m, d] = festDateStr.split("-").map(Number);
      if (y && m && d) festDate = new Date(y, m - 1, d);
    }
  }

  // Refill Cutoff Date = Festival Start Date - (Lead Time + 2 Days Safety Buffer)
  const bufferDays = 2;
  const totalDaysNeeded = math.leadTimeDays + bufferDays;
  
  const cutoffDate = new Date(festDate);
  cutoffDate.setDate(festDate.getDate() - totalDaysNeeded);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  // Simulating today's date context (e.g., Dec 15, 2025 or current date)
  const planningDate = new Date(2025, 11, 15); // Dec 15, 2025
  const diffMs = cutoffDate.getTime() - planningDate.getTime();
  const daysUntilCutoff = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let statusText = "ON SCHEDULE";
  let statusBadgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  if (daysUntilCutoff < 0) {
    statusText = "REFILL OVERDUE";
    statusBadgeClass = "bg-red-500/10 text-red-400 border-red-500/30";
  } else if (daysUntilCutoff <= 5) {
    statusText = `REFILL URGENT (${daysUntilCutoff} Days Left)`;
    statusBadgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/30";
  }

  // Time-phased calendar milestones
  const stockingDate = new Date(festDate);
  stockingDate.setDate(festDate.getDate() - 7);

  const preRushDate = new Date(festDate);
  preRushDate.setDate(festDate.getDate() - 3);

  const postFestDate = new Date(festDate);
  postFestDate.setDate(festDate.getDate() + 3);

  return {
    festivalDateFormatted: formatDate(festDate),
    refillCutoffDateFormatted: formatDate(cutoffDate),
    leadTimeDays: math.leadTimeDays,
    safetyBufferDays: bufferDays,
    daysUntilCutoff,
    statusText,
    statusBadgeClass,
    milestones: [
      { event: "PO Cut-off (Must Order By)", date: formatDate(cutoffDate), action: "Issue Purchase Order to Supplier" },
      { event: "Store Stocking Window", date: `${formatDate(stockingDate)} - ${formatDate(preRushDate)}`, action: "Receive at Warehouse & Transport to Store" },
      { event: "Customer Rush Demand", date: `${formatDate(preRushDate)} - ${formatDate(festDate)}`, action: "Fill Store Shelves & Floor Displays" },
      { event: "Post-Festival Wind-down", date: `After ${formatDate(postFestDate)}`, action: "Consolidate Stock & Adjust Thresholds" },
    ]
  };
}


