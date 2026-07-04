import {
  CalendarDays,
  RotateCcw,
  ShieldCheck,
  Store,
  Clock,
  CalendarRange,
  Zap,
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
  const festival = summary?.festival ?? "—";
  const store = summary?.store ?? "—";
  const festivalPeriod = summary?.festival_period ?? "—";
  const planningDate = formatDateToUI(summary?.planning_date);
  const daysRemaining = summary?.days_remaining != null ? `${summary.days_remaining} Days` : "—";
  const confidence = summary?.forecast_confidence ?? "—";

  const getConfidenceBadgeColor = (val) => {
    if (val.toLowerCase().includes("high")) {
      return "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/50";
    }
    if (val.toLowerCase().includes("medium")) {
      return "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800/50";
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
        <div className={`flex flex-col justify-between rounded-xl p-4 border border-slate-100 dark:border-[#19345f]/50 ${surfaceMuted}`}>
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className={`h-4 w-4 ${iconColor.indigo}`} />
            <span className={`text-[11px] font-medium uppercase tracking-wider ${textMuted}`}>Festival</span>
          </div>
          <p className={`text-sm font-bold truncate ${textHeading}`} title={festival}>
            {festival}
          </p>
        </div>

        {/* Card 2: Store */}
        <div className={`flex flex-col justify-between rounded-xl p-4 border border-slate-100 dark:border-[#19345f]/50 ${surfaceMuted}`}>
          <div className="flex items-center gap-2 mb-2">
            <Store className={`h-4 w-4 ${iconColor.violet}`} />
            <span className={`text-[11px] font-medium uppercase tracking-wider ${textMuted}`}>Store</span>
          </div>
          <p className={`text-sm font-bold truncate ${textHeading}`} title={store}>
            {store}
          </p>
        </div>

        {/* Card 3: Festival Period */}
        <div className={`flex flex-col justify-between rounded-xl p-4 border border-slate-100 dark:border-[#19345f]/50 ${surfaceMuted}`}>
          <div className="flex items-center gap-2 mb-2">
            <CalendarRange className={`h-4 w-4 ${iconColor.blue}`} />
            <span className={`text-[11px] font-medium uppercase tracking-wider ${textMuted}`}>Festival Period</span>
          </div>
          <p className={`text-xs font-bold ${textHeading}`}>
            {festivalPeriod}
          </p>
        </div>

        {/* Card 4: Planning Date */}
        <div className={`flex flex-col justify-between rounded-xl p-4 border border-slate-100 dark:border-[#19345f]/50 ${surfaceMuted}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className={`h-4 w-4 ${iconColor.orange}`} />
            <span className={`text-[11px] font-medium uppercase tracking-wider ${textMuted}`}>Planning Date</span>
          </div>
          <p className={`text-sm font-bold ${textHeading}`}>
            {planningDate}
          </p>
        </div>

        {/* Card 5: Days Remaining */}
        <div className={`flex flex-col justify-between rounded-xl p-4 border border-slate-100 dark:border-[#19345f]/50 ${surfaceMuted}`}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className={`h-4 w-4 ${iconColor.red}`} />
            <span className={`text-[11px] font-medium uppercase tracking-wider ${textMuted}`}>Days Remaining</span>
          </div>
          <p className={`text-sm font-bold ${textHeading}`}>
            {daysRemaining}
          </p>
        </div>

        {/* Card 6: Forecast Confidence */}
        <div className={`flex flex-col justify-between rounded-xl p-4 border border-slate-100 dark:border-[#19345f]/50 ${surfaceMuted}`}>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className={`h-4 w-4 ${iconColor.emerald}`} />
            <span className={`text-[11px] font-medium uppercase tracking-wider ${textMuted}`}>Confidence</span>
          </div>
          <div>
            <span className={`${badge} ${getConfidenceBadgeColor(confidence)} text-[11px]`}>
              {confidence}
            </span>
          </div>
        </div>
      </div>
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
