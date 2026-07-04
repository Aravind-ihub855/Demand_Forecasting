import { CheckCircle2, Lightbulb } from "lucide-react";
import {
  actionCard,
  actionIconBox,
  borderLight,
  card,
  iconBox,
  iconColor,
  textAccent,
  textBody,
  textHeading,
  textMuted,
} from "./themeClasses";
import { SectionCard } from "./SectionCard";

const INSIGHT_ACCENTS = [
  { box: "indigo", color: "indigo" },
  { box: "violet", color: "violet" },
  { box: "blue", color: "blue" },
  { box: "emerald", color: "emerald" },
];

function InsightCard({ insight, index = 0 }) {
  const accent = INSIGHT_ACCENTS[index % INSIGHT_ACCENTS.length];

  return (
    <div className={`${actionCard} insights-inner-item-card`}>
      <div className="flex items-start gap-3">
        <div className={iconBox[accent.box]}>
          <Lightbulb className={`h-4 w-4 ${iconColor[accent.color]}`} />
        </div>
        <div className={`text-[13px] leading-relaxed ${textBody}`}>{insight}</div>
      </div>
    </div>
  );
}

function ActionCard({ action, reason, index = 0 }) {
  return (
    <div className={`${actionCard} insights-inner-item-card`}>
      <div className="flex items-start gap-3">
        <div className={actionIconBox}>
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div>
          <span className={`text-[10px] font-bold ${textAccent}`}>
            Action {index + 1}
          </span>
          <div className={`mt-1 text-sm font-semibold ${textHeading}`}>{action}</div>
          <div className={`mt-2 text-[13px] leading-relaxed ${textBody}`}>{reason}</div>
        </div>
      </div>
    </div>
  );
}

export function BusinessInsightsSection({ insights = [] }) {
  return (
    <SectionCard
      title="Business Insights"
      subtitle="AI-derived strategic insights for retail planning"
      icon={Lightbulb}
      iconAccent="violet"
      className="insights-outer-card"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {insights.map((item, index) => (
          <InsightCard key={index} insight={item.insight} index={index} />
        ))}
      </div>
    </SectionCard>
  );
}

export function RecommendedActionsSection({ actions = [], supplyChainActions = [] }) {
  return (
    <div className="space-y-6">
      {/* Recommended Actions */}
      <div className={`${card} insights-outer-card`}>
        <div className={`flex items-center gap-3 border-b px-6 py-4 ${borderLight}`}>
          <div className={iconBox.emerald}>
            <CheckCircle2 className={`h-5 w-5 ${iconColor.emerald}`} />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${textHeading}`}>Recommended Actions</h2>
            <p className={`text-sm ${textMuted}`}>
              Executive recommendations for inventory and assortment planning
            </p>
          </div>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {actions.map((item, index) => (
            <ActionCard
              key={index}
              action={item.action}
              reason={item.reason}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Operational Warehouse Actions */}
      {supplyChainActions && supplyChainActions.length > 0 && (
        <div className={`${card} insights-outer-card`}>
          <div className={`flex items-center gap-3 border-b px-6 py-4 ${borderLight}`}>
            <div className={iconBox.indigo}>
              <CheckCircle2 className={`h-5 w-5 ${iconColor.indigo}`} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${textHeading}`}>Operational Warehouse Actions</h2>
              <p className={`text-sm ${textMuted}`}>
                Rule-based actions and mitigations for warehouse bottlenecks
              </p>
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            {supplyChainActions.map((item, index) => {
              const isHighPriority = item.priority?.toLowerCase() === "high" || item.priority?.toLowerCase() === "critical";
              return (
                <div key={index} className={`${actionCard} insights-inner-item-card`}>
                  <div className="flex items-start gap-3">
                    <div className={actionIconBox}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${textAccent}`}>
                          Action {index + 1}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isHighPriority
                            ? "bg-red-100 text-red-800 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-850"
                            : "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800"
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className={`mt-1 text-sm font-semibold ${textHeading}`}>{item.action || item.title}</div>
                      <div className={`mt-2 text-[13px] leading-relaxed ${textBody}`}>{item.description}</div>
                      {item.affected_products && (
                        <div className={`mt-2 text-[11px] font-semibold ${textMuted}`}>
                          Affected Products: <span className="text-indigo-600 dark:text-indigo-400">{item.affected_products}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
