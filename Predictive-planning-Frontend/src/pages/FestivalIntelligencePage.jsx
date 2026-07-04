import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  analyzeFestivalIntelligence,
  getFestivalIntelligenceFilters,
} from "../api/festivalIntelligenceApi";

function Select({ label, value, onChange, options, valueKey, labelKey, includeAll = true }) {
  return (
    <label className="an-filter">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {includeAll && <option value="">All</option>}
        {options.map((o) => (
          <option key={valueKey ? o[valueKey] : o} value={valueKey ? o[valueKey] : o}>
            {labelKey ? o[labelKey] : o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Kpi({ title, value }) {
  return (
    <article className="panel an-kpi-card">
      <p className="an-kpi-title">{title}</p>
      <h3>{value}</h3>
    </article>
  );
}

function formatCurrency(v) {
  const n = Number(v || 0);
  return `Rs ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

const FestivalIntelligencePage = () => {
  const [filters, setFilters] = useState({
    festivals: [],
    stores: [],
    warehouses: [],
    products: [],
    categories: [],
  });
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  const [festival, setFestival] = useState("Diwali");
  const [storeId, setStoreId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [skuId, setSkuId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-12-31");

  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingFilters(true);
        const data = await getFestivalIntelligenceFilters();
        setFilters(data);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load festival filters");
      } finally {
        setLoadingFilters(false);
      }
    };
    load();
  }, []);

  const runAnalysis = async () => {
    try {
      setLoadingData(true);
      setError("");
      const data = await analyzeFestivalIntelligence({
        festival_name: festival,
        store_id: storeId || undefined,
        warehouse_id: warehouseId || undefined,
        sku_id: skuId || undefined,
        category_id: categoryId || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      });
      setResult(data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to run festival intelligence");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!loadingFilters) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingFilters]);

  const storeGrowthChart = useMemo(
    () => (result?.store_comparison || []).slice(0, 8),
    [result]
  );
  const topProductChart = useMemo(
    () =>
      (result?.top_festival_products || []).slice(0, 8).map((r) => ({
        ...r,
        label: r.sku_name.length > 16 ? `${r.sku_name.slice(0, 16)}...` : r.sku_name,
      })),
    [result]
  );
  const showLoadingOverlay = loadingFilters || loadingData;

  return (
    <section className="stack-panels analytics-page fi-page">
      {showLoadingOverlay && (
        <div className="fi-loading-overlay" role="status" aria-live="polite" aria-busy="true">
          <div className="fi-loading-card">
            <div className="fi-loader-orbit">
              <span className="fi-orbit fi-orbit-1" />
              <span className="fi-orbit fi-orbit-2" />
              <span className="fi-orbit fi-orbit-3" />
              <span className="fi-core" />
            </div>
            <h3>{loadingFilters ? "Loading festival intelligence setup..." : "Running AI analysis..."}</h3>
            <p>
              {loadingFilters
                ? "Preparing filters and metadata."
                : "Crunching demand signals, forecast, refill, and risk insights."}
            </p>
          </div>
        </div>
      )}
      <article className="panel">
        <h2>AI Festival Demand Intelligence</h2>
        <p>
          Token-efficient festival forecasting intelligence using MongoDB aggregations + Gemini
          reasoning.
        </p>

        <div className="an-filters">
          <Select
            label="Festival"
            value={festival}
            onChange={setFestival}
            options={filters.festivals}
            includeAll={false}
          />
          <Select
            label="Store"
            value={storeId}
            onChange={setStoreId}
            options={filters.stores}
            valueKey="store_id"
            labelKey="store_name"
          />
          <Select
            label="Warehouse"
            value={warehouseId}
            onChange={setWarehouseId}
            options={filters.warehouses}
            valueKey="warehouse_id"
            labelKey="warehouse_name"
          />
          <Select
            label="Category"
            value={categoryId}
            onChange={setCategoryId}
            options={filters.categories}
            valueKey="category_id"
            labelKey="category_name"
          />
          <Select
            label="Product SKU"
            value={skuId}
            onChange={setSkuId}
            options={filters.products}
            valueKey="sku_id"
            labelKey="sku_name"
          />
          <label className="an-filter">
            <span>Date From</span>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label className="an-filter">
            <span>Date To</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <label className="an-filter">
            <span>Action</span>
            <button type="button" onClick={runAnalysis} disabled={loadingData}>
              {loadingData ? "Running..." : "Run AI Analysis"}
            </button>
          </label>
        </div>
        {error && <p className="error">{error}</p>}
      </article>

      <div className="an-kpi-grid">
        <Kpi title="Festival" value={result?.festival || "-"} />
        <Kpi title="Footfall Growth" value={`${result?.footfall_growth_pct || 0}%`} />
        <Kpi title="Promotion Impact" value={`${result?.promotion_impact_pct || 0}%`} />
        <Kpi title="Forecast Rows" value={(result?.festival_demand_forecast || []).length} />
        <Kpi title="Stockout Alerts" value={(result?.stockout_alerts || []).length} />
        <Kpi title="Refill Actions" value={(result?.inventory_recommendations || []).length} />
        <Kpi
          title="Avg Readiness"
          value={`${(
            (result?.festival_readiness_score || []).reduce((a, b) => a + b.readiness_score, 0) /
            ((result?.festival_readiness_score || []).length || 1)
          ).toFixed(1)}%`}
        />
      </div>

      <div className="an-grid">
        <article className="panel an-panel-lg">
          <h3>Festival Demand Forecast</h3>
          <div className="fi-table-wrap">
            <table className="fi-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Store</th>
                  <th>Normal Demand (Daily Avg)</th>
                  <th>Festival Forecast (Daily)</th>
                  <th>Incremental Units</th>
                  <th>Demand Uplift %</th>
                </tr>
              </thead>
              <tbody>
                {(result?.festival_demand_forecast || []).slice(0, 25).map((r) => (
                  <tr key={`${r.sku_id}-${r.store_id}`}>
                    <td data-label="SKU" className="fi-cell-strong">
                      {r.sku_name}
                    </td>
                    <td data-label="Store">{r.store_id}</td>
                    <td data-label="Normal (Daily Avg)" className="fi-cell-num">
                      {r.normal_demand}
                    </td>
                    <td data-label="Festival Forecast (Daily)" className="fi-cell-num">
                      {r.festival_forecast}
                    </td>
                    <td data-label="Incremental Units" className="fi-cell-num fi-cell-emph">
                      {r.incremental_demand ?? Math.max(0, Number(r.festival_forecast || 0) - Number(r.normal_demand || 0))}
                    </td>
                    <td data-label="Uplift %" className="fi-cell-num">
                      {r.demand_uplift_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h3>Store-wise Demand Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={storeGrowthChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="store_id" tickMargin={10} />
              <YAxis tickMargin={10} />
              <Tooltip />
              <Legend />
              <Bar dataKey="demand_growth_pct" fill="#5B7FFF" name="Growth %" />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel">
          <h3>Top Festival Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" interval={0} angle={-18} textAnchor="end" height={70} />
              <YAxis tickMargin={10} />
              <Tooltip />
              <Bar dataKey="units_sold" fill="#F59E0B" name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel an-panel-lg">
          <h3>Inventory Refill Recommendation</h3>
          <div className="fi-table-wrap">
            <table className="fi-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Store</th>
                  <th>Current Stock</th>
                  <th>Forecast Demand</th>
                  <th>Suggested Refill</th>
                </tr>
              </thead>
              <tbody>
                {(result?.inventory_recommendations || []).slice(0, 25).map((r) => (
                  <tr key={`${r.sku_id}-${r.store_id}`}>
                    <td data-label="SKU" className="fi-cell-strong">
                      {r.sku_name}
                    </td>
                    <td data-label="Store">{r.store_id}</td>
                    <td data-label="Current Stock" className="fi-cell-num">
                      {r.current_stock}
                    </td>
                    <td data-label="Forecast Demand" className="fi-cell-num">
                      {r.forecast_demand}
                    </td>
                    <td data-label="Suggested Refill" className="fi-cell-num fi-cell-emph">
                      {r.suggested_refill_qty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h3>Stockout Risk Alerts</h3>
          <div className="fi-table-wrap">
            <table className="fi-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Store</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {(result?.stockout_alerts || []).slice(0, 20).map((r) => (
                  <tr key={`${r.sku_id}-${r.store_id}`}>
                    <td data-label="SKU" className="fi-cell-strong">
                      {r.sku_name}
                    </td>
                    <td data-label="Store">{r.store_id}</td>
                    <td data-label="Risk">
                      <span className={`fi-pill fi-pill-${String(r.risk_level || "").toLowerCase()}`}>{r.risk_level}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h3>Promotion Impact Analysis</h3>
          <div className="fi-table-wrap">
            <table className="fi-table">
              <thead>
                <tr>
                  <th>Promotion Type</th>
                  <th>Demand Increase %</th>
                </tr>
              </thead>
              <tbody>
                {(result?.promotion_impact || []).slice(0, 12).map((r) => (
                  <tr key={r.promotion_type}>
                    <td data-label="Promotion Type" className="fi-cell-strong">
                      {r.promotion_type}
                    </td>
                    <td data-label="Demand Increase %" className="fi-cell-num">
                      {r.demand_increase_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel an-panel-lg">
          <h3>Festival Readiness Score</h3>
          <div className="fi-table-wrap">
            <table className="fi-table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Readiness Score</th>
                </tr>
              </thead>
              <tbody>
                {(result?.festival_readiness_score || []).map((r) => (
                  <tr key={r.store_id}>
                    <td data-label="Store" className="fi-cell-strong">
                      {r.store_id}
                    </td>
                    <td data-label="Readiness Score" className="fi-cell-num">
                      {r.readiness_score}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel an-panel-lg">
          <h3>AI Demand Explanation</h3>
          <p>{result?.ai_demand_explanation || "No AI explanation yet."}</p>
          <h3 style={{ marginTop: "0.9rem" }}>Executive Summary</h3>
          <p>{result?.ai_executive_summary || "No executive summary yet."}</p>
          <div className="an-insights-grid" style={{ marginTop: "0.8rem" }}>
            {(result?.ai_key_insights || []).map((ins, idx) => (
              <div className="an-insight-card" key={`${ins}-${idx}`}>
                <span className="an-insight-dot" />
                <p>{ins}</p>
              </div>
            ))}
          </div>
          <div className="an-insights-grid" style={{ marginTop: "0.6rem" }}>
            {(result?.ai_risk_alerts || []).map((ins, idx) => (
              <div className="an-insight-card" key={`${ins}-${idx}`}>
                <span className="an-insight-dot" />
                <p>{ins}</p>
              </div>
            ))}
          </div>
          <div className="an-insights-grid" style={{ marginTop: "0.6rem" }}>
            {(result?.ai_inventory_recommendations || []).slice(0, 8).map((rec, idx) => (
              <div className="an-insight-card" key={`${rec.sku}-${idx}`}>
                <span className="an-insight-dot" />
                <p>
                  <strong>{rec.sku}:</strong> {rec.action} ({rec.reason})
                </p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: "0.8rem" }}>
            Estimated refill value based on top suggestions:{" "}
            {formatCurrency(
              (result?.inventory_recommendations || [])
                .slice(0, 20)
                .reduce((acc, r) => acc + r.suggested_refill_qty * (r.forecast_demand ? r.forecast_demand / Math.max(r.forecast_demand, 1) : 1), 0)
            )}
          </p>
        </article>
      </div>
    </section>
  );
};

export default FestivalIntelligencePage;

