import { useState, useMemo } from "react";
import {
  Compass,
  LineChart,
  Layers,
  CloudSun,
  Users,
  GitCompare,
  Warehouse,
  TrendingUp,
  ShieldAlert,
  FileText,
} from "lucide-react";
import EnterpriseTable from "./EnterpriseTable";
import { SectionCard } from "./SectionCard";
import ProductDemandStoryModal from "./ProductDemandStoryModal";
import {
  badge,
  tabActive,
  tabInactive,
  tabBadgeActive,
  tabBadgeInactive,
  textStrong,
} from "./themeClasses";
import {
  demandLevelBadgeClass,
  formatNumber,
  spikeHighlightClass,
  calculateNetReorderQty,
  calculateRefillTimeline,
} from "./utils";

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

  // Procurement Strategy & Recommendation
  let procurementStrategy = "Standard replenishment";
  let recommendation = "Maintain baseline inventory levels";

  if (priority === "High") {
    if (stockType === "Perishable") {
      procurementStrategy = "Just-in-time daily delivery";
      recommendation = "Secure cold-chain logistics, limit waste";
    } else {
      procurementStrategy = "Strategic stockpiling (bulk buy)";
      recommendation = "Increase safety stock buffer by 300%";
    }
  } else if (priority === "Medium") {
    procurementStrategy = "Local supplier contract";
    recommendation = "Increase safety stock buffer by 150%";
  } else {
    procurementStrategy = "On-demand pull ordering";
    recommendation = "Standard reorder threshold (no extra buffer)";
  }

  return {
    product_name: name,
    stock_type: stockType,
    stocking_priority: priority,
    stocking_window: stockingWindow,
    risk_level: riskLevel,
    procurement_strategy: procurementStrategy,
    recommendation: recommendation,
  };
}

export default function ProductIntelligenceExplorer({ data = {} }) {
  const [activeTab, setActiveTab] = useState("historical");
  const [seasonSubTab, setSeasonSubTab] = useState("approved");
  const [storeSubTab, setStoreSubTab] = useState("approved");
  const [validationSubTab, setValidationSubTab] = useState("all");
  const [inventorySubTab, setInventorySubTab] = useState("validated");
  const [supplyChainSubTab, setSupplyChainSubTab] = useState("critical");
  const [selectedStoryProduct, setSelectedStoryProduct] = useState(null);

  const execSummary = data.executive_summary || {};
  const planningDate = execSummary.planning_date;
  const festivalPeriod = execSummary.festival_period || execSummary.festival_start_date;

  const renderStoryButton = (row) => {
    const math = calculateNetReorderQty(row);
    const timeline = calculateRefillTimeline(row, festivalPeriod, planningDate);
    return (
      <div className="flex items-center justify-start gap-2.5 whitespace-nowrap py-1">
        <div className="flex flex-col text-left shrink-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">
            PO: {formatNumber(math.netPO)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium whitespace-nowrap">
            Cut-off: {timeline.refillCutoffDateFormatted}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSelectedStoryProduct(row)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 shrink-0 whitespace-nowrap shadow-2xs"
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>Story & PO</span>
        </button>
      </div>
    );
  };

  // ── 1. Fetching raw lists ──────────────────────────────────────────────────
  const historicalProducts = data.historical_data_layer?.historical_products || [];
  const festivalProducts = data.festival_layer?.festival_products || [];
  
  const seasonApproved = data.season_layer?.season_approved_products || [];
  const seasonOmitted = data.season_layer?.season_omitted_products || data.season_omitted_products || [];
  
  const storeApproved = data.store_layer?.store_approved_products || [];
  const storeOmitted = data.store_layer?.store_omitted_products || data.store_omitted_products || [];
  
  const validated = data.historical_validation_layer?.historically_validated_products || data.historically_validated_products || [];
  const newOpportunities = data.historical_validation_layer?.new_product_opportunities || data.new_product_opportunities || [];
  const missedHistorical = data.historical_validation_layer?.missed_historical_products || data.missed_historical_products || [];
  const trendingOpportunities = data.historical_validation_layer?.trending_product_opportunities || [];

  const supplyChainData = data.supply_chain_action_center || {};
  const scCritical = supplyChainData.critical_products || [];
  const scEmergency = supplyChainData.emergency_procurement || [];
  const scTransfer = supplyChainData.warehouse_transfer || [];
  const scVendor = supplyChainData.vendor_onboarding || [];
  const scNewSku = supplyChainData.new_sku_launch || [];
  const scSafe = supplyChainData.safe_inventory || [];
  const scTotalCount = supplyChainData.summary?.total_products ?? (scCritical.length + scEmergency.length + scTransfer.length + scVendor.length + scNewSku.length + scSafe.length);

  // ── 2. Parsing/Generating Inventory Plan ──────────────────────────────────
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

  // ── 3. Combined/All Tab Mappings (useMemo for optimization) ───────────────
  const allValidationProducts = useMemo(() => {
    return [
      ...validated.map(p => ({
        ...p,
        source_type: "Synced Demand",
        reason_details: p.expected_demand_level ? `Expected Demand: ${p.expected_demand_level}` : "—"
      })),
      ...newOpportunities.map(p => ({
        ...p,
        source_type: "New Opportunities",
        normal_sales: null,
        peak_sales: null,
        spike_percentage: null,
        driver_type: "festival",
        reason_details: p.reason
      })),
      ...missedHistorical.map(p => ({
        ...p,
        source_type: "Missed Peaks",
        reason_details: p.reason
      })),
      ...trendingOpportunities.map(p => ({
        ...p,
        source_type: "Trending Opportunities",
        normal_sales: null,
        peak_sales: null,
        spike_percentage: null,
        driver_type: "trend",
        reason_details: `${p.trend_type || "Trend"}: ${p.trend_reason || "Emerging trend opportunity."}`
      }))
    ];
  }, [validated, newOpportunities, missedHistorical, trendingOpportunities]);

  const allInventoryPlan = useMemo(() => {
    return [
      ...validatedPlan.map(p => ({ ...p, plan_source: "Historically Validated" })),
      ...newOpportunityPlan.map(p => ({ ...p, plan_source: "New Opportunities" })),
      ...missedHistoricalPlan.map(p => ({ ...p, plan_source: "Missed Historical" })),
      ...trendingPlan.map(p => ({ ...p, plan_source: "Trending Opportunities" }))
    ];
  }, [validatedPlan, newOpportunityPlan, missedHistoricalPlan, trendingPlan]);

  // ── 4. Tab Math ──────────────────────────────────────────────────────────
  const tabs = [
    { id: "historical", label: "Baseline Demand", icon: LineChart, count: historicalProducts.length },
    { id: "festival", label: "Festival Assortment", icon: Layers, count: festivalProducts.length },
    { id: "season", label: "Seasonal Screening", icon: CloudSun, count: seasonApproved.length + seasonOmitted.length },
    { id: "store", label: "Demographic Fit", icon: Users, count: storeApproved.length + storeOmitted.length },
    { id: "trend", label: "Trend Intelligence", icon: TrendingUp, count: trendingOpportunities.length },
    { id: "validation", label: "Demand Alignment", icon: GitCompare, count: allValidationProducts.length },
    { id: "inventory", label: "Replenishment Strategy", icon: Warehouse, count: allInventoryPlan.length },
    { id: "supply_chain", label: "Warehouse Operations", icon: ShieldAlert, count: scTotalCount },
  ];

  // ── 5. Badges & Subtabs Styling ───────────────────────────────────────────
  const getPriorityBadgeClass = (priority) => {
    const val = (priority || "").toLowerCase();
    if (val === "high" || val === "critical") {
      return "bg-red-100 text-red-800 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800/50";
    }
    if (val === "medium") {
      return "bg-yellow-100 text-yellow-800 ring-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:ring-yellow-800/50";
    }
    return "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/50";
  };

  const getRiskBadgeClass = (risk) => {
    const val = (risk || "").toLowerCase();
    if (val === "high") {
      return "bg-red-100 text-red-800 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800/50";
    }
    if (val === "medium") {
      return "bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-800/50";
    }
    return "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/50";
  };

  // Tab styling customized via index.css classes


  // ── 6. Column Definitions ──────────────────────────────────────────────────
  const colsHistorical = [
    { key: "sku_name", header: "Product Name", render: (val, row) => <span className={textStrong}>{val || row.product_name}</span> },
    { key: "category", header: "Category" },
    { key: "normal_sales", header: "Normal Sales", render: (val) => formatNumber(val) },
    { key: "peak_sales", header: "Peak Sales", render: (val) => formatNumber(val) },
    { key: "spike_percentage", header: "Spike %", render: (val) => <span className={spikeHighlightClass(val)}>{val}%</span> },
    { key: "driver_type", header: "Driver Type", render: (val) => <span className="capitalize">{val}</span> },
    { key: "demand_story_action", header: "Net PO & Story", width: "250px", render: (_, row) => renderStoryButton(row) },
  ];

  const colsFestivalAI = [
    { key: "product_name", header: "Product Name", render: (val, row) => <span className={textStrong}>{val || row.sku_name}</span> },
    { key: "category", header: "Category" },
    { key: "confidence_score", header: "Confidence Score", render: (val) => <span className="font-semibold text-indigo-600 dark:text-indigo-400">{val}%</span> },
    { key: "reason", header: "Festival Reason" },
  ];

  const colsSeasonApproved = [
    { key: "product_name", header: "Product Name", render: (val, row) => <span className={textStrong}>{val || row.sku_name}</span> },
    { key: "category", header: "Category" },
    { key: "confidence_score", header: "Confidence Score", render: (val) => val ? `${val}%` : "95%" },
  ];

  const colsSeasonOmitted = [
    { key: "product_name", header: "Product Name", render: (val, row) => <span className={textStrong}>{val || row.sku_name}</span> },
    { key: "category", header: "Category" },
    { key: "confidence_score", header: "Confidence Score", render: (val) => `${val}%` },
    { key: "reason", header: "Reason", render: (val) => <span className="text-red-600 dark:text-red-400 text-xs">{val}</span> },
  ];

  const colsStoreApproved = [
    { key: "product_name", header: "Product Name", render: (val, row) => <span className={textStrong}>{val || row.sku_name}</span> },
    { key: "category", header: "Category" },
    { key: "confidence_score", header: "Confidence Score", render: (val) => val ? `${val}%` : "95%" },
  ];

  const colsStoreOmitted = [
    { key: "product_name", header: "Product Name", render: (val, row) => <span className={textStrong}>{val || row.sku_name}</span> },
    { key: "category", header: "Category" },
    { key: "confidence_score", header: "Confidence Score", render: (val) => `${val}%` },
    { key: "reason", header: "Reason", render: (val) => <span className="text-red-600 dark:text-red-400 text-xs">{val}</span> },
  ];

  // Validation columns
  const colsValidationAll = [
    { key: "product_name", header: "Product Name", render: (val, row) => <span className={textStrong}>{val || row.sku_name}</span>, width: "20%" },
    { key: "source_type", header: "Source Type", render: (val) => {
        let badgeColor = "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-850";
        if (val === "New Opportunities") {
          badgeColor = "bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-850";
        } else if (val === "Missed Peaks") {
          badgeColor = "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-850";
        } else if (val === "Trending Opportunities") {
          badgeColor = "bg-violet-100 text-violet-800 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-850";
        }
        return <span className={`${badge} ${badgeColor}`}>{val}</span>;
      }
    },
    { key: "normal_sales", header: "Normal Sales", render: (val) => formatNumber(val) },
    { key: "peak_sales", header: "Peak Sales", render: (val) => formatNumber(val) },
    { key: "spike_percentage", header: "Spike %", render: (val) => val != null ? <span className={spikeHighlightClass(val)}>{val}%</span> : "—" },
    { key: "driver_type", header: "Driver Type", render: (val) => val ? <span className="capitalize">{val}</span> : "—" },
    { key: "reason_details", header: "Details / Reasons", width: "25%" },
  ];

  const colsTrendingProducts = [
    { key: "product_name", header: "Product Name", render: (val) => <span className={textStrong}>{val}</span>, width: "15%" },
    { key: "category", header: "Category", width: "12%" },
    { key: "trend_score", header: "Trend Score", render: (val) => <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{val}</span>, width: "10%" },
    { key: "trend_type", header: "Trend Type", width: "12%" },
    { key: "trend_reason", header: "Trend Reason", width: "23%" },
    { key: "business_relevance", header: "Business Relevance", width: "18%" },
    { key: "risk_signal", header: "Risk Signal", render: (val) => val ? <span className="font-semibold text-red-650 dark:text-red-400">{val}</span> : <span className="text-slate-400">—</span>, width: "10%" },
  ];

  const colsValidated = [
    { key: "product_name", header: "Product Name", render: (val, row) => <span className={textStrong}>{val || row.sku_name}</span> },
    { key: "normal_sales", header: "Normal Sales", render: (val) => formatNumber(val) },
    { key: "peak_sales", header: "Peak Sales", render: (val) => formatNumber(val) },
    { key: "spike_percentage", header: "Spike %", render: (val) => <span className={spikeHighlightClass(val)}>{val}%</span> },
    { key: "expected_demand_level", header: "Expected Demand Level", render: (val) => <span className={`${badge} ${demandLevelBadgeClass(val)}`}>{val}</span> },
    { key: "driver_type", header: "Driver Type", render: (val) => <span className="capitalize">{val}</span> },
    { key: "demand_story_action", header: "Net PO & Story", width: "250px", render: (_, row) => renderStoryButton(row) },
  ];

  const colsNewOpportunities = [
    { key: "product_name", header: "Product Name", render: (val, row) => <span className={textStrong}>{val || row.sku_name}</span>, width: "30%" },
    { key: "reason", header: "Reason" },
  ];

  const colsMissedHistorical = [
    { key: "product_name", header: "Product Name", render: (val, row) => <span className={textStrong}>{val || row.sku_name}</span> },
    { key: "normal_sales", header: "Normal Sales", render: (val) => formatNumber(val) },
    { key: "peak_sales", header: "Peak Sales", render: (val) => formatNumber(val) },
    { key: "spike_percentage", header: "Spike %", render: (val) => <span className={spikeHighlightClass(val)}>{val}%</span> },
    { key: "driver_type", header: "Driver Type", render: (val) => <span className="capitalize">{val}</span> },
    { key: "reason", header: "Reason" },
  ];

  // Inventory Planning columns
  const colsInventoryAll = [
    { key: "product_name", header: "Product Name", render: (val, row) => <span className={textStrong}>{val || row.sku_name}</span>, width: "18%" },
    { key: "plan_source", header: "Source", render: (val) => {
        let badgeColor = "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-850";
        if (val === "New Opportunities") {
          badgeColor = "bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-850";
        } else if (val === "Missed Historical") {
          badgeColor = "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-850";
        } else if (val === "Trending Opportunities") {
          badgeColor = "bg-violet-100 text-violet-800 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-850";
        }
        return <span className={`${badge} ${badgeColor}`}>{val}</span>;
      }
    },
    { key: "stock_type", header: "Stock Type" },
    { key: "stocking_priority", header: "Priority", render: (val) => <span className={`${badge} ${getPriorityBadgeClass(val)}`}>{val}</span> },
    { key: "risk_level", header: "Risk", render: (val) => <span className={`${badge} ${getRiskBadgeClass(val)}`}>{val}</span> },
    { key: "procurement_strategy", header: "Strategy" },
    { key: "recommendation", header: "Recommendation", width: "18%" },
    { key: "demand_story_action", header: "Net PO & Story", width: "250px", render: (_, row) => renderStoryButton(row) },
  ];

  const colsInventoryPlanning = [
    { key: "product_name", header: "Product Name", render: (val, row) => <span className={textStrong}>{val || row.sku_name}</span>, width: "18%" },
    { key: "stock_type", header: "Stock Type" },
    { key: "stocking_priority", header: "Priority", render: (val) => <span className={`${badge} ${getPriorityBadgeClass(val)}`}>{val}</span> },
    { key: "risk_level", header: "Risk", render: (val) => <span className={`${badge} ${getRiskBadgeClass(val)}`}>{val}</span> },
    { key: "procurement_strategy", header: "Strategy" },
    { key: "recommendation", header: "Recommendation", width: "20%" },
    { key: "demand_story_action", header: "Net PO & Story", width: "250px", render: (_, row) => renderStoryButton(row) },
  ];

  const colsCritical = [
    { key: "product_name", header: "Product", render: (val) => <span className={textStrong}>{val}</span>, width: "15%" },
    { key: "warehouse", header: "Warehouse", render: (val) => val || "WH-CBE-S01", width: "12%" },
    { key: "current_stock", header: "Current Stock", render: (val) => formatNumber(val ?? 0), width: "10%" },
    { key: "expected_demand", header: "Expected Demand", render: (val) => formatNumber(val ?? 0), width: "10%" },
    { key: "coverage_percentage", header: "Coverage %", render: (val) => val != null ? `${val}%` : "—", width: "10%" },
    { key: "priority", header: "Priority", render: (val, row) => <span className={`${badge} ${getPriorityBadgeClass(val || row.procurement_urgency)}`}>{val || row.procurement_urgency}</span>, width: "10%" },
    { key: "recommended_action", header: "Recommended Action", render: (val, row) => val || row.replenishment_quantity || "—", width: "30%" },
  ];

  const colsEmergency = [
    { key: "product_name", header: "Product", render: (val) => <span className={textStrong}>{val}</span>, width: "20%" },
    { key: "replenishment_quantity", header: "Procurement Quantity", render: (val, row) => formatNumber(val || row.netPO || 0), width: "15%" },
    { key: "lead_time_days", header: "Lead Time", render: (val) => val != null ? `${val} Days` : "—", width: "15%" },
    { key: "estimated_stockout_date", header: "Estimated Stockout Date", render: (val, row) => {
        if (val && !val.includes("2026-08") && !val.includes("2026-09")) return val;
        
        // Dynamic fallback calculation relative to active planningDate
        const parseDateInput = (input) => {
          if (!input) return null;
          if (input instanceof Date && !isNaN(input.getTime())) return new Date(input);
          const str = String(input).trim();
          if (str.includes("/")) {
            const parts = str.split("/").map(Number);
            if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
          }
          if (str.includes("-")) {
            const parts = str.split("-").map(Number);
            if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
          }
          return null;
        };

        const pDate = parseDateInput(planningDate) || new Date();
        const dailyDemand = Math.max(1, Math.round((row.normal_sales || row.usual_monthly_sales || 1500) / 30));
        const stockOnDays = (row.current_stock || 0) === 0 ? 1 : Math.max(1, Math.floor((row.current_stock || 0) / dailyDemand));
        
        const sDate = new Date(pDate);
        sDate.setDate(pDate.getDate() + Math.min(stockOnDays, 25));
        return sDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      }, width: "20%" 
    },
    { key: "procurement_recommendation", header: "Procurement Recommendation", render: (val, row) => val || row.recommendation || row.procurement_strategy || "—", width: "30%" },
  ];

  const colsTransfer = [
    { key: "product_name", header: "Product", render: (val) => <span className={textStrong}>{val}</span>, width: "15%" },
    { key: "source_warehouse", header: "Source Warehouse", render: (val) => val || "Central Hub", width: "15%" },
    { key: "destination_warehouse", header: "Destination Warehouse", render: (val, row) => val || row.warehouse || "Saravanampatti Hub", width: "15%" },
    { key: "transfer_quantity", header: "Transfer Quantity", render: (val, row) => formatNumber(val ?? (row.transfer_required ? 1000 : 0)), width: "12%" },
    { key: "transfer_reason", header: "Transfer Reason", width: "33%" },
    { key: "priority", header: "Priority", render: (val) => <span className={`${badge} ${getPriorityBadgeClass(val || "Medium")}`}>{val || "Medium"}</span>, width: "10%" },
  ];

  const colsVendor = [
    { key: "product_name", header: "Product", render: (val) => <span className={textStrong}>{val}</span>, width: "20%" },
    { key: "business_opportunity", header: "Business Opportunity", width: "30%" },
    { key: "suggested_initial_quantity", header: "Suggested Initial Quantity", render: (val) => formatNumber(val ?? 0), width: "15%" },
    { key: "procurement_strategy", header: "Procurement Strategy", width: "15%" },
    { key: "recommendation", header: "Recommendation", width: "20%" },
  ];

  const colsNewSKU = [
    { key: "product_name", header: "Product", render: (val) => <span className={textStrong}>{val}</span>, width: "20%" },
    { key: "suggested_initial_stock", header: "Suggested Initial Stock", render: (val) => formatNumber(val ?? 0), width: "15%" },
    { key: "launch_priority", header: "Launch Priority", render: (val, row) => <span className={`${badge} ${getPriorityBadgeClass(val || row.priority || "High")}`}>{val || row.priority || "High"}</span>, width: "15%" },
    { key: "business_reason", header: "Business Reason", render: (val, row) => val || row.recommendation || "—", width: "50%" },
  ];

  const colsSafe = [
    { key: "product_name", header: "Product", render: (val) => <span className={textStrong}>{val}</span>, width: "20%" },
    { key: "warehouse", header: "Warehouse", width: "20%" },
    { key: "current_stock", header: "Current Stock", render: (val) => formatNumber(val ?? 0), width: "15%" },
    { key: "days_of_cover", header: "Days of Cover", render: (val) => val != null ? `${val} Days` : "—", width: "15%" },
    { key: "status", header: "Status", render: (val, row) => {
        const health = val || row.inventory_health || "Safe";
        let badgeColor = "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-850";
        if (health.toLowerCase().includes("critical") || health.toLowerCase().includes("risk")) {
          badgeColor = "bg-red-100 text-red-800 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-850";
        }
        return <span className={`${badge} ${badgeColor}`}>{health}</span>;
      }, width: "15%"
    },
  ];

  return (
    <SectionCard
      title="Product Intelligence Explorer"
      subtitle="Interactive stage-by-stage product classification, filters, validation, and replenishment strategy mapping."
      icon={Compass}
      iconAccent="indigo"
    >
      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4 dark:border-[#19345f]/70">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`explorer-tab ${isActive ? "is-active" : ""}`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <span className="explorer-tab-badge">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {/* Tab 1: Historical Data */}
        {activeTab === "historical" && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#d4dff5] mb-4 flex items-center gap-2">
              Historical Transactions Log
              <span className={`${badge} bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300`}>
                {historicalProducts.length}
              </span>
            </h3>
            <EnterpriseTable
              columns={colsHistorical}
              data={historicalProducts}
              searchKeys={["sku_name", "product_name", "category", "driver_type"]}
              searchPlaceholder="Search historical products…"
              emptyMessage="No historical products found."
            />
          </div>
        )}

        {/* Tab 2: Festival Assortment */}
        {activeTab === "festival" && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#d4dff5] mb-4 flex items-center gap-2">
              Festival Assortment
              <span className={`${badge} bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300`}>
                {festivalProducts.length}
              </span>
            </h3>
            <EnterpriseTable
              columns={colsFestivalAI}
              data={festivalProducts}
              searchKeys={["product_name", "sku_name", "category", "reason"]}
              searchPlaceholder="Search festival products…"
              emptyMessage="No festival products found."
            />
          </div>
        )}

        {/* Tab 3: Season Filter */}
        {activeTab === "season" && (
          <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="explorer-subtab-container">
              <button
                onClick={() => setSeasonSubTab("approved")}
                className={`explorer-subtab ${seasonSubTab === "approved" ? "is-active" : ""}`}
              >
                Approved Items ({seasonApproved.length})
              </button>
              <button
                onClick={() => setSeasonSubTab("omitted")}
                className={`explorer-subtab ${seasonSubTab === "omitted" ? "is-active" : ""}`}
              >
                Excluded Items ({seasonOmitted.length})
              </button>
            </div>

            {seasonSubTab === "approved" ? (
              <EnterpriseTable
                columns={colsSeasonApproved}
                data={seasonApproved}
                searchKeys={["product_name", "sku_name", "category"]}
                searchPlaceholder="Search season-approved products…"
                emptyMessage="No season-approved products."
              />
            ) : (
              <EnterpriseTable
                columns={colsSeasonOmitted}
                data={seasonOmitted}
                searchKeys={["product_name", "sku_name", "category", "reason"]}
                searchPlaceholder="Search season-omitted products…"
                emptyMessage="No season-omitted products."
              />
            )}
          </div>
        )}

        {/* Tab 4: Store Filter */}
        {activeTab === "store" && (
          <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="explorer-subtab-container">
              <button
                onClick={() => setStoreSubTab("approved")}
                className={`explorer-subtab ${storeSubTab === "approved" ? "is-active" : ""}`}
              >
                Approved Items ({storeApproved.length})
              </button>
              <button
                onClick={() => setStoreSubTab("omitted")}
                className={`explorer-subtab ${storeSubTab === "omitted" ? "is-active" : ""}`}
              >
                Excluded Items ({storeOmitted.length})
              </button>
            </div>

            {storeSubTab === "approved" ? (
              <EnterpriseTable
                columns={colsStoreApproved}
                data={storeApproved}
                searchKeys={["product_name", "sku_name", "category"]}
                searchPlaceholder="Search store-approved products…"
                emptyMessage="No store-approved products."
              />
            ) : (
              <EnterpriseTable
                columns={colsStoreOmitted}
                data={storeOmitted}
                searchKeys={["product_name", "sku_name", "category", "reason"]}
                searchPlaceholder="Search store-omitted products…"
                emptyMessage="No store-omitted products."
              />
            )}
          </div>
        )}

        {/* Tab 5: Trend Intelligence */}
        {activeTab === "trend" && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#d4dff5] mb-4 flex items-center gap-2">
              Trending Product Opportunities
              <span className={`${badge} bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300`}>
                {trendingOpportunities.length}
              </span>
            </h3>
            <EnterpriseTable
              columns={colsTrendingProducts}
              data={trendingOpportunities}
              searchKeys={["product_name", "category", "trend_type", "trend_reason", "business_relevance", "risk_signal"]}
              searchPlaceholder="Search trending products…"
              emptyMessage="No trending products found."
            />
          </div>
        )}

        {/* Tab 5: Historical Validation */}
        {activeTab === "validation" && (
          <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="explorer-subtab-container">
              <button
                onClick={() => setValidationSubTab("all")}
                className={`explorer-subtab ${validationSubTab === "all" ? "is-active" : ""}`}
              >
                All ({allValidationProducts.length})
              </button>
              <button
                onClick={() => setValidationSubTab("validated")}
                className={`explorer-subtab ${validationSubTab === "validated" ? "is-active" : ""}`}
              >
                Synced Demand ({validated.length})
              </button>
              <button
                onClick={() => setValidationSubTab("new")}
                className={`explorer-subtab ${validationSubTab === "new" ? "is-active" : ""}`}
              >
                New Opportunities ({newOpportunities.length})
              </button>
              <button
                onClick={() => setValidationSubTab("missed")}
                className={`explorer-subtab ${validationSubTab === "missed" ? "is-active" : ""}`}
              >
                Missed Peaks ({missedHistorical.length})
              </button>
              <button
                onClick={() => setValidationSubTab("trending")}
                className={`explorer-subtab ${validationSubTab === "trending" ? "is-active" : ""}`}
              >
                Trending Opportunities ({trendingOpportunities.length})
              </button>
            </div>

            {validationSubTab === "all" && (
              <EnterpriseTable
                columns={colsValidationAll}
                data={allValidationProducts}
                searchKeys={["product_name", "sku_name", "source_type", "driver_type", "reason_details"]}
                searchPlaceholder="Search validation items…"
                emptyMessage="No validation items found."
              />
            )}
            {validationSubTab === "validated" && (
              <EnterpriseTable
                columns={colsValidated}
                data={validated}
                searchKeys={["product_name", "sku_name", "expected_demand_level", "driver_type"]}
                searchPlaceholder="Search synced products…"
                emptyMessage="No synced demand products found."
              />
            )}
            {validationSubTab === "new" && (
              <EnterpriseTable
                columns={colsNewOpportunities}
                data={newOpportunities}
                searchKeys={["product_name", "sku_name", "reason"]}
                searchPlaceholder="Search new openings…"
                emptyMessage="No new openings found."
              />
            )}
            {validationSubTab === "missed" && (
              <EnterpriseTable
                columns={colsMissedHistorical}
                data={missedHistorical}
                searchKeys={["product_name", "sku_name", "driver_type", "reason"]}
                searchPlaceholder="Search missed peaks…"
                emptyMessage="No missed peaks found."
              />
            )}
            {validationSubTab === "trending" && (
              <EnterpriseTable
                columns={colsTrendingProducts}
                data={trendingOpportunities}
                searchKeys={["product_name", "category", "trend_type", "trend_reason", "business_relevance", "risk_signal"]}
                searchPlaceholder="Search trending opportunities…"
                emptyMessage="No trending opportunities found."
              />
            )}
          </div>
        )}

        {/* Tab 6: Inventory Planning */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="explorer-subtab-container">
              <button
                onClick={() => setInventorySubTab("validated")}
                className={`explorer-subtab ${inventorySubTab === "validated" ? "is-active" : ""}`}
              >
                Historically Validated ({validatedPlan.length})
              </button>
              <button
                onClick={() => setInventorySubTab("new")}
                className={`explorer-subtab ${inventorySubTab === "new" ? "is-active" : ""}`}
              >
                New Opportunities ({newOpportunityPlan.length})
              </button>
              <button
                onClick={() => setInventorySubTab("missed")}
                className={`explorer-subtab ${inventorySubTab === "missed" ? "is-active" : ""}`}
              >
                Missed Historical ({missedHistoricalPlan.length})
              </button>
              <button
                onClick={() => setInventorySubTab("trending")}
                className={`explorer-subtab ${inventorySubTab === "trending" ? "is-active" : ""}`}
              >
                Trending Opportunities ({trendingPlan.length})
              </button>
            </div>

            {inventorySubTab === "all" && (
              <EnterpriseTable
                columns={colsInventoryAll}
                data={allInventoryPlan}
                searchKeys={["product_name", "plan_source", "stock_type", "stocking_priority", "stocking_window", "risk_level", "procurement_strategy", "recommendation"]}
                searchPlaceholder="Search total plan…"
                emptyMessage="No planning items available."
              />
            )}
            {inventorySubTab === "validated" && (
              <EnterpriseTable
                columns={colsInventoryPlanning}
                data={validatedPlan}
                searchKeys={["product_name", "stock_type", "stocking_priority", "stocking_window", "risk_level", "procurement_strategy", "recommendation"]}
                searchPlaceholder="Search plan…"
                emptyMessage="No planning items available."
              />
            )}
            {inventorySubTab === "new" && (
              <EnterpriseTable
                columns={colsInventoryPlanning}
                data={newOpportunityPlan}
                searchKeys={["product_name", "stock_type", "stocking_priority", "stocking_window", "risk_level", "procurement_strategy", "recommendation"]}
                searchPlaceholder="Search plan…"
                emptyMessage="No planning items available."
              />
            )}
            {inventorySubTab === "missed" && (
              <EnterpriseTable
                columns={colsInventoryPlanning}
                data={missedHistoricalPlan}
                searchKeys={["product_name", "stock_type", "stocking_priority", "stocking_window", "risk_level", "procurement_strategy", "recommendation"]}
                searchPlaceholder="Search plan…"
                emptyMessage="No planning items available."
              />
            )}
            {inventorySubTab === "trending" && (
              <EnterpriseTable
                columns={colsInventoryPlanning}
                data={trendingPlan}
                searchKeys={["product_name", "stock_type", "stocking_priority", "stocking_window", "risk_level", "procurement_strategy", "recommendation"]}
                searchPlaceholder="Search plan…"
                emptyMessage="No planning items available."
              />
            )}
          </div>
        )}

        {/* Tab 8: Supply Chain */}
        {activeTab === "supply_chain" && (
          <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="explorer-subtab-container">
              <button
                onClick={() => setSupplyChainSubTab("critical")}
                className={`explorer-subtab ${supplyChainSubTab === "critical" ? "is-active" : ""}`}
              >
                Critical Products ({scCritical.length})
              </button>
              <button
                onClick={() => setSupplyChainSubTab("emergency")}
                className={`explorer-subtab ${supplyChainSubTab === "emergency" ? "is-active" : ""}`}
              >
                Emergency Procurement ({scEmergency.length})
              </button>
              <button
                onClick={() => setSupplyChainSubTab("transfer")}
                className={`explorer-subtab ${supplyChainSubTab === "transfer" ? "is-active" : ""}`}
              >
                Warehouse Transfer ({scTransfer.length})
              </button>
              <button
                onClick={() => setSupplyChainSubTab("vendor")}
                className={`explorer-subtab ${supplyChainSubTab === "vendor" ? "is-active" : ""}`}
              >
                Vendor Onboarding ({scVendor.length})
              </button>
              <button
                onClick={() => setSupplyChainSubTab("new_sku")}
                className={`explorer-subtab ${supplyChainSubTab === "new_sku" ? "is-active" : ""}`}
              >
                New SKU Launch ({scNewSku.length})
              </button>
              <button
                onClick={() => setSupplyChainSubTab("safe")}
                className={`explorer-subtab ${supplyChainSubTab === "safe" ? "is-active" : ""}`}
              >
                Safe Inventory ({scSafe.length})
              </button>
            </div>

            {supplyChainSubTab === "critical" && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#d4dff5] mb-4 flex items-center gap-2">
                  Critical Products
                  <span className={`${badge} bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300`}>
                    {scCritical.length}
                  </span>
                </h3>
                <EnterpriseTable
                  columns={colsCritical}
                  data={scCritical}
                  searchKeys={["product_name", "warehouse", "priority", "recommended_action"]}
                  searchPlaceholder="Search critical products…"
                  emptyMessage="No critical products found."
                />
              </div>
            )}
            {supplyChainSubTab === "emergency" && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#d4dff5] mb-4 flex items-center gap-2">
                  Emergency Procurement
                  <span className={`${badge} bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300`}>
                    {scEmergency.length}
                  </span>
                </h3>
                <EnterpriseTable
                  columns={colsEmergency}
                  data={scEmergency}
                  searchKeys={["product_name", "procurement_recommendation", "recommendation"]}
                  searchPlaceholder="Search emergency orders…"
                  emptyMessage="No emergency procurement orders found."
                />
              </div>
            )}
            {supplyChainSubTab === "transfer" && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#d4dff5] mb-4 flex items-center gap-2">
                  Warehouse Transfer
                  <span className={`${badge} bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300`}>
                    {scTransfer.length}
                  </span>
                </h3>
                <EnterpriseTable
                  columns={colsTransfer}
                  data={scTransfer}
                  searchKeys={["product_name", "source_warehouse", "destination_warehouse", "transfer_reason"]}
                  searchPlaceholder="Search warehouse transfers…"
                  emptyMessage="No warehouse transfers found."
                />
              </div>
            )}
            {supplyChainSubTab === "vendor" && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#d4dff5] mb-4 flex items-center gap-2">
                  Vendor Onboarding
                  <span className={`${badge} bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300`}>
                    {scVendor.length}
                  </span>
                </h3>
                <EnterpriseTable
                  columns={colsVendor}
                  data={scVendor}
                  searchKeys={["product_name", "business_opportunity", "procurement_strategy", "recommendation"]}
                  searchPlaceholder="Search vendor recommendations…"
                  emptyMessage="No vendor recommendations found."
                />
              </div>
            )}
            {supplyChainSubTab === "new_sku" && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#d4dff5] mb-4 flex items-center gap-2">
                  New SKU Launch
                  <span className={`${badge} bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300`}>
                    {scNewSku.length}
                  </span>
                </h3>
                <EnterpriseTable
                  columns={colsNewSKU}
                  data={scNewSku}
                  searchKeys={["product_name", "business_reason", "recommendation"]}
                  searchPlaceholder="Search new SKU launches…"
                  emptyMessage="No new SKU launches found."
                />
              </div>
            )}
            {supplyChainSubTab === "safe" && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#d4dff5] mb-4 flex items-center gap-2">
                  Safe Inventory
                  <span className={`${badge} bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300`}>
                    {scSafe.length}
                  </span>
                </h3>
                <EnterpriseTable
                  columns={colsSafe}
                  data={scSafe}
                  searchKeys={["product_name", "warehouse", "status"]}
                  searchPlaceholder="Search safe inventory…"
                  emptyMessage="No safe inventory found."
                />
              </div>
            )}
          </div>
        )}
      </div>

      {selectedStoryProduct && (
        <ProductDemandStoryModal
          product={selectedStoryProduct}
          planningDate={planningDate}
          festivalDate={festivalPeriod}
          onClose={() => setSelectedStoryProduct(null)}
        />
      )}
    </SectionCard>
  );
}
