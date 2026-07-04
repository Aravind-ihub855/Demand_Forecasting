import { CheckCircle2, ClipboardList } from "lucide-react";
import {
  actionCard,
  actionIconBox,
  borderLight,
  card,
  emptyState,
  iconBox,
  iconColor,
  textAccent,
  textBody,
  textHeading,
} from "./themeClasses";

export default function RecommendedActions({ actions = [] }) {
  return (
    <div className={`h-full ${card}`}>
      <div className={`flex items-center gap-3 border-b px-6 py-4 ${borderLight}`}>
        <div className={iconBox.emerald}>
          <ClipboardList className={`h-5 w-5 ${iconColor.emerald}`} />
        </div>
        <h2 className={`text-lg font-bold ${textHeading}`}>Recommended Actions</h2>
      </div>

      <div className="space-y-4 p-6">
        {!actions.length ? (
          <p className={emptyState}>No recommended actions available.</p>
        ) : (
          actions.map((item, index) => (
            <div key={item.action} className={actionCard}>
              <div className="flex items-start gap-3">
                <div className={actionIconBox}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className={`text-xs font-bold ${textAccent}`}>
                    Action {index + 1}
                  </span>
                  <h3 className={`mt-1 font-semibold ${textHeading}`}>
                    {item.action}
                  </h3>
                  <p className={`mt-2 text-sm leading-relaxed ${textBody}`}>
                    {item.action_description}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
