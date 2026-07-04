import { TrendingUp } from "lucide-react";
import { generateStrategicInsight } from "./utils";

export default function StrategicInsight({ data }) {
  const insight = generateStrategicInsight(data);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 shadow-xl shadow-indigo-100/60 sm:p-8 dark:border-indigo-800/40 dark:from-indigo-600 dark:via-indigo-700 dark:to-violet-800 dark:shadow-indigo-500/20">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-indigo-200/50 blur-2xl dark:bg-white/10" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-violet-200/40 blur-2xl dark:bg-violet-400/20" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-white/15 dark:backdrop-blur-sm">
          <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700 dark:text-indigo-200">
            Strategic Insight
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg dark:text-indigo-50">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}
