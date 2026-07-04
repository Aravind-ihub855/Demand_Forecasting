import DashboardHeader from "./DashboardHeader";
import DemandCharts from "./DemandCharts";
import ExecutiveSummary from "./ExecutiveSummary";
import KPICards from "./KPICards";
import OpportunitiesTable from "./OpportunitiesTable";
import RecommendedActions from "./RecommendedActions";
import RiskCards from "./RiskCards";
import StrategicInsight from "./StrategicInsight";
import TopProductsTable from "./TopProductsTable";

export default function ForecastDashboard({ data, onReset }) {
  const sections = data?.sections || {};

  return (
    <div className="space-y-6">
      <DashboardHeader data={data} onReset={onReset} />
      <KPICards kpis={data?.kpis} />
      <ExecutiveSummary summary={data?.summary} />
      <TopProductsTable products={sections.top_demand_products} />

      <div className="grid gap-6 xl:grid-cols-2">
        <OpportunitiesTable
          opportunities={sections.new_product_opportunities}
        />
        <RecommendedActions actions={sections.recommended_actions} />
      </div>

      <RiskCards
        inventoryRisks={sections.inventory_risks}
        supplierRisks={sections.supplier_risks}
      />
      <StrategicInsight data={data} />
      <DemandCharts
        topProducts={sections.top_demand_products}
        opportunities={sections.new_product_opportunities}
      />
    </div>
  );
}
