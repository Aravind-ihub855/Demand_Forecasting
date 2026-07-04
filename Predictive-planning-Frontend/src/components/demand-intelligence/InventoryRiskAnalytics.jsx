import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ShieldAlert,
  Clock,
  Egg,
  TrendingUp,
  Boxes,
} from "lucide-react";
import useAppTheme, { getChartTheme } from "../ai-festival-forecast/useAppTheme";
import { SectionCard } from "./SectionCard";
import { card, textHeading, textMuted } from "./themeClasses";


// Generator helper for Inventory Planning items (if missing from raw API response)
function generateInventoryPlan(product, type) {
  const name = product.product_name || product.sku_name || "Unknown Product";
  const category = (product.category || "").toLowerCase();
  
  // Stock Type
  let stockType = "Non-Perishable";
  if (
    category.includes("dairy") || 
    category.includes("fruit") || 
    category.includes("fresh") || 
    category.includes("milk") ||
    category.includes("produce") ||
    category.includes("religious") ||
    category.includes("coconut") ||
    category.includes("leaf") ||
    category.includes("leaves") ||
    name.includes("Milk") ||
    name.includes("Banana") ||
    name.includes("Curd") ||
    name.includes("Paneer")
  ) {
    stockType = "Perishable";
  } else if (
    category.includes("bakery") || 
    category.includes("egg") || 
    category.includes("sweet") || 
    category.includes("snack") ||
    category.includes("confectionery") ||
    name.includes("Bread") ||
    name.includes("Eggs") ||
    name.includes("Cake") ||
    name.includes("Sweet")
  ) {
    stockType = "Semi-Perishable";
  }

  // Priority
  let priority = "Medium";
  const spike = product.spike_percentage || 0;
  if (type === "validated" && spike > 150) {
    priority = "High";
  } else if (type === "new_opportunity") {
    priority = "High";
  } else if (type === "missed_historical" && spike > 180) {
    priority = "High";
  } else if (type === "trending") {
    if (product.trend_score >= 80) {
      priority = "High";
    } else if (product.trend_score >= 70) {
      priority = "Medium";
    } else {
      priority = "Low";
    }
  } else if (spike > 0 && spike < 50) {
    priority = "Low";
  }

  // Stocking Window
  let stockingWindow = "Medium-Term";
  if (priority === "High") {
    stockingWindow = "Immediate";
  } else if (priority === "Low") {
    stockingWindow = "Near Festival";
  }

  // Risk Level
  let riskLevel = "Medium";
  if (stockType === "Perishable") {
    riskLevel = "High";
  } else if (stockType === "Non-Perishable" && priority === "Low") {
    riskLevel = "Low";
  }

  return {
    product_name: name,
    stock_type: stockType,
    stocking_priority: priority,
    stocking_window: stockingWindow,
    risk_level: riskLevel,
  };
}

export default function InventoryRiskAnalytics({ data = {} }) {
  const theme = useAppTheme();
  const chartTheme = getChartTheme(theme);
  const axisTick = { fill: chartTheme.tick, fontSize: 11 };
  const gridStroke = chartTheme.grid;

  // ── 1. Gather all plan items (with generator fallback) ─────────────────────
  const validated = data.historical_validation_layer?.historically_validated_products || data.historically_validated_products || [];
  const newOpportunities = data.historical_validation_layer?.new_product_opportunities || data.new_product_opportunities || [];
  const missedHistorical = data.historical_validation_layer?.missed_historical_products || data.missed_historical_products || [];
  const trendingOpportunities = data.historical_validation_layer?.trending_product_opportunities || [];

  let validatedPlan = data.inventory_planning_layer?.validated_inventory_plan || [];
  let newOpportunityPlan = data.inventory_planning_layer?.new_opportunity_inventory_plan || [];
  let missedHistoricalPlan = data.inventory_planning_layer?.missed_historical_inventory_plan || [];
  let trendingPlan = data.inventory_planning_layer?.trending_product_opportunities_inventory_plan || [];

  if (validatedPlan.length === 0 && validated.length > 0) {
    validatedPlan = validated.map(p => generateInventoryPlan(p, "validated"));
  }
  if (newOpportunityPlan.length === 0 && newOpportunities.length > 0) {
    newOpportunityPlan = newOpportunities.map(p => generateInventoryPlan(p, "new_opportunity"));
  }
  if (missedHistoricalPlan.length === 0 && missedHistorical.length > 0) {
    missedHistoricalPlan = missedHistorical.map(p => generateInventoryPlan(p, "missed_historical"));
  }
  if (trendingPlan.length === 0 && trendingOpportunities.length > 0) {
    trendingPlan = trendingOpportunities.map(p => generateInventoryPlan(p, "trending"));
  }

  const totalPlan = [
    ...validatedPlan,
    ...newOpportunityPlan,
    ...missedHistoricalPlan,
    ...trendingPlan,
  ];

  // ── 2. Calculate KPI Counts ───────────────────────────────────────────────
  const immediateCount = totalPlan.filter(p => p.stocking_window === "Immediate").length;
  const mediumTermCount = totalPlan.filter(p => p.stocking_window === "Medium-Term").length;
  const nearFestivalCount = totalPlan.filter(p => p.stocking_window === "Near Festival").length;

  const perishableCount = totalPlan.filter(p => p.stock_type === "Perishable").length;
  const semiPerishableCount = totalPlan.filter(p => p.stock_type === "Semi-Perishable").length;
  const nonPerishableCount = totalPlan.filter(p => p.stock_type === "Non-Perishable").length;

  const highRiskCount = totalPlan.filter(p => p.risk_level === "High").length;
  const mediumRiskCount = totalPlan.filter(p => p.risk_level === "Medium").length;
  const lowRiskCount = totalPlan.filter(p => p.risk_level === "Low").length;

  // ── 3. Chart Data ──────────────────────────────────────────────────────────
  const procurementTimelineData = [
    { name: "Immediate", count: immediateCount, fill: "#ef4444" },
    { name: "Medium-Term", count: mediumTermCount, fill: "#eab308" },
    { name: "Near Festival", count: nearFestivalCount, fill: "#10b981" },
  ];

  const inventoryTypeData = [
    { name: "Perishable", value: perishableCount, fill: "#ef4444" },
    { name: "Semi-Perishable", value: semiPerishableCount, fill: "#f97316" },
    { name: "Non-Perishable", value: nonPerishableCount, fill: "#10b981" },
  ];

  const riskDistributionData = [
    { name: "High", value: highRiskCount, fill: "#ef4444" },
    { name: "Medium", value: mediumRiskCount, fill: "#f97316" },
    { name: "Low", value: lowRiskCount, fill: "#10b981" },
  ];

  const spikeData = validated
    .slice()
    .sort((a, b) => b.spike_percentage - a.spike_percentage)
    .map((p) => {
      const name = p.product_name || p.sku_name || "Unknown Product";
      return {
        name: name.length > 18 ? `${name.slice(0, 16)}…` : name,
        fullName: name,
        spike_percentage: p.spike_percentage || 0,
      };
    });

  const totalCount = Math.max(totalPlan.length, 1);
  const immediatePct = (immediateCount / totalCount) * 100;
  const mediumTermPct = (mediumTermCount / totalCount) * 100;
  const nearFestivalPct = (nearFestivalCount / totalCount) * 100;

  const perishablePct = (perishableCount / totalCount) * 100;
  const semiPerishablePct = (semiPerishableCount / totalCount) * 100;
  const nonPerishablePct = (nonPerishableCount / totalCount) * 100;

  const highRiskPct = (highRiskCount / totalCount) * 100;
  const mediumRiskPct = (mediumRiskCount / totalCount) * 100;
  const lowRiskPct = (lowRiskCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* 1. Visual Info Cards Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Timeline Group */}
        <div className={`${card} p-5 space-y-4 hover:scale-[1.01] hover:shadow-md transition-all duration-300`}>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Clock className="h-5 w-5 text-red-500" />
            <h3 className={`text-sm font-bold ${textHeading}`}>Procurement Timeline</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold flex items-center gap-1.5 ${textMuted}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  Immediate Procurement
                </span>
                <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded text-[11px]">{immediateCount} SKUs</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#0f2344] h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${immediatePct}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold flex items-center gap-1.5 ${textMuted}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" />
                  Medium-Term Procurement
                </span>
                <span className="font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 px-2 py-0.5 rounded text-[11px]">{mediumTermCount} SKUs</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#0f2344] h-2 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${mediumTermPct}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold flex items-center gap-1.5 ${textMuted}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  Near Festival Procurement
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded text-[11px]">{nearFestivalCount} SKUs</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#0f2344] h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${nearFestivalPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Perishability Group */}
        <div className={`${card} p-5 space-y-4 hover:scale-[1.01] hover:shadow-md transition-all duration-300`}>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Egg className="h-5 w-5 text-indigo-500" />
            <h3 className={`text-sm font-bold ${textHeading}`}>Perishability Classification</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold flex items-center gap-1.5 ${textMuted}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                  Perishable Products
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-[#0f2344] px-2 py-0.5 rounded text-[11px]">{perishableCount} SKUs</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#0f2344] h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${perishablePct}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold flex items-center gap-1.5 ${textMuted}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                  Semi-Perishable Products
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-[#0f2344] px-2 py-0.5 rounded text-[11px]">{semiPerishableCount} SKUs</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#0f2344] h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${semiPerishablePct}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold flex items-center gap-1.5 ${textMuted}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  Non-Perishable Products
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-[#0f2344] px-2 py-0.5 rounded text-[11px]">{nonPerishableCount} SKUs</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#0f2344] h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${nonPerishablePct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Group */}
        <div className={`${card} p-5 space-y-4 hover:scale-[1.01] hover:shadow-md transition-all duration-300`}>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            <h3 className={`text-sm font-bold ${textHeading}`}>Risk Exposure</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold flex items-center gap-1.5 ${textMuted}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  High Risk Products
                </span>
                <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded text-[11px]">{highRiskCount} SKUs</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#0f2344] h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${highRiskPct}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold flex items-center gap-1.5 ${textMuted}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                  Medium Risk Products
                </span>
                <span className="font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded text-[11px]">{mediumRiskCount} SKUs</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#0f2344] h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${mediumRiskPct}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold flex items-center gap-1.5 ${textMuted}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  Low Risk Products
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded text-[11px]">{lowRiskCount} SKUs</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#0f2344] h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${lowRiskPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Procurement Timeline Chart"
          subtitle="Count of products matching stocking windows"
          icon={Clock}
          iconAccent="red"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={procurementTimelineData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.4} />
                <XAxis dataKey="name" tick={axisTick} stroke={gridStroke} />
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
                        <p style={{ color: chartTheme.tooltip.text }}>{payload[0].name}</p>
                        <p className="font-bold" style={{ color: payload[0].payload.fill }}>
                          {payload[0].value} products
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {procurementTimelineData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Inventory Type Distribution"
          subtitle="Product distribution by shelf stability type"
          icon={Boxes}
          iconAccent="indigo"
        >
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
            <div className="h-full w-full sm:w-2/3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {inventoryTypeData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
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
                          <p style={{ color: chartTheme.tooltip.text }}>{payload[0].name}</p>
                          <p className="font-bold" style={{ color: payload[0].payload.fill }}>
                            {payload[0].value} SKUs ({((payload[0].value / Math.max(totalPlan.length, 1)) * 100).toFixed(0)}%)
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-col gap-2 text-xs sm:w-1/3">
              {inventoryTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className={`font-medium ${textMuted}`}>
                    {item.name}: <strong>{item.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Risk Distribution Chart"
          subtitle="Portfolio segmentation by inventory risk profile"
          icon={ShieldAlert}
          iconAccent="orange"
        >
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
            <div className="h-full w-full sm:w-2/3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
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
                          <p style={{ color: chartTheme.tooltip.text }}>{payload[0].name} Risk</p>
                          <p className="font-bold" style={{ color: payload[0].payload.fill }}>
                            {payload[0].value} SKUs ({((payload[0].value / Math.max(totalPlan.length, 1)) * 100).toFixed(0)}%)
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-2 text-xs sm:w-1/3">
              {riskDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className={`font-medium ${textMuted}`}>
                    {item.name}: <strong>{item.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Demand Spike Chart"
          subtitle="Peak demand spikes for historically validated products"
          icon={TrendingUp}
          iconAccent="emerald"
        >
          <div className="h-64">
            {spikeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No historical validation spike data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spikeData} margin={{ bottom: 35, left: -10, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.4} />
                  <XAxis
                    dataKey="name"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={45}
                    tick={{ fill: chartTheme.tick, fontSize: 9 }}
                    stroke={gridStroke}
                  />
                  <YAxis
                    tick={axisTick}
                    stroke={gridStroke}
                    label={{
                      value: "Spike %",
                      angle: -90,
                      position: "insideLeft",
                      fill: chartTheme.tick,
                      fontSize: 10,
                      offset: 0,
                    }}
                  />
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
                          <p style={{ color: chartTheme.tooltip.text }}>
                            {payload[0]?.payload?.fullName}
                          </p>
                          <p className="font-bold text-indigo-600 dark:text-indigo-400">
                            {payload[0]?.value}% spike
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="spike_percentage" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}


