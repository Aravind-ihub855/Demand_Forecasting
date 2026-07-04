import { Filter } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { surfaceMuted, textHeading, textMuted } from "./themeClasses";
import { getFunnelStages } from "./utils";

export default function ProductFilterFunnel({ kpis }) {
  const stages = getFunnelStages(kpis);
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <SectionCard
      title="Product Filter Funnel"
      subtitle="Multi-layer classification from festival assortment to validated demand"
      icon={Filter}
      iconAccent="violet"
    >
      <div className="mx-auto max-w-2xl space-y-3">
        {stages.map((stage, index) => {
          const widthPct = Math.max((stage.count / maxCount) * 100, 28);
          const dropOff =
            index > 0 ? stages[index - 1].count - stage.count : null;

          return (
            <div key={stage.label} className="relative">
              {index > 0 && (
                <div className="flex justify-center py-1">
                  <div className={`flex flex-col items-center ${textMuted}`}>
                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                    <span className="text-xs font-medium">
                      −{dropOff} filtered
                    </span>
                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                  </div>
                </div>
              )}
              <div
                className="mx-auto transition-all duration-500"
                style={{ width: `${widthPct}%` }}
              >
                <div
                  className="rounded-xl px-5 py-4 text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${stage.color}, ${stage.color}dd)`,
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p
                      className="text-sm font-medium leading-snug"
                      style={{ color: "#ffffff", opacity: 0.9 }}
                    >
                      {stage.label}
                    </p>
                    <p className="text-2xl font-bold">{stage.count}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stages.map((stage) => (
          <div
            key={stage.label}
            className={`rounded-lg border border-slate-200 px-3 py-2 text-center dark:border-[#19345f]/70 ${surfaceMuted}`}
          >
            <p className={`text-lg font-bold ${textHeading}`}>{stage.count}</p>
            <p className={`text-xs ${textMuted}`}>{stage.label}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
