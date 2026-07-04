import { CalendarRange, Target, TrendingUp, Zap } from "lucide-react";

export default function ExecutiveSummary({ summary }) {
  if (!summary) return null;

  const items = [
    {
      label: "Festival Name",
      value: summary.festival_name,
      icon: Zap,
      accent:
        "text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/15",
    },
    {
      label: "Forecast Period",
      value: summary.forecast_period,
      icon: CalendarRange,
      accent:
        "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-500/15",
    },
    {
      label: "Expected Demand Uplift",
      value: summary.expected_demand_uplift,
      icon: TrendingUp,
      accent:
        "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/15",
    },
    {
      label: "Forecast Confidence",
      value: summary.forecast_confidence,
      icon: Target,
      accent:
        "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/15",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50 shadow-xl shadow-indigo-100/50 dark:border-[#19345f] dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 dark:shadow-black/30">
      <div className="border-b border-indigo-100 px-6 py-5 dark:border-white/10">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          Executive Summary
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
          Strategic Forecast Overview
        </h2>
      </div>

      <div className="grid gap-px bg-indigo-100/60 sm:grid-cols-2 lg:grid-cols-4 dark:bg-white/10">
        {items.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className="bg-white/80 px-6 py-5 backdrop-blur-sm dark:bg-slate-900/40"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${accent}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {value || "—"}
            </p>
          </div>
        ))}
      </div>

      {summary.strategic_focus && (
        <div className="border-t border-indigo-100 px-6 py-5 dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            Strategic Focus
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-200">
            {summary.strategic_focus}
          </p>
        </div>
      )}
    </div>
  );
}
