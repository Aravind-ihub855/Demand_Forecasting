import { useState, useMemo } from "react";
import { LayoutDashboard, Compass, Lightbulb } from "lucide-react";
import DashboardHeader/*, { ExecutiveSummaryCard } */ from "./DashboardHeader";
import KPICardsGrid from "./KPICardsGrid";
// import ProductFilterFunnel from "./ProductFilterFunnel";
// import TrendIntelligenceOverview from "./TrendIntelligenceOverview";
import InventoryRiskAnalytics from "./InventoryRiskAnalytics";
import ProductIntelligenceExplorer from "./ProductIntelligenceExplorer";
// import SupplyChainActionCenter from "./SupplyChainActionCenter";
import {
  BusinessInsightsSection,
  RecommendedActionsSection,
} from "./InsightsAndActions";

export default function DemandIntelligenceDashboard({ data, onReset }) {
  const [activeMainTab, setActiveMainTab] = useState("overview");

  const {
    kpis,
    executive_summary,
    business_insights,
    recommended_actions,
  } = data;

  // Enrich KPIs with dynamic counts of Trending Opportunities and High Priority Items
  const enrichedKpis = useMemo(() => {
    if (!data) return kpis;

    const trendingOpportunitiesCount = data.historical_validation_layer?.trending_product_opportunities?.length ?? 0;
    const trendingInventoryPlansCount = data.inventory_planning_layer?.trending_product_opportunities_inventory_plan?.length ?? 0;

    const totalHighPriority = [
      ...(data.inventory_planning_layer?.validated_inventory_plan || []),
      ...(data.inventory_planning_layer?.new_opportunity_inventory_plan || []),
      ...(data.inventory_planning_layer?.missed_historical_inventory_plan || []),
      ...(data.inventory_planning_layer?.trending_product_opportunities_inventory_plan || []),
    ].filter(
      (p) => p.stocking_priority === "High" || p.stocking_priority === "Critical"
    ).length;

    const scSummary = data.supply_chain_action_center?.summary || {};

    return {
      ...kpis,
      trending_opportunities: kpis?.trending_opportunities ?? trendingOpportunitiesCount,
      trending_inventory_plans: kpis?.trending_inventory_plans ?? trendingInventoryPlansCount,
      top_priority_products: totalHighPriority > 0 ? totalHighPriority : (kpis?.top_priority_products ?? 5),
      critical_products: kpis?.critical_products ?? scSummary.critical_products ?? 0,
      emergency_procurement: kpis?.emergency_procurement ?? scSummary.emergency_procurement ?? 0,
      warehouse_transfer: kpis?.warehouse_transfer ?? scSummary.warehouse_transfer ?? 0,
      vendor_onboarding: kpis?.vendor_onboarding ?? scSummary.vendor_onboarding ?? 0,
      new_sku_launch: kpis?.new_sku_launch ?? scSummary.new_sku_launch ?? 0,
      safe_inventory: kpis?.safe_inventory ?? scSummary.safe_inventory ?? 0,
    };
  }, [data, kpis]);

  return (
    <div className="space-y-6 pb-10">
      {/* 1. Header (Compact Info Cards) */}
      <DashboardHeader summary={executive_summary} onReset={onReset} />

      {/* 2. Premium Main Navigation Tabs */}
      <div className="flex justify-center py-2">
        <div className="main-tab-bar">
          <div
            role="button"
            onClick={() => setActiveMainTab("overview")}
            className={`main-tab-item ${activeMainTab === "overview" ? "is-active" : ""}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard Overview</span>
          </div>

          <div
            role="button"
            onClick={() => setActiveMainTab("explorer")}
            className={`main-tab-item ${activeMainTab === "explorer" ? "is-active" : ""}`}
          >
            <Compass className="h-4 w-4" />
            <span>Intelligence Explorer</span>
          </div>

          <div
            role="button"
            onClick={() => setActiveMainTab("actions")}
            className={`main-tab-item ${activeMainTab === "actions" ? "is-active" : ""}`}
          >
            <Lightbulb className="h-4 w-4" />
            <span>Actions & Insights</span>
          </div>
        </div>
      </div>

      {/* 3. Tab Contents */}
      {activeMainTab === "overview" && (
        <div className="space-y-6 animate-fadeIn">
          {/* KPI Cards Grid */}
          <KPICardsGrid kpis={enrichedKpis} />
          
          {/* Inventory & Risk Analytics */}
          <InventoryRiskAnalytics data={data} />
        </div>
      )}

      {activeMainTab === "explorer" && (
        <div className="animate-fadeIn">
          {/* Product Intelligence Explorer */}
          <ProductIntelligenceExplorer data={data} />
        </div>
      )}

      {activeMainTab === "actions" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Business Insights & Recommendations */}
          <BusinessInsightsSection insights={business_insights} />
          <RecommendedActionsSection
            actions={recommended_actions}
            supplyChainActions={data.supply_chain_action_center?.recommended_actions}
          />
        </div>
      )}
    </div>
  );
}


