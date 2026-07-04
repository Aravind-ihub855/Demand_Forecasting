import { useMemo } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  Truck,
  Factory,
  Rocket,
  CheckCircle2,
} from "lucide-react";
import { SectionCard } from "./SectionCard";
import { card, surfaceMuted, textHeading, textMuted, textAccent } from "./themeClasses";
import { formatNumber } from "./utils";

export default function SupplyChainActionCenter({ data = {} }) {
  const supplyChainData = data.supply_chain_action_center || {};

  const critical = supplyChainData.critical_products || [];
  const emergency = supplyChainData.emergency_procurement || [];
  const transfer = supplyChainData.warehouse_transfer || [];
  const vendor = supplyChainData.vendor_onboarding || [];
  const newSku = supplyChainData.new_sku_launch || [];
  const safe = supplyChainData.safe_inventory || [];

  const criticalCount = critical.length;
  const emergencyCount = emergency.length;
  const transferCount = transfer.length;
  const vendorCount = vendor.length;
  const newSkuCount = newSku.length;
  const safeCount = safe.length;

  // 1. Health Score Calculation
  const healthScore = useMemo(() => {
    let score = 100
      - (criticalCount * 5)
      - (emergencyCount * 4)
      - (transferCount * 2)
      - (vendorCount * 1)
      - (newSkuCount * 1)
      + (safeCount * 1);
    return Math.max(0, Math.min(100, score));
  }, [criticalCount, emergencyCount, transferCount, vendorCount, newSkuCount, safeCount]);

  const { status, statusColor } = useMemo(() => {
    if (healthScore >= 80) {
      return {
        status: "Healthy",
        statusColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50",
      };
    } else if (healthScore >= 50) {
      return {
        status: "Moderate",
        statusColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50",
      };
    } else {
      return {
        status: "Critical",
        statusColor: "text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50",
      };
    }
  }, [healthScore]);

  const chips = [
    { label: "Critical", count: criticalCount, color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20" },
    { label: "Emergency", count: emergencyCount, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20" },
    { label: "Transfers", count: transferCount, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20" },
    { label: "Vendors", count: vendorCount, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20" },
    { label: "New SKU", count: newSkuCount, color: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20" },
    { label: "Safe", count: safeCount, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20" },
  ];

  return (
    <SectionCard
      title="Warehouse Operations Center"
      subtitle="Rule-based warehouse operational intelligence, alerts, and corrective action workflows."
      icon={ShieldAlert}
      iconAccent="indigo"
    >
      {/* Warehouse Health Score Header Card */}
      <div className={`${card} p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
        <div className="space-y-2">
          <h3 className={`text-xs font-bold uppercase tracking-widest ${textAccent}`}>Warehouse Health Score</h3>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{healthScore}</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor}`}>
              {status}
            </span>
          </div>
          <p className={`text-xs ${textMuted}`}>
            Determined by critical risk weights, active transfers, vendor status, and safe coverage ratios.
          </p>
        </div>

        {/* Small KPI Chips */}
        <div className="flex flex-wrap gap-2 max-w-xl">
          {chips.map((chip) => (
            <div
              key={chip.label}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-100 dark:border-slate-800/40 ${chip.color}`}
            >
              <span>{chip.label}:</span>
              <span className="font-extrabold">{chip.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Six Operational Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Critical Products */}
        <div className={`${card} p-5 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4 dark:border-slate-800/60">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
              <h4 className={`text-xs font-bold uppercase tracking-wider ${textHeading}`}>Critical Products</h4>
            </div>
            {critical.length === 0 ? (
              <p className={`text-xs ${textMuted} text-center py-6`}>No critical products identified.</p>
            ) : (
              <div className="space-y-4">
                {critical.map((item, idx) => (
                  <div key={idx} className="border-b last:border-0 border-slate-100 dark:border-slate-850 pb-3 mb-3 last:pb-0 last:mb-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`font-semibold text-xs leading-tight ${textHeading}`}>{item.product_name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 shrink-0 rounded-full bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300`}>
                        {item.priority || item.procurement_urgency || "Critical"}
                      </span>
                    </div>
                    <p className={`text-[10px] ${textMuted} mt-0.5`}>{item.warehouse}</p>
                    <div className="grid grid-cols-3 gap-2 mt-2 bg-slate-50/50 dark:bg-[#0f2344]/30 rounded-lg p-2 text-[10px]">
                      <div>
                        <span className={textMuted}>Stock</span>
                        <span className={`block font-bold ${textHeading}`}>{formatNumber(item.current_stock ?? 0)}</span>
                      </div>
                      <div>
                        <span className={textMuted}>Demand</span>
                        <span className={`block font-bold ${textHeading}`}>{formatNumber(item.expected_demand ?? 0)}</span>
                      </div>
                      <div>
                        <span className={textMuted}>Coverage</span>
                        <span className="block font-bold text-red-500">{item.coverage_percentage ?? 0}%</span>
                      </div>
                    </div>
                    <p className="text-[10px] mt-2 text-indigo-600 dark:text-indigo-400 font-medium">
                      Action: {item.recommended_action || "Immediate stock pull"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Emergency Procurement */}
        <div className={`${card} p-5 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4 dark:border-slate-800/60">
              <Zap className="h-4.5 w-4.5 text-amber-500" />
              <h4 className={`text-xs font-bold uppercase tracking-wider ${textHeading}`}>Emergency Procurement</h4>
            </div>
            {emergency.length === 0 ? (
              <p className={`text-xs ${textMuted} text-center py-6`}>No emergency procurement orders.</p>
            ) : (
              <div className="space-y-4">
                {emergency.map((item, idx) => (
                  <div key={idx} className="border-b last:border-0 border-slate-100 dark:border-slate-850 pb-3 mb-3 last:pb-0 last:mb-0">
                    <span className={`font-semibold text-xs leading-tight ${textHeading}`}>{item.product_name}</span>
                    <div className="grid grid-cols-3 gap-2 mt-2 bg-slate-50/50 dark:bg-[#0f2344]/30 rounded-lg p-2 text-[10px]">
                      <div>
                        <span className={textMuted}>Qty</span>
                        <span className={`block font-bold ${textHeading}`}>{formatNumber(item.replenishment_quantity ?? 0)}</span>
                      </div>
                      <div>
                        <span className={textMuted}>Lead Time</span>
                        <span className={`block font-bold ${textHeading}`}>{item.lead_time_days ?? 0} Days</span>
                      </div>
                      <div>
                        <span className={textMuted}>Stockout</span>
                        <span className="block font-bold text-orange-500">{item.estimated_stockout_date || "—"}</span>
                      </div>
                    </div>
                    <p className="text-[10px] mt-2 text-indigo-600 dark:text-indigo-400 font-medium leading-normal">
                      Rec: {item.procurement_recommendation || item.recommendation || "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Warehouse Transfers */}
        <div className={`${card} p-5 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4 dark:border-slate-800/60">
              <Truck className="h-4.5 w-4.5 text-blue-500" />
              <h4 className={`text-xs font-bold uppercase tracking-wider ${textHeading}`}>Warehouse Transfers</h4>
            </div>
            {transfer.length === 0 ? (
              <p className={`text-xs ${textMuted} text-center py-6`}>No active warehouse transfers.</p>
            ) : (
              <div className="space-y-4">
                {transfer.map((item, idx) => (
                  <div key={idx} className="border-b last:border-0 border-slate-100 dark:border-slate-850 pb-3 mb-3 last:pb-0 last:mb-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`font-semibold text-xs leading-tight ${textHeading}`}>{item.product_name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 shrink-0 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300`}>
                        {item.priority || "Medium"}
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] space-y-1">
                      <div className="flex justify-between">
                        <span className={textMuted}>Source</span>
                        <span className={textHeading}>{item.source_warehouse || "Central Warehouse"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textMuted}>Destination</span>
                        <span className={textHeading}>{item.destination_warehouse || item.warehouse || "Transit Hub"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textMuted}>Transfer Qty</span>
                        <span className={`font-bold ${textHeading}`}>{formatNumber(item.transfer_quantity ?? 0)}</span>
                      </div>
                    </div>
                    <p className={`text-[10px] ${textMuted} mt-1.5 leading-normal`}>
                      Reason: {item.transfer_reason || "Rebalancing stock"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Vendor Onboarding */}
        <div className={`${card} p-5 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4 dark:border-slate-800/60">
              <Factory className="h-4.5 w-4.5 text-purple-500" />
              <h4 className={`text-xs font-bold uppercase tracking-wider ${textHeading}`}>Vendor Onboarding</h4>
            </div>
            {vendor.length === 0 ? (
              <p className={`text-xs ${textMuted} text-center py-6`}>No vendors suggested for onboarding.</p>
            ) : (
              <div className="space-y-4">
                {vendor.map((item, idx) => (
                  <div key={idx} className="border-b last:border-0 border-slate-100 dark:border-slate-850 pb-3 mb-3 last:pb-0 last:mb-0">
                    <span className={`font-semibold text-xs leading-tight ${textHeading}`}>{item.product_name}</span>
                    <p className={`text-[10px] ${textMuted} mt-1 leading-normal`}>
                      Opportunity: {item.business_opportunity}
                    </p>
                    <div className="mt-2 text-[10px] space-y-1">
                      <div className="flex justify-between">
                        <span className={textMuted}>Suggested Qty</span>
                        <span className={`font-bold ${textHeading}`}>{formatNumber(item.suggested_initial_quantity ?? 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textMuted}>Procurement Strategy</span>
                        <span className={textHeading}>{item.procurement_strategy}</span>
                      </div>
                    </div>
                    <p className="text-[10px] mt-2 text-indigo-600 dark:text-indigo-400 font-medium leading-normal">
                      Rec: {item.recommendation || "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 5: New SKU Launch */}
        <div className={`${card} p-5 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4 dark:border-slate-800/60">
              <Rocket className="h-4.5 w-4.5 text-pink-500" />
              <h4 className={`text-xs font-bold uppercase tracking-wider ${textHeading}`}>New SKU Launch</h4>
            </div>
            {newSku.length === 0 ? (
              <p className={`text-xs ${textMuted} text-center py-6`}>No new SKU launches queued.</p>
            ) : (
              <div className="space-y-4">
                {newSku.map((item, idx) => (
                  <div key={idx} className="border-b last:border-0 border-slate-100 dark:border-slate-850 pb-3 mb-3 last:pb-0 last:mb-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`font-semibold text-xs leading-tight ${textHeading}`}>{item.product_name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 shrink-0 rounded-full bg-pink-100 text-pink-850 dark:bg-pink-950/40 dark:text-pink-300`}>
                        {item.launch_priority || item.priority || "High"}
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] flex justify-between">
                      <span className={textMuted}>Suggested Initial Stock</span>
                      <span className={`font-bold ${textHeading}`}>{formatNumber(item.suggested_initial_stock ?? 0)}</span>
                    </div>
                    <p className={`text-[10px] ${textMuted} mt-1.5 leading-normal`}>
                      Reason: {item.business_reason || item.recommendation || "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 6: Safe Inventory */}
        <div className={`${card} p-5 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4 dark:border-slate-800/60">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              <h4 className={`text-xs font-bold uppercase tracking-wider ${textHeading}`}>Safe Inventory</h4>
            </div>
            {safe.length === 0 ? (
              <p className={`text-xs ${textMuted} text-center py-6`}>No safe inventory records.</p>
            ) : (
              <div className="space-y-4">
                {safe.map((item, idx) => (
                  <div key={idx} className="border-b last:border-0 border-slate-100 dark:border-slate-850 pb-3 mb-3 last:pb-0 last:mb-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`font-semibold text-xs leading-tight ${textHeading}`}>{item.product_name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0">
                        {item.status || item.inventory_health || "Safe"}
                      </span>
                    </div>
                    <p className={`text-[10px] ${textMuted} mt-0.5`}>{item.warehouse}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-50/50 dark:bg-[#0f2344]/30 rounded-lg p-2 text-[10px]">
                      <div>
                        <span className={textMuted}>Current Stock</span>
                        <span className={`block font-bold ${textHeading}`}>{formatNumber(item.current_stock ?? 0)}</span>
                      </div>
                      <div>
                        <span className={textMuted}>Days of Cover</span>
                        <span className="block font-bold text-emerald-500">{item.days_of_cover ?? 0} Days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
