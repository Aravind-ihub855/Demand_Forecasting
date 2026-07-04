import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  Award,
  Heart,
  Zap,
  Gift,
  Share2,
  ShoppingBag,
  Globe,
  ShieldAlert,
} from "lucide-react";
import useAppTheme, { getChartTheme } from "../ai-festival-forecast/useAppTheme";
import { SectionCard } from "./SectionCard";
import { card, surfaceMuted, textHeading, textMuted, textAccent } from "./themeClasses";

export default function TrendIntelligenceOverview({ data = {} }) {
  const theme = useAppTheme();
  const chartTheme = getChartTheme(theme);
  const axisTick = { fill: chartTheme.tick, fontSize: 11 };
  const gridStroke = chartTheme.grid;

  // Extract trending opportunities array
  const trendingProducts = useMemo(() => {
    return data.historical_validation_layer?.trending_product_opportunities || [];
  }, [data]);

  // 1. Calculate General Metric Counts
  const totalTrending = trendingProducts.length;
  const highTrendCount = trendingProducts.filter((p) => p.trend_score >= 80).length;
  const withRiskCount = trendingProducts.filter((p) => p.risk_signal && p.risk_signal !== "").length;

  // 2. Trend Type Counts
  const healthCount = trendingProducts.filter((p) => p.trend_type === "Health Trends").length;
  const convenienceCount = trendingProducts.filter((p) => p.trend_type === "Convenience Trends").length;
  const giftingCount = trendingProducts.filter((p) => p.trend_type === "Gifting Trends").length;
  const socialMediaCount = trendingProducts.filter((p) => p.trend_type === "Social Media Trends").length;
  const retailCount = trendingProducts.filter((p) => p.trend_type === "Retail Trends").length;
  const regionalCount = trendingProducts.filter((p) => p.trend_type === "Regional Trends").length;

  // 3. Trend Score Distribution Math
  const score90_100 = trendingProducts.filter((p) => p.trend_score >= 90 && p.trend_score <= 100).length;
  const score80_89 = trendingProducts.filter((p) => p.trend_score >= 80 && p.trend_score < 90).length;
  const score70_79 = trendingProducts.filter((p) => p.trend_score >= 70 && p.trend_score < 80).length;
  const score60_69 = trendingProducts.filter((p) => p.trend_score >= 60 && p.trend_score < 70).length;

  const scoreDistributionData = [
    { range: "90-100", count: score90_100, fill: "#6366f1" },
    { range: "80-89", count: score80_89, fill: "#8b5cf6" },
    { range: "70-79", count: score70_79, fill: "#3b82f6" },
    { range: "60-69", count: score60_69, fill: "#0ea5e9" },
  ];

  // 4. Trend Type Distribution Data
  const trendTypeData = [
    { name: "Health", count: healthCount, fill: "#10b981", icon: Heart },
    { name: "Convenience", count: convenienceCount, fill: "#f59e0b", icon: Zap },
    { name: "Gifting", count: giftingCount, fill: "#ec4899", icon: Gift },
    { name: "Social Media", count: socialMediaCount, fill: "#a855f7", icon: Share2 },
    { name: "Retail", count: retailCount, fill: "#3b82f6", icon: ShoppingBag },
    { name: "Regional", count: regionalCount, fill: "#06b6d4", icon: Globe },
  ];

  // 5. Risk Signals Math
  const supplyChainRisk = trendingProducts.filter((p) => p.risk_signal === "Supply Chain Risks").length;
  const inflationRisk = trendingProducts.filter((p) => p.risk_signal === "Inflation Risks").length;
  const cropFailureRisk = trendingProducts.filter((p) => p.risk_signal === "Crop Failure Risks").length;
  const weatherRisk = trendingProducts.filter((p) => p.risk_signal === "Weather Risks").length;
  const commodityRisk = trendingProducts.filter((p) => p.risk_signal === "Commodity Risks").length;
  const logisticsRisk = trendingProducts.filter((p) => p.risk_signal === "Logistics Risks").length;

  const riskCards = [
    { label: "Supply Chain Risks", count: supplyChainRisk, color: "text-red-500 bg-red-50 dark:bg-red-950/20" },
    { label: "Inflation Risks", count: inflationRisk, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20" },
    { label: "Crop Failure Risks", count: cropFailureRisk, color: "text-orange-500 bg-orange-50 dark:bg-orange-950/20" },
    { label: "Weather Risks", count: weatherRisk, color: "text-sky-500 bg-sky-50 dark:bg-sky-950/20" },
    { label: "Commodity Risks", count: commodityRisk, color: "text-violet-500 bg-violet-50 dark:bg-violet-950/20" },
    { label: "Logistics Risks", count: logisticsRisk, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20" },
  ];

  return (
    <SectionCard
      title="Trend Intelligence Overview"
      subtitle="AI-derived emerging consumer demand, social media signals, and regional market trends."
      icon={TrendingUp}
      iconAccent="indigo"
    >
      {/* 3 Major KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className={`${card} p-5 flex items-center justify-between transition hover:shadow-sm`}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Total Trending Products</p>
            <h3 className={`text-2xl font-bold mt-1.5 ${textHeading}`}>{totalTrending}</h3>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className={`${card} p-5 flex items-center justify-between transition hover:shadow-sm`}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>High Trend Score (&gt;=80)</p>
            <h3 className={`text-2xl font-bold mt-1.5 ${textHeading}`}>{highTrendCount}</h3>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className={`${card} p-5 flex items-center justify-between transition hover:shadow-sm`}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>Products With Risk Signals</p>
            <h3 className={`text-2xl font-bold mt-1.5 ${textHeading}`}>{withRiskCount}</h3>
          </div>
          <div className="bg-red-50 dark:bg-red-950/40 p-3 rounded-xl text-red-600 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 6 Trend Type Micro Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 mb-6">
        {trendTypeData.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className={`rounded-xl p-3 border border-slate-100 dark:border-[#19345f]/40 ${surfaceMuted} flex flex-col justify-between`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="p-1 rounded-lg"
                  style={{ backgroundColor: `${item.fill}15`, color: item.fill }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>{item.name}</span>
              </div>
              <p className={`text-lg font-extrabold ${textHeading}`}>{item.count} SKUs</p>
            </div>
          );
        })}
      </div>

      {/* 2 Recharts Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className={`${card} p-5 space-y-4`}>
          <div className="border-b border-slate-100 pb-2 dark:border-slate-800">
            <h4 className={`text-xs font-bold uppercase tracking-widest ${textAccent}`}>Trend Score Distribution</h4>
            <p className={`text-xs ${textMuted} mt-0.5`}>Product volume grouped by dynamic AI trend score brackets</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistributionData} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.4} />
                <XAxis dataKey="range" tick={axisTick} stroke={gridStroke} />
                <YAxis tick={axisTick} stroke={gridStroke} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div
                        className="rounded-lg px-3 py-1.5 text-xs shadow-lg"
                        style={{
                          backgroundColor: chartTheme.tooltip.bg,
                          border: `1px solid ${chartTheme.tooltip.border}`,
                        }}
                      >
                        <p style={{ color: chartTheme.tooltip.text }}>Score Bracket: {payload[0].name}</p>
                        <p className="font-bold" style={{ color: payload[0].payload.fill }}>
                          {payload[0].value} products
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={35}>
                  {scoreDistributionData.map((entry) => (
                    <Cell key={entry.range} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${card} p-5 space-y-4`}>
          <div className="border-b border-slate-100 pb-2 dark:border-slate-800">
            <h4 className={`text-xs font-bold uppercase tracking-widest ${textAccent}`}>Trend Type Distribution</h4>
            <p className={`text-xs ${textMuted} mt-0.5`}>Segmentation of products by consumer market trend type</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendTypeData} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.4} />
                <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 9 }} stroke={gridStroke} />
                <YAxis tick={axisTick} stroke={gridStroke} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div
                        className="rounded-lg px-3 py-1.5 text-xs shadow-lg"
                        style={{
                          backgroundColor: chartTheme.tooltip.bg,
                          border: `1px solid ${chartTheme.tooltip.border}`,
                        }}
                      >
                        <p style={{ color: chartTheme.tooltip.text }}>{payload[0].name} Trends</p>
                        <p className="font-bold" style={{ color: payload[0].payload.fill }}>
                          {payload[0].value} products
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30}>
                  {trendTypeData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trend Risk Section (6 Mini Cards) */}
      <div className={`${card} p-5 space-y-4`}>
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <h4 className={`text-sm font-bold ${textHeading}`}>Trend Risk Section</h4>
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {riskCards.map((risk) => (
            <div
              key={risk.label}
              className="rounded-xl border border-slate-100 dark:border-[#19345f]/40 p-3 flex flex-col justify-between hover:shadow-sm"
            >
              <p className={`text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2`}>
                {risk.label.replace(" Risks", "")}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-black ${textHeading}`}>{risk.count}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    risk.count > 0 ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-slate-100 text-slate-400 dark:bg-slate-800/40 dark:text-slate-500"
                  }`}
                >
                  {risk.count > 0 ? "Active" : "Clear"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
