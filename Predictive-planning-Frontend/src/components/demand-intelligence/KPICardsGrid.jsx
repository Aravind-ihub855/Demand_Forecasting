import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Package,
  Star,
} from "lucide-react";
import { card, emptyState, textHeading, textMuted } from "./themeClasses";

const KPI_ACCENTS = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-cyan-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

const KPI_ITEMS = [
  { key: "total_products_analyzed", label: "Total Products Analyzed", icon: Package },
  { key: "validated_products", label: "Validated Products", icon: CheckCircle2 },
  { key: "new_product_opportunities", label: "New Opportunities", icon: Lightbulb },
  { key: "top_priority_products", label: "Top Priority Products", icon: Star },
  { key: "critical_products", label: "Critical Products", icon: AlertTriangle, isCritical: true },
];

export default function KPICardsGrid({ kpis }) {
  if (!kpis) {
    return (
      <div className={`${card} border-dashed p-8 ${emptyState}`}>
        No KPI data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 5 KPI Cards in one single row on desktop/xl screens */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {KPI_ITEMS.map((item, index) => {
          const Icon = item.icon;
          // Use rose/red accent for critical products, otherwise rotate through standard accents
          const accent = item.isCritical ? "from-red-500 to-rose-600" : KPI_ACCENTS[index % KPI_ACCENTS.length];
          
          let value = kpis[item.key];
          if (value === undefined || value === null) {
            if (item.key === "total_products_analyzed") {
              value = kpis.festival_products;
            } else if (item.key === "validated_products") {
              value = kpis.historically_validated_products;
            }
          }

          return (
            <div
              key={item.key}
              className={`group ${card} p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/30`}
            >
              <div
                className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${accent} p-2.5 text-white shadow-lg`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                {item.label}
              </p>
              <p className={`mt-2 text-2xl font-bold tracking-tight ${textHeading}`}>
                {value ?? "—"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}



