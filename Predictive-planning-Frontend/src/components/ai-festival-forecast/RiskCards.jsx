import { AlertTriangle, Building2, ShieldAlert } from "lucide-react";
import {
  card,
  iconBox,
  iconColor,
  riskCard,
  surfaceMutedSoft,
  textBody,
  textHeading,
  textMuted,
} from "./themeClasses";
import { getRiskStyles } from "./utils";

function InventoryRiskCard({ risk }) {
  const styles = getRiskStyles(risk.risk_level);

  return (
    <div className={`${riskCard} ${styles.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
            Product
          </p>
          <p className={`mt-1 font-semibold ${textHeading}`}>
            {risk.product_name}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${styles.badge}`}
        >
          {risk.risk_level}
        </span>
      </div>
      <div className="mt-4">
        <p className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
          Mitigation Strategy
        </p>
        <p className={`mt-1 text-sm leading-relaxed ${textBody}`}>
          {risk.mitigation_strategy}
        </p>
      </div>
    </div>
  );
}

function SupplierRiskCard({ risk }) {
  return (
    <div className={`${riskCard} border-slate-200 dark:border-[#19345f]`}>
      <div className="flex items-start gap-3">
        <div className={iconBox.orange}>
          <Building2 className={`h-4 w-4 ${iconColor.orange}`} />
        </div>
        <div>
          <p className={`font-semibold ${textHeading}`}>{risk.supplier_name}</p>
          <p className={`mt-2 text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
            Risk Factor
          </p>
          <p className={`mt-1 text-sm ${textBody}`}>{risk.risk_factor}</p>
          <p className={`mt-3 text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
            Impact
          </p>
          <p className={`mt-1 text-sm leading-relaxed ${textBody}`}>
            {risk.impact}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RiskCards({
  inventoryRisks = [],
  supplierRisks = [],
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${card} ${surfaceMutedSoft} p-6 !bg-slate-50/50 dark:!bg-[#0f2344]/30`}>
        <div className="mb-4 flex items-center gap-3">
          <div className={iconBox.red}>
            <AlertTriangle className={`h-5 w-5 ${iconColor.red}`} />
          </div>
          <h2 className={`text-lg font-bold ${textHeading}`}>Inventory Risks</h2>
        </div>
        <div className="space-y-4">
          {inventoryRisks.length ? (
            inventoryRisks.map((risk) => (
              <InventoryRiskCard key={risk.product_name} risk={risk} />
            ))
          ) : (
            <p className={`text-sm ${textMuted}`}>No inventory risks identified.</p>
          )}
        </div>
      </div>

      <div className={`${card} ${surfaceMutedSoft} p-6 !bg-slate-50/50 dark:!bg-[#0f2344]/30`}>
        <div className="mb-4 flex items-center gap-3">
          <div className={iconBox.orange}>
            <ShieldAlert className={`h-5 w-5 ${iconColor.orange}`} />
          </div>
          <h2 className={`text-lg font-bold ${textHeading}`}>Supplier Risks</h2>
        </div>
        <div className="space-y-4">
          {supplierRisks.length ? (
            supplierRisks.map((risk) => (
              <SupplierRiskCard key={risk.supplier_name} risk={risk} />
            ))
          ) : (
            <p className={`text-sm ${textMuted}`}>No supplier risks identified.</p>
          )}
        </div>
      </div>
    </div>
  );
}
