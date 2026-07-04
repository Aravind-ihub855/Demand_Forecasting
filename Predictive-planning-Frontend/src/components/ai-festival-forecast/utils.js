export function formatTimestamp(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function parseUpliftPercent(value) {
  if (value == null) return 0;
  const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : 0;
}

export function getRiskStyles(level) {
  const normalized = String(level || "").toLowerCase();
  const map = {
    critical: {
      badge:
        "bg-red-100 text-red-800 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800/50",
      border: "border-red-200 dark:border-red-800/50",
      dot: "bg-red-500",
    },
    high: {
      badge:
        "bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-800/50",
      border: "border-orange-200 dark:border-orange-800/50",
      dot: "bg-orange-500",
    },
    medium: {
      badge:
        "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800/50",
      border: "border-amber-200 dark:border-amber-800/50",
      dot: "bg-amber-500",
    },
    low: {
      badge:
        "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/50",
      border: "border-emerald-200 dark:border-emerald-800/50",
      dot: "bg-emerald-500",
    },
  };
  return map[normalized] || map.medium;
}

export function getOpportunityScoreStyles(score) {
  if (score >= 90)
    return "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/50";
  if (score >= 80)
    return "bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-800/50";
  if (score >= 70)
    return "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800/50";
  return "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600";
}

export function getUpliftBadgeStyles() {
  return "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/50";
}

export function generateStrategicInsight(data) {
  const festival =
    data?.metadata?.festival || data?.summary?.festival_name || "Festival";
  const location =
    data?.metadata?.location ||
    data?.summary?.store_location ||
    "the selected store";
  const locationShort = location.split(",")[0]?.trim() || location;

  const products = data?.sections?.top_demand_products || [];
  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const categoryText =
    categories.length > 0
      ? categories.slice(0, 3).join(", ").toLowerCase()
      : "key product categories";

  const focus =
    data?.summary?.strategic_focus ||
    "Inventory planning should prioritize high-uplift products to avoid stockouts and maximize revenue opportunity.";

  return `${festival} demand in ${locationShort} will be driven primarily by ${categoryText}. ${focus}`;
}

const KPI_ICON_MAP = {
  demand_uplift: "TrendingUp",
  revenue_opportunity: "IndianRupee",
  confidence_score: "ShieldCheck",
  high_demand_products: "Package",
  new_opportunities: "Sparkles",
  inventory_risks: "AlertTriangle",
};

export function getKpiIconKey(key) {
  return KPI_ICON_MAP[key] || "BarChart3";
}
