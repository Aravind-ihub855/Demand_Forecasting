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
