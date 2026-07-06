import { useState } from "react";
import {
  X,
  FileText,
  Calculator,
  TrendingUp,
  Clock,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  calculateNetReorderQty,
  generateDemandStory,
  generateTimePhasedForecast,
  generateConfidenceBounds,
  calculateRefillTimeline,
  formatNumber,
} from "./utils";

const COLORS = ["#6366f1", "#0284c7", "#10b981", "#ef4444"];

export default function ProductDemandStoryModal({ product, onClose }) {
  if (!product) return null;

  const math = calculateNetReorderQty(product);
  const story = generateDemandStory(product);
  const velocity = generateTimePhasedForecast(product);
  const bounds = generateConfidenceBounds(product);
  const timeline = calculateRefillTimeline(product);

  const productName = product.product_name || product.sku_name || "Product";
  const category = product.category || "General";
  const skuId = product.sku_id || "SKU-AUTO";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl p-6 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                {category}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{skuId}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${timeline.statusBadgeClass}`}>
                {timeline.statusText}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {productName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive Demand Prediction & Refill Timeline Blueprint
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Highlight Banner: Net Purchase Order Recommendation & Refill Cutoff */}
        <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-slate-800/60 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                Recommended Net Purchase Order (PO)
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatNumber(math.netPO)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">units</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400 block">Vendor Lead Time</span>
              <span className="font-semibold text-amber-700 dark:text-amber-400">{math.leadTimeDays} Days</span>
            </div>
            <div className="text-right border-l border-slate-200 dark:border-slate-700 pl-4">
              <span className="text-slate-500 dark:text-slate-400 block">Refill Cut-off Deadline</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{timeline.refillCutoffDateFormatted}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Must reorder before this date</span>
            </div>
          </div>
        </div>

        {/* Grid Section 1: Inventory Reorder Math Breakdown */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              1. Purchase Order Math Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4  gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Forecasted Peak</span>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {formatNumber(math.peakDemand)}
              </p>
              <span className="text-[10px] text-slate-500">Gross Unit Demand</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Safety Stock Buffer</span>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                +{formatNumber(math.safetyStock)}
              </p>
              <span className="text-[10px] text-slate-500">+{math.isPerishable ? "10%" : "15%"} Risk Buffer</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Store On-Hand</span>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                -{formatNumber(math.onHand)}
              </p>
              <span className="text-[10px] text-slate-500">Current Stock</span>
            </div>

            {/* <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">In-Transit Stock</span>
              <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                -{formatNumber(math.inTransit)}
              </p>
              <span className="text-[10px] text-slate-500">En-route POs</span>
            </div> */}

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 col-span-2 sm:col-span-1">
              <span className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold">Net PO Units</span>
              <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                ={formatNumber(math.netPO)}
              </p>
              <span className="text-[10px] text-emerald-800/80 dark:text-emerald-400/80 font-medium">Net Order Needed</span>
            </div>
          </div>
        </div>

        {/* Grid Section 2: Demand Story (Drivers Waterfall) */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              2. Demand Story & Driver Breakdown
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 mb-3">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {story.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {story.drivers.map((driver, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {driver.factor}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                      {driver.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    {driver.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <span>{story.crossElasticityAlert}</span>
          </div>
        </div>

        {/* Section 3: Replenishment Timeline & Calendar Milestones */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                3. Replenishment Timeline & Refill Deadlines
              </h3>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Festival Date: <strong className="text-slate-900 dark:text-white">{timeline.festivalDateFormatted}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {timeline.milestones.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
                  idx === 0
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-semibold tracking-wide uppercase opacity-90">
                      {m.event}
                    </span>
                    {idx === 0 && <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white font-mono mt-1">
                    {m.date}
                  </p>
                </div>
                <p className="text-[10px] opacity-80 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  {m.action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Section 4 & 5: Time Phased Schedule & Confidence Bounds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Time Phased Schedule (2 cols) */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                4. Time-Phased Demand Velocity
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                  <XAxis dataKey="phase" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                    itemStyle={{ color: "#38bdf8" }}
                  />
                  <Bar dataKey="projected_units" radius={[6, 6, 0, 0]}>
                    {velocity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Confidence Bounds (1 col) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                5. Forecast Risk Bounds
              </h3>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">P10 (Pessimistic)</span>
                  <p className="text-[10px] text-slate-500">Conservative Downside</p>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-300 font-mono">
                  {formatNumber(bounds.p10)} units
                </span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">P50 (Expected)</span>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400/80">Primary Target</p>
                </div>
                <span className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300 font-mono">
                  {formatNumber(bounds.p50)} units
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">P90 (Optimistic)</span>
                  <p className="text-[10px] text-slate-500">Maximum Upside Surge</p>
                </div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                  {formatNumber(bounds.p90)} units
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>AI Demand Intelligence System v2.4</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
          >
            Close Story
          </button>
        </div>
      </div>
    </div>
  );
}
