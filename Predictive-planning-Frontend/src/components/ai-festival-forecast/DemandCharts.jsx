import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import {
  borderLight,
  card,
  emptyState,
  iconBox,
  iconColor,
  textHeading,
} from "./themeClasses";
import useAppTheme, { getChartTheme } from "./useAppTheme";
import { parseUpliftPercent } from "./utils";

const UPLIFT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f59e0b",
  "#10b981",
];

const SCORE_COLORS = [
  "#10b981",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#f59e0b",
];

function ChartCard({ title, children, empty }) {
  return (
    <div className={card}>
      <div className={`flex items-center gap-3 border-b px-6 py-4 ${borderLight}`}>
        <div className={iconBox.blue}>
          <BarChart3 className={`h-5 w-5 ${iconColor.blue}`} />
        </div>
        <h2 className={`text-lg font-bold ${textHeading}`}>{title}</h2>
      </div>
      <div className="p-6">
        {empty ? (
          <p className={`py-16 ${emptyState}`}>No chart data available.</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, chartTheme, suffix = "" }) {
  if (!active || !payload?.length) return null;
  const name = payload[0]?.payload?.fullName || payload[0]?.name;
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-lg"
      style={{
        backgroundColor: chartTheme.tooltip.bg,
        border: `1px solid ${chartTheme.tooltip.border}`,
      }}
    >
      <p className="font-semibold" style={{ color: chartTheme.tooltip.text }}>
        {name}
      </p>
      <p style={{ color: chartTheme.tooltip.accent }}>
        {payload[0].value}
        {suffix}
      </p>
    </div>
  );
}

export default function DemandCharts({ topProducts = [], opportunities = [] }) {
  const theme = useAppTheme();
  const chartTheme = getChartTheme(theme);

  const upliftData = topProducts.map((p) => ({
    name:
      p.product_name?.length > 18
        ? `${p.product_name.slice(0, 16)}…`
        : p.product_name,
    fullName: p.product_name,
    uplift: parseUpliftPercent(p.predicted_uplift),
  }));

  const opportunityData = opportunities.map((o) => ({
    name:
      o.product_name?.length > 18
        ? `${o.product_name.slice(0, 16)}…`
        : o.product_name,
    fullName: o.product_name,
    score: o.opportunity_score,
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard title="Top Demand Products Uplift %" empty={!upliftData.length}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={upliftData}
            margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartTheme.grid}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: chartTheme.tick }}
              angle={-35}
              textAnchor="end"
              height={70}
            />
            <YAxis
              tick={{ fontSize: 11, fill: chartTheme.tick }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip chartTheme={chartTheme} suffix="%" />} />
            <Bar dataKey="uplift" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {upliftData.map((_, i) => (
                <Cell key={i} fill={UPLIFT_COLORS[i % UPLIFT_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="New Product Opportunity Scores" empty={!opportunityData.length}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={opportunityData}
            margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartTheme.grid}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: chartTheme.tick }}
              angle={-35}
              textAnchor="end"
              height={70}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: chartTheme.tick }}
            />
            <Tooltip content={<CustomTooltip chartTheme={chartTheme} />} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {opportunityData.map((_, i) => (
                <Cell key={i} fill={SCORE_COLORS[i % SCORE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
