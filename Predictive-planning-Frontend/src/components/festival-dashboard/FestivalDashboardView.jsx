import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PriorityBadge from "./PriorityBadge";

const CHART_COLORS = ["#F59E0B", "#5B7FFF", "#22C55E", "#EC4899", "#8B5CF6", "#14B8A6"];

function KpiCard({ title, value, subtitle }) {
  return (
    <article className="panel an-kpi-card fd-kpi-card">
      <p className="an-kpi-title">{title}</p>
      <h3>{value}</h3>
      {subtitle ? <p className="subtle">{subtitle}</p> : null}
    </article>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="fd-section-header">
      <h3>{title}</h3>
      {subtitle ? <p className="subtle">{subtitle}</p> : null}
    </div>
  );
}

export default function FestivalDashboardView({ data, onReset }) {
  const {
    executiveKpis,
    demandSummary,
    topOpportunities,
    inventoryRisks,
    procurementPlan,
    categoryInsights,
    demandDrivers,
    businessImpact,
    aiRecommendations,
    charts,
    requestMeta,
  } = data;

  return (
    <div className="fd-dashboard">
      <article className="panel fd-hero-panel">
        <div className="fd-hero-top">
          <div>
            <p className="fd-eyebrow">Demand Planning Control Tower</p>
            <h2>Festival Demand Forecasting &amp; Planning</h2>
            <p className="subtle">
              AI-Powered Festival Intelligence for Inventory Planning
            </p>
          </div>
          <div className="fd-hero-actions">
            <div className="fd-filter-chips">
              <span className="fd-chip">{requestMeta.festival_name || executiveKpis.festival}</span>
              <span className="fd-chip">{requestMeta.store_id}</span>
              <span className="fd-chip">{requestMeta.forecast_year}</span>
            </div>
            <button type="button" className="fd-reset-btn" onClick={onReset}>
              New Forecast
            </button>
          </div>
        </div>
      </article>

      <div className="an-kpi-grid fd-kpi-grid">
        <KpiCard title="Festival" value={executiveKpis.festival} />
        <KpiCard title="Forecast Confidence" value={executiveKpis.confidence} />
        <KpiCard title="Top Spike Product" value={executiveKpis.topSpikeProduct} />
        <KpiCard title="Expected Peak Growth" value={executiveKpis.expectedPeakGrowth} />
        <KpiCard title="High Risk Products" value={executiveKpis.highRiskProducts} />
        <KpiCard title="Critical Procurement" value={executiveKpis.criticalProducts} />
      </div>

      <article className="panel fd-summary-panel">
        <SectionHeader title="Festival Demand Summary" />
        <div className="fd-summary-grid">
          <div>
            <p className="an-kpi-title">Festival</p>
            <h4>{demandSummary.festival}</h4>
          </div>
          <div>
            <p className="an-kpi-title">Forecast Confidence</p>
            <PriorityBadge value={demandSummary.confidence} />
          </div>
          <div>
            <p className="an-kpi-title">Demand Growth Range</p>
            <h4>{demandSummary.demandGrowthRange}</h4>
          </div>
          <div className="fd-summary-wide">
            <p className="an-kpi-title">Key Observation</p>
            <p>{demandSummary.observation}</p>
          </div>
        </div>
      </article>

      <div className="an-charts-grid fd-charts-grid">
        <article className="panel an-panel-lg">
          <SectionHeader title="Top Product Demand Spike" subtitle="Expected spike vs baseline" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.productSpike}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="product" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`, "Spike"]} />
              <Bar dataKey="spike" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel an-panel-lg">
          <SectionHeader title="Category Growth" subtitle="Expected growth by category" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.categoryGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`, "Growth"]} />
              <Bar dataKey="growth" fill="#5B7FFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel an-panel-md">
          <SectionHeader title="Risk Distribution" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={charts.riskDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {charts.riskDistribution.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="panel an-panel-md">
          <SectionHeader title="Procurement Priority" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.procurementPriority} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="priority" width={72} />
              <Tooltip />
              <Bar dataKey="count" fill="#22C55E" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>

      <article className="panel">
        <SectionHeader title="Top Demand Opportunities" />
        <div className="fd-table-wrap">
          <table className="fi-table fd-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product</th>
                <th>Expected Demand Spike</th>
                <th>Revenue Opportunity</th>
                <th>Demand Driver</th>
                <th>Procurement Priority</th>
              </tr>
            </thead>
            <tbody>
              {topOpportunities.map((row) => (
                <tr key={row.rank}>
                  <td data-label="Rank">{row.rank}</td>
                  <td data-label="Product">{row.product}</td>
                  <td data-label="Expected Demand Spike">{row.expectedSpike}</td>
                  <td data-label="Revenue Opportunity">
                    <PriorityBadge value={row.revenueOpportunity} />
                  </td>
                  <td data-label="Demand Driver">{row.driver}</td>
                  <td data-label="Procurement Priority">
                    <PriorityBadge value={row.procurementPriority} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <div className="fd-split-grid">
        <article className="panel">
          <SectionHeader title="Inventory Risk Dashboard" />
          <div className="fd-table-wrap">
            <table className="fi-table fd-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Risk Level</th>
                  <th>Lost Sales Units</th>
                  <th>Impact</th>
                  <th>Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {inventoryRisks.map((row) => (
                  <tr key={row.product}>
                    <td data-label="Product">{row.product}</td>
                    <td data-label="Risk Level">
                      <PriorityBadge value={row.risk} />
                    </td>
                    <td data-label="Lost Sales Units">{row.lostSales}</td>
                    <td data-label="Impact">{row.impact}</td>
                    <td data-label="Recommended Action">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <SectionHeader title="Procurement Action Plan" />
          <div className="fd-action-cards">
            {procurementPlan.map((item) => (
              <div className="fd-action-card" key={`${item.product}-${item.timeline}`}>
                <div className="fd-action-card-top">
                  <strong>{item.product}</strong>
                  <PriorityBadge value={item.priority} />
                </div>
                <p>{item.action}</p>
                <span className="fd-timeline">{item.timeline}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="panel">
        <SectionHeader title="Category Demand Insights" />
        <div className="fd-category-grid">
          {categoryInsights.map((cat) => (
            <div className="fd-category-card" key={cat.category}>
              <h4>{cat.category}</h4>
              <div className="fd-category-metrics">
                <div>
                  <span>Growth</span>
                  <strong>{cat.expectedGrowth}</strong>
                </div>
                <div>
                  <span>Revenue Impact</span>
                  <PriorityBadge value={cat.revenueImpact} />
                </div>
                <div>
                  <span>Risk Level</span>
                  <PriorityBadge value={cat.riskLevel} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <SectionHeader title="Demand Drivers Panel" />
        <div className="fd-drivers-grid">
          {demandDrivers.map((d) => (
            <div className="fd-driver-card" key={d.name}>
              <span className="fd-driver-icon">{d.icon}</span>
              <div>
                <strong>{d.name}</strong>
                <PriorityBadge value={d.level} />
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="an-kpi-grid fd-impact-grid">
        <KpiCard title="Top Revenue Opportunity" value={businessImpact.topRevenueProduct} />
        <KpiCard title="Highest Inventory Risk" value={businessImpact.highestRiskProduct} />
        <KpiCard title="Total Risk Products" value={businessImpact.totalRiskProducts} />
        <KpiCard title="Total Critical Products" value={businessImpact.totalCriticalProducts} />
        <KpiCard
          title="Expected Revenue Opportunity"
          value={businessImpact.expectedRevenueOpportunity}
        />
      </div>

      <article className="panel">
        <SectionHeader title="AI Recommendations" subtitle="Actionable inventory & procurement guidance" />
        <div className="fd-rec-grid">
          {aiRecommendations.map((rec, i) => (
            <div className="fd-rec-card" key={i}>
              <span className="fd-rec-index">{i + 1}</span>
              <p>{rec}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
