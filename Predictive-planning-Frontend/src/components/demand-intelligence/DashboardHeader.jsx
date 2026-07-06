import { useState } from "react";
import {
  CalendarDays,
  RotateCcw,
  ShieldCheck,
  Store,
  Clock,
  CalendarRange,
  Zap,
  MapPin,
  Maximize2,
  Percent,
  Activity,
  Truck,
  RefreshCw,
  Compass,
  Users,
} from "lucide-react";
import {
  btnSecondary,
  card,
  iconColor,
  surfaceMuted,
  textAccent,
  textHeading,
  textMuted,
  badge,
} from "./themeClasses";

const STORE_DETAILS = {
  "Store 1": {
    store_id: "DM-GDP-01",
    store_name: "Store 1",
    location: "Location 1",
    store_type: "Urban Retail Store",
    size_sqft: 35000,
    avg_daily_footfall: 3500,
    active_skus: 5500,
    capacity_units: 18000,
    avg_daily_sales_units: 8500,
    replenishment_frequency: "Twice Daily",
    target_fill_rate: 0.98,
    assigned_warehouse: "WH-CBE-N01",
    secondary_warehouse: "WH-CBE-S01",
    customer_segment: "Office Workers, Daily Commuters, Families",
    demographic_type: "urban_commuter",
    premium_sku_share: 0.25,
    staples_sku_share: 0.35,
    wh_distance_km: 10,
    wh_travel_time_min: 25,
    footfall_weekday_peak: "morning_evening",
    lat: 11.0168,
    lon: 76.9558
  },
  "Store 2": {
    store_id: "DM-SGL-01",
    store_name: "Store 2",
    location: "Location 2",
    store_type: "Residential Store",
    size_sqft: 25000,
    avg_daily_footfall: 2500,
    active_skus: 4500,
    capacity_units: 14000,
    avg_daily_sales_units: 5800,
    replenishment_frequency: "Daily",
    target_fill_rate: 0.97,
    assigned_warehouse: "WH-CBE-S01",
    secondary_warehouse: "WH-CBE-N01",
    customer_segment: "Residential Families, Homemakers",
    demographic_type: "residential",
    premium_sku_share: 0.2,
    staples_sku_share: 0.45,
    wh_distance_km: 8,
    wh_travel_time_min: 15,
    footfall_weekday_peak: "morning",
    lat: 11.0072,
    lon: 77.0366
  },
  "Store 3": {
    store_id: "DM-RSP-01",
    store_name: "Store 3",
    location: "Location 3",
    store_type: "Premium Residential Store",
    size_sqft: 28000,
    avg_daily_footfall: 2800,
    active_skus: 4800,
    capacity_units: 15000,
    avg_daily_sales_units: 6500,
    replenishment_frequency: "Daily",
    target_fill_rate: 0.97,
    assigned_warehouse: "WH-CBE-N01",
    secondary_warehouse: "WH-CBE-S01",
    customer_segment: "Premium Families, Professionals, Health-Conscious",
    demographic_type: "premium_residential",
    premium_sku_share: 0.45,
    staples_sku_share: 0.25,
    wh_distance_km: 12,
    wh_travel_time_min: 30,
    footfall_weekday_peak: "evening",
    lat: 11.0021,
    lon: 76.9526
  },
  "Store 4": {
    store_id: "DM-PLC-01",
    store_name: "Store 4",
    location: "Location 4",
    store_type: "Semi-Urban Store",
    size_sqft: 22000,
    avg_daily_footfall: 1800,
    active_skus: 3800,
    capacity_units: 12000,
    avg_daily_sales_units: 4500,
    replenishment_frequency: "Alternate Day",
    target_fill_rate: 0.95,
    assigned_warehouse: "WH-CBE-S01",
    secondary_warehouse: "WH-CBE-N01",
    customer_segment: "Rural Families, Farmers, Budget-Conscious",
    demographic_type: "semi_urban_rural",
    premium_sku_share: 0.1,
    staples_sku_share: 0.6,
    wh_distance_km: 28,
    wh_travel_time_min: 40,
    footfall_weekday_peak: "morning",
    lat: 10.6594,
    lon: 77.0172
  },
  "Store 5": {
    store_id: "DM-SVP-01",
    store_name: "Store 5",
    location: "Location 5",
    store_type: "IT Corridor Store",
    size_sqft: 40000,
    avg_daily_footfall: 4000,
    active_skus: 6000,
    capacity_units: 20000,
    avg_daily_sales_units: 10000,
    replenishment_frequency: "Twice Daily",
    target_fill_rate: 0.99,
    assigned_warehouse: "WH-CBE-N01",
    secondary_warehouse: "WH-CBE-S01",
    customer_segment: "IT Employees, Students, Working Professionals",
    demographic_type: "it_corridor",
    premium_sku_share: 0.3,
    staples_sku_share: 0.3,
    wh_distance_km: 2,
    wh_travel_time_min: 5,
    footfall_weekday_peak: "lunch_evening",
    lat: 11.0733,
    lon: 77.0151
  }
};

// Helper to format date YYYY-MM-DD to DD/MM/YYYY
function formatDateToUI(dateStr) {
  if (!dateStr) return "—";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

export default function DashboardHeader({ summary, onReset }) {
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const festival = summary?.festival ?? "—";
  const store = summary?.store ?? "—";
  const festivalPeriod = summary?.festival_period ?? "—";
  const planningDate = formatDateToUI(summary?.planning_date);
  const daysRemaining = summary?.days_remaining != null ? `${summary.days_remaining} Days` : "—";
  const confidence = summary?.forecast_confidence ?? "—";

  const storeKey = Object.keys(STORE_DETAILS).find(k => 
    k.toLowerCase() === store.toLowerCase() ||
    store.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(store.toLowerCase()) ||
    STORE_DETAILS[k].store_id.toLowerCase() === store.toLowerCase()
  );
  const storeInfo = storeKey ? STORE_DETAILS[storeKey] : null;

  const getConfidenceBadgeColor = (val) => {
    if (val.toLowerCase().includes("high")) {
      return "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/50";
    }
    if (val.toLowerCase().includes("medium")) {
      return "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-emerald-800/50";
    }
    return "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:ring-slate-700/50";
  };

  return (
    <div className={`${card} p-6 space-y-6`}>
      {/* Title block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest ${textAccent}`}>
            Executive Demand Intelligence
          </p>
          <h1 className={`mt-1 text-2xl font-bold tracking-tight sm:text-3xl ${textHeading}`}>
            Demand Intelligence Workspace
          </h1>
        </div>

        {onReset && (
          <button type="button" onClick={onReset} className={`${btnSecondary} self-start sm:self-auto`}>
            <RotateCcw className="h-4 w-4" />
            New Analysis
          </button>
        )}
      </div>

      {/* 6 Info Cards Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {/* Card 1: Festival */}
        <div className="flex flex-col justify-between rounded-2xl p-4 border border-t-4 border-t-indigo-500 border-slate-200/80 bg-white dark:border-[#19345f]/40 dark:bg-[#0c1a33]/60 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-default relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <CalendarDays className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Festival</span>
          </div>
          <p className={`text-base font-bold text-slate-800 dark:text-white truncate ${textHeading}`} title={festival}>
            {festival}
          </p>
        </div>

        {/* Card 2: Store */}
        <div 
          onClick={() => {
            if (storeInfo) setShowStoreDetails(prev => !prev);
          }}
          className="flex flex-col justify-between rounded-2xl p-4 border border-t-4 border-t-violet-500 border-slate-200/80 bg-white dark:border-[#19345f]/40 dark:bg-[#0c1a33]/60 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 select-none cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-50 text-violet-650 dark:bg-violet-950/50 dark:text-violet-400">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store</span>
            </div>
            {storeInfo && (
              <span className="text-[10px] text-violet-650 dark:text-violet-400 font-extrabold hover:underline">
                {showStoreDetails ? "Hide" : "Details"}
              </span>
            )}
          </div>
          <p className={`text-base font-bold text-slate-800 dark:text-white truncate ${textHeading}`} title={store}>
            {store}
          </p>
        </div>

        {/* Card 3: Festival Period */}
        <div className="flex flex-col justify-between rounded-2xl p-4 border border-t-4 border-t-blue-500 border-slate-200/80 bg-white dark:border-[#19345f]/40 dark:bg-[#0c1a33]/60 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-default relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <CalendarRange className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Festival Period</span>
          </div>
          <p className={`text-xs font-bold text-slate-800 dark:text-white ${textHeading}`}>
            {festivalPeriod}
          </p>
        </div>

        {/* Card 4: Planning Date */}
        <div className="flex flex-col justify-between rounded-2xl p-4 border border-t-4 border-t-amber-500 border-slate-200/80 bg-white dark:border-[#19345f]/40 dark:bg-[#0c1a33]/60 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-default relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planning Date</span>
          </div>
          <p className={`text-base font-bold text-slate-800 dark:text-white ${textHeading}`}>
            {planningDate}
          </p>
        </div>

        {/* Card 5: Days Remaining */}
        <div className="flex flex-col justify-between rounded-2xl p-4 border border-t-4 border-t-rose-500 border-slate-200/80 bg-white dark:border-[#19345f]/40 dark:bg-[#0c1a33]/60 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-default relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Days Remaining</span>
          </div>
          <p className={`text-base font-bold text-slate-800 dark:text-white ${textHeading}`}>
            {daysRemaining}
          </p>
        </div>

        {/* Card 6: Confidence */}
        <div className="flex flex-col justify-between rounded-2xl p-4 border border-t-4 border-t-emerald-500 border-slate-200/80 bg-white dark:border-[#19345f]/40 dark:bg-[#0c1a33]/60 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-default relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence</span>
          </div>
          <div>
            <span className={`${badge} ${getConfidenceBadgeColor(confidence)} text-[11px]`}>
              {confidence}
            </span>
          </div>
        </div>
      </div>

      {/* Collapsible Store Details */}
      {showStoreDetails && storeInfo && (
        <div className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/20 via-white to-indigo-50/10 p-6 dark:border-[#19345f]/50 dark:from-[#0f2344]/30 dark:to-[#0c1a33]/30 shadow-lg shadow-violet-100/5 dark:shadow-none animate-fadeIn">
          {/* Header block with Store Type Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-100/60 text-violet-650 dark:bg-violet-950/40 dark:text-violet-400">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#eef5ff]">
                  {storeInfo.store_name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">Store ID: {storeInfo.store_id}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-850 dark:bg-violet-950/50 dark:text-violet-300">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              {storeInfo.store_type}
            </span>
          </div>

          {/* Grid of Mini Detail Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            
            {/* Location */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white/60 dark:border-slate-800/45 dark:bg-[#0c1a33]/40">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{storeInfo.location}</p>
              </div>
            </div>

            {/* Demographic Profile */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white/60 dark:border-slate-800/45 dark:bg-[#0c1a33]/40">
              <div className="p-2 rounded-lg bg-violet-50 text-violet-650 dark:bg-violet-950/50 dark:text-violet-400">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demographics</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate capitalize">{storeInfo.demographic_type?.replace(/_/g, " ")}</p>
              </div>
            </div>

            {/* Size (Sq. Ft.) */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white/60 dark:border-slate-800/45 dark:bg-[#0c1a33]/40">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Maximize2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Size</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{storeInfo.size_sqft?.toLocaleString()} sqft</p>
              </div>
            </div>

            {/* Target Fill Rate */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white/60 dark:border-slate-800/45 dark:bg-[#0c1a33]/40">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Percent className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Fill Rate</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{(storeInfo.target_fill_rate * 100).toFixed(0)}%</p>
              </div>
            </div>

            {/* Avg Daily Footfall */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white/60 dark:border-slate-800/45 dark:bg-[#0c1a33]/40">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Footfall</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{storeInfo.avg_daily_footfall?.toLocaleString()} / day</p>
              </div>
            </div>

            {/* Logistics (Primary WH) */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white/60 dark:border-slate-800/45 dark:bg-[#0c1a33]/40 sm:col-span-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <Truck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logistics (Primary WH)</p>
                <p className="text-xs font-bold text-slate-850 dark:text-white truncate">{storeInfo.assigned_warehouse} ({storeInfo.wh_distance_km} km, ~{storeInfo.wh_travel_time_min}m)</p>
              </div>
            </div>

            {/* Replenishment Frequency */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white/60 dark:border-slate-800/45 dark:bg-[#0c1a33]/40">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Replenishment</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{storeInfo.replenishment_frequency}</p>
              </div>
            </div>

            {/* Customer Segment */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white/60 dark:border-slate-800/45 dark:bg-[#0c1a33]/40 sm:col-span-4">
              <div className="p-2 rounded-lg bg-[#f0fdfa]/60 text-emerald-600 dark:bg-teal-950/40 dark:text-teal-450">
                <Compass className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Segment</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-relaxed">{storeInfo.customer_segment}</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export function ExecutiveSummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50 shadow-xl shadow-indigo-100/50 dark:border-[#19345f] dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 dark:shadow-black/30">
      <div className="border-b border-indigo-100 px-6 py-5 dark:border-white/10">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          Executive Summary
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
          Strategic Demand Overview
        </h2>
      </div>

      <div className="grid gap-px bg-indigo-100/60 sm:grid-cols-3 dark:bg-white/10">
        <div className="bg-white/80 px-6 py-5 backdrop-blur-sm dark:bg-slate-900/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
            Overall Demand Outlook
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-200">
            {summary.overall_demand_outlook}
          </p>
        </div>
        <div className="bg-white/80 px-6 py-5 backdrop-blur-sm dark:bg-slate-900/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
            Key Finding
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-200">
            {summary.key_finding}
          </p>
        </div>
        <div className="bg-white/80 px-6 py-5 backdrop-blur-sm dark:bg-slate-900/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
            Forecast Confidence
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {summary.forecast_confidence}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Based on historical validation layers
          </p>
        </div>
      </div>
    </div>
  );
}
