import {
  AlertTriangle,
  BarChart3,
  IndianRupee,
  Package,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { card, emptyState, textHeading, textMuted } from "./themeClasses";
import { getKpiIconKey } from "./utils";

const ICONS = {
  TrendingUp,
  IndianRupee,
  ShieldCheck,
  Package,
  Sparkles,
  AlertTriangle,
  BarChart3,
};

const KPI_ACCENTS = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-cyan-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
];

export default function KPICards({ kpis = [] }) {
  if (!kpis.length) {
    return (
      <div className={`${card} border-dashed p-8 ${emptyState}`}>
        No KPI data available.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {kpis.map((kpi, index) => {
        const iconKey = getKpiIconKey(kpi.key);
        const Icon = ICONS[iconKey] || BarChart3;
        const accent = KPI_ACCENTS[index % KPI_ACCENTS.length];

        return (
          <div
            key={kpi.key || kpi.label}
            className={`group ${card} p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/30`}
          >
            <div
              className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${accent} p-2.5 text-white shadow-lg`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
              {kpi.label}
            </p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${textHeading}`}>
              {kpi.value ?? "—"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
