import { Lightbulb } from "lucide-react";
import {
  borderLight,
  card,
  divideLight,
  emptyState,
  iconBox,
  iconColor,
  tableHead,
  tableRowHover,
  textBody,
  textHeading,
  textMuted,
} from "./themeClasses";
import { getOpportunityScoreStyles } from "./utils";

export default function OpportunitiesTable({ opportunities = [] }) {
  return (
    <div className={`h-full ${card}`}>
      <div className={`flex items-center gap-3 border-b px-6 py-4 ${borderLight}`}>
        <div className={iconBox.violet}>
          <Lightbulb className={`h-5 w-5 ${iconColor.violet}`} />
        </div>
        <h2 className={`text-lg font-bold ${textHeading}`}>
          New Product Opportunities
        </h2>
      </div>

      {!opportunities.length ? (
        <div className={`px-6 py-12 ${emptyState}`}>No opportunities identified.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className={tableHead}>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                  Product Name
                </th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                  Opportunity Score
                </th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                  Reasoning
                </th>
              </tr>
            </thead>
            <tbody className={divideLight}>
              {opportunities.map((item) => (
                <tr key={item.product_name} className={tableRowHover}>
                  <td className={`px-6 py-4 font-semibold ${textHeading}`}>
                    {item.product_name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${getOpportunityScoreStyles(item.opportunity_score)}`}
                    >
                      {item.opportunity_score}
                    </span>
                  </td>
                  <td className={`px-6 py-4 leading-relaxed ${textBody}`}>
                    {item.reasoning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
