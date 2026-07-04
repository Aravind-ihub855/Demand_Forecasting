import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getAnalyticsFilters,
  getExecutiveKpis,
  getStoreSalesTrend,
  getProductSalesTrend,
  getCategorySalesTrend,
  getWarehouseMovementTrend,
  getFestivalPeakTrend,
  getPromotionPeakTrend,
  getDriverContributionTrend,
  getFactorImpact,
  getEffectShare,
  getFeatureCoverage,
  getRealtimeInsights,
  getFestivalPromotionProducts,
} from "../api/analyticsApi";

const GRANULARITIES = ["daily", "weekly", "monthly", "quarterly", "yearly"];

const COLORS = [
  "#5B7FFF", "#F59E0B", "#22C55E", "#EC4899", "#8B5CF6",
  "#14B8A6", "#F97316", "#06B6D4", "#EF4444", "#84CC16",
];

// ── Helper components ────────────────────────────────────────────────────────

function KpiCard({ title, value, subtitle }) {
  return (
    <article className="panel an-kpi-card">
      <p className="an-kpi-title">{title}</p>
      <h3>{value}</h3>
      {subtitle ? <p>{subtitle}</p> : null}
    </article>
  );
}

function Select({ label, value, onChange, options = [], valueKey, labelKey }) {
  return (
    <label className="an-filter">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt[valueKey]} value={opt[valueKey]}>
            {opt[labelKey]}
          </option>
        ))}
      </select>
    </label>
  );
}

// ── Utilities ────────────────────────────────────────────────────────────────

function formatCurrency(v) {
  const n = Number(v || 0);
  return `Rs ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function mapCommonParams(params) {
  const mapped = { ...params };
  if (mapped.festival_filter && !mapped.festival_name) {
    mapped.festival_name = mapped.festival_filter;
  }
  if (mapped.weather_filter && !mapped.weather_condition) {
    mapped.weather_condition = mapped.weather_filter;
  }
  if (
    mapped.promotion_filter &&
    mapped.promotion_filter !== "promoted" &&
    mapped.promotion_filter !== "non_promoted"
  ) {
    mapped.promotion_type = mapped.promotion_filter;
    mapped.promotion_filter = undefined;
  }
  return mapped;
}

/** Pivot an array of { period, key, value } rows into recharts-friendly objects */
function pivotRows(rows, keyField, valueField) {
  const map = new Map();
  const series = new Set();
  for (const row of rows) {
    const period = row.period;
    const key = row[keyField];
    const val = Number(row[valueField] || 0);
    series.add(key);
    if (!map.has(period)) map.set(period, { period });
    map.get(period)[key] = (map.get(period)[key] || 0) + val;
  }
  return { data: [...map.values()], series: [...series] };
}

// ── Main component ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  // ── Filters ────────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    stores: [],
    warehouses: [],
    products: [],
    categories: [],
    festivals: [],
    promotionTypes: [],
    weathers: [],
  });
  const [granularity, setGranularity] = useState("monthly");
  const [storeId, setStoreId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [festivalFilter, setFestivalFilter] = useState("");
  const [promotionFilter, setPromotionFilter] = useState("");
  const [weatherFilter, setWeatherFilter] = useState("");
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-12-31");

  // ── Chart data ─────────────────────────────────────────────────────────────
  const [kpis, setKpis] = useState(null);
  const [insights, setInsights] = useState([]);
  const [storeTrend, setStoreTrend] = useState([]);
  const [productTrend, setProductTrend] = useState([]);
  const [categoryTrend, setCategoryTrend] = useState([]);
  const [warehouseMovement, setWarehouseMovement] = useState([]);
  const [festivalPeak, setFestivalPeak] = useState([]);
  const [promotionPeak, setPromotionPeak] = useState([]);
  const [driverTrend, setDriverTrend] = useState([]);
  const [factorImpact, setFactorImpact] = useState([]);
  const [effectShare, setEffectShare] = useState([]);
  const [featureCoverage, setFeatureCoverage] = useState([]);
  const [festivalPromotionProducts, setFestivalPromotionProducts] = useState([]);
  const [festivalTopChartFestival, setFestivalTopChartFestival] = useState("Diwali");
  const [festivalTopChartStore, setFestivalTopChartStore] = useState("");
  const [festivalTopLoading, setFestivalTopLoading] = useState(false);

  // ── Status ─────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Load filters once ──────────────────────────────────────────────────────
  useEffect(() => {
    getAnalyticsFilters()
      .then(setFilters)
      .catch((e) => setError(e?.response?.data?.message || "Failed to load filters"));
  }, []);

  // ── Load main analytics when params change ─────────────────────────────────
  useEffect(() => {
    const paramsBase = mapCommonParams({
      granularity,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      festival_filter: festivalFilter || undefined,
      promotion_filter: promotionFilter || undefined,
      weather_filter: weatherFilter || undefined,
    });

    const paramsStore = { ...paramsBase, store_id: storeId || undefined };
    const paramsWarehouse = { ...paramsBase, warehouse_id: warehouseId || undefined };
    const paramsProduct = {
      ...paramsBase,
      store_id: storeId || undefined,
      warehouse_id: warehouseId || undefined,
      sku_id: productId || undefined,
      category_id: categoryId || undefined,
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          kpiRes,
          insightRes,
          storeTrendRes,
          productTrendRes,
          categoryTrendRes,
          warehouseRes,
          festivalRes,
          promotionRes,
          driverRes,
          factorRes,
          effectRes,
          featureRes,
        ] = await Promise.all([
          getExecutiveKpis(paramsProduct),
          getRealtimeInsights(paramsProduct),
          getStoreSalesTrend(paramsStore),
          getProductSalesTrend(paramsProduct),
          getCategorySalesTrend(paramsProduct),
          getWarehouseMovementTrend(paramsWarehouse),
          getFestivalPeakTrend(paramsProduct),
          getPromotionPeakTrend(paramsProduct),
          getDriverContributionTrend(paramsProduct),
          getFactorImpact(paramsProduct),
          getEffectShare(paramsProduct),
          getFeatureCoverage(paramsProduct),
        ]);

        setKpis(kpiRes);
        setInsights(insightRes.rows || []);
        setStoreTrend(storeTrendRes.rows || []);
        setProductTrend(productTrendRes.rows || []);
        setCategoryTrend(categoryTrendRes.rows || []);
        setWarehouseMovement(warehouseRes.rows || []);
        setFestivalPeak(festivalRes.rows || []);
        setPromotionPeak(promotionRes.rows || []);
        setDriverTrend(driverRes.rows || []);
        setFactorImpact(factorRes.rows || []);
        setEffectShare(effectRes.rows || []);
        setFeatureCoverage(featureRes.rows || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    granularity,
    storeId,
    productId,
    warehouseId,
    categoryId,
    festivalFilter,
    promotionFilter,
    weatherFilter,
    fromDate,
    toDate,
  ]);

  // ── Festival top-products (independent trigger) ────────────────────────────
  useEffect(() => {
    const loadFestivalTopProducts = async () => {
      try {
        setFestivalTopLoading(true);
        const res = await getFestivalPromotionProducts({
          festival_name: festivalTopChartFestival || undefined,
          store_id: festivalTopChartStore || undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
          limit: 300,
        });
        setFestivalPromotionProducts(res.rows || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load top festival products");
      } finally {
        setFestivalTopLoading(false);
      }
    };
    loadFestivalTopProducts();
  }, [festivalTopChartFestival, festivalTopChartStore, fromDate, toDate]);

  // ── Derived / pivoted data ─────────────────────────────────────────────────
  const { data: storePivot, series: storeSeries } = useMemo(
    () => pivotRows(storeTrend, "store_name", "total_sales"),
    [storeTrend]
  );
  const { data: productPivot, series: productSeries } = useMemo(
    () => pivotRows(productTrend, "sku_name", "total_sales"),
    [productTrend]
  );
  const { data: categoryPivot, series: categorySeries } = useMemo(
    () => pivotRows(categoryTrend, "category_name", "total_sales"),
    [categoryTrend]
  );
  const { data: movementPivot, series: movementSeries } = useMemo(
    () => pivotRows(warehouseMovement, "warehouse_name", "quantity_moved"),
    [warehouseMovement]
  );

  const festivalTopProductsChart = useMemo(() => {
    const agg = new Map();
    for (const row of festivalPromotionProducts) {
      const key = row.sku_name;
      const prev = agg.get(key) || { units_sold: 0, uplift_pct: -999999 };
      agg.set(key, {
        units_sold: prev.units_sold + Number(row.total_units_sold || 0),
        uplift_pct: Math.max(prev.uplift_pct, Number(row.uplift_pct ?? -999999)),
      });
    }
    return [...agg.entries()]
      .map(([sku_name, values]) => ({ sku_name, ...values }))
      .sort((a, b) => {
        if (b.uplift_pct !== a.uplift_pct) return b.uplift_pct - a.uplift_pct;
        return b.units_sold - a.units_sold;
      })
      .slice(0, 12);
  }, [festivalPromotionProducts]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="analytics-page">
      {/* Header */}
      <header className="an-header">
        <h2>Retail Demand Intelligence Command Center</h2>
        <p>
          Enterprise analytics view proving demand realism, business event impact, and forecasting
          readiness for D-Mart Coimbatore operations.
        </p>
      </header>

      {error && <div className="an-error">{error}</div>}

      {/* Global Filters */}
      <section className="panel an-filters-panel">
        <div className="an-filters-row">
          <label className="an-filter">
            <span>Granularity</span>
            <select value={granularity} onChange={(e) => setGranularity(e.target.value)}>
              {GRANULARITIES.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="an-filter">
            <span>Date From</span>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>

          <label className="an-filter">
            <span>Date To</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>

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
            label="Product"
            value={productId}
            onChange={setProductId}
            options={filters.products}
            valueKey="sku_id"
            labelKey="sku_name"
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
            label="Festival"
            value={festivalFilter}
            onChange={setFestivalFilter}
            options={filters.festivals}
            valueKey="festival_name"
            labelKey="festival_name"
          />

          <label className="an-filter">
            <span>Promotion</span>
            <select value={promotionFilter} onChange={(e) => setPromotionFilter(e.target.value)}>
              <option value="">All</option>
              <option value="promoted">Promoted only</option>
              <option value="non_promoted">Non-promo only</option>
              {filters.promotionTypes.map((p) => (
                <option key={p.promotion_type} value={p.promotion_type}>
                  {p.promotion_type}
                </option>
              ))}
            </select>
          </label>

          <Select
            label="Weather"
            value={weatherFilter}
            onChange={setWeatherFilter}
            options={filters.weathers}
            valueKey="weather_condition"
            labelKey="weather_condition"
          />
        </div>
      </section>

      {/* KPI Grid */}
      <div className="an-kpi-grid">
        {loading && !kpis ? (
          <p>Loading KPIs...</p>
        ) : (
          <>
            <KpiCard title="Total Revenue" value={formatCurrency(kpis?.totalRevenue)} />
            <KpiCard title="Total Units Sold" value={(kpis?.totalUnitsSold || 0).toLocaleString()} />
            <KpiCard title="Top Performing Store" value={kpis?.topPerformingStore || "-"} />
            <KpiCard title="Top Selling SKU" value={kpis?.topSellingSku || "-"} />
            <KpiCard title="Forecast Readiness Score" value={`${kpis?.forecastReadinessScore || 0}%`} />
            <KpiCard title="Stockout Events" value={(kpis?.stockoutEvents || 0).toLocaleString()} />
            <KpiCard title="Promotion ROI" value={`${kpis?.promotionROI || 0}%`} />
            <KpiCard title="Inventory Turnover" value={`${kpis?.inventoryTurnover || 0}`} />
            <KpiCard title="Avg Daily Sales" value={formatCurrency(kpis?.avgDailySales)} />
            <KpiCard
              title="Festival Revenue Contribution"
              value={`${kpis?.festivalRevenueContribution || 0}%`}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="an-charts-grid">

        {/* 1) Store Sales Trend */}
        <article className="panel an-panel-lg">
          <h3>1) Sales Growth Analytics (Store Comparison)</h3>
          {loading && storeTrend.length === 0 ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={storePivot}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                {storeSeries.map((s, i) => (
                  <Bar key={s} dataKey={s} fill={COLORS[i % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>

        {/* 2A) Product Sales Trend */}
        <article className="panel an-panel-lg">
          <h3>2A) Product-wise Sales Analytics</h3>
          {loading && productTrend.length === 0 ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={productPivot}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                {productSeries.map((s, i) => (
                  <Bar key={s} dataKey={s} fill={COLORS[i % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>

        {/* 2B) Category Sales Trend */}
        <article className="panel an-panel-lg">
          <h3>2B) Category-wise Sales Analytics</h3>
          {loading && categoryTrend.length === 0 ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={categoryPivot}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                {categorySeries.map((s, i) => (
                  <Bar key={s} dataKey={s} fill={COLORS[i % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>

        {/* 3) Warehouse Movement */}
        <article className="panel an-panel-lg">
          <h3>3) Warehouse to Store Movement Analytics</h3>
          {loading && warehouseMovement.length === 0 ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={movementPivot}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                {movementSeries.map((s, i) => (
                  <Bar key={s} dataKey={s} stackId="1" fill={COLORS[i % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>

        {/* 4) Festival Demand */}
        <article className="panel an-panel-md">
          <h3>4) Festival Demand Analytics</h3>
          {loading && festivalPeak.length === 0 ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={festivalPeak}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_sales" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>

        {/* 5) Promotion Impact */}
        <article className="panel an-panel-md">
          <h3>5) Promotion Impact Analytics</h3>
          {loading && promotionPeak.length === 0 ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={promotionPeak}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_sales" fill="#22C55E" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>

        {/* 6) Demand Drivers */}
        <article className="panel an-panel-lg">
          <h3>6) Demand Driver Analytics</h3>
          {loading && driverTrend.length === 0 ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={driverTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="festival_sales" stroke="#F59E0B" dot={false} />
                <Line type="monotone" dataKey="promotion_sales" stroke="#22C55E" dot={false} />
                <Line type="monotone" dataKey="competitor_sales" stroke="#EC4899" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </article>

        {/* 7A) Effect Share */}
        <article className="panel an-panel-md">
          <h3>7A) Sales Impact Distribution</h3>
          {loading && effectShare.length === 0 ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={effectShare} dataKey="percentage" nameKey="name" outerRadius={95} label>
                  {effectShare.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </article>

        {/* 7B) Factor Impact */}
        <article className="panel an-panel-md">
          <h3>7B) Weighted Factor Impact</h3>
          {loading && factorImpact.length === 0 ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={factorImpact}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="factor" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#5B7FFF" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>

        {/* 8) Feature Coverage */}
        <article className="panel an-panel-lg">
          <h3>8) Forecasting Readiness Analytics</h3>
          {loading && featureCoverage.length === 0 ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={featureCoverage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="coverage_pct" fill="#8B5CF6" name="Coverage %" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>

        {/* 10) Real-time Insights */}
        <article className="panel an-panel-lg">
          <h3>10) Real-time Insight Panel</h3>
          <div className="an-insights-grid">
            {insights.map((ins, idx) => (
              <div key={`${ins}-${idx}`} className="an-insight-card">
                <span className="an-insight-dot" />
                <p>{ins}</p>
              </div>
            ))}
            {!insights.length && <p>No insights available for selected filters.</p>}
          </div>
        </article>

        {/* Festival Top Products Validation */}
        <article className="panel an-panel-lg">
          <h3>Festival Top Products Validation</h3>
          <div className="an-inline-controls">
            <label className="an-filter">
              <span>Festival</span>
              <select
                value={festivalTopChartFestival}
                onChange={(e) => setFestivalTopChartFestival(e.target.value)}
              >
                {(filters.festivals || []).map((f) => (
                  <option key={f.festival_name} value={f.festival_name}>
                    {f.festival_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="an-filter">
              <span>Store</span>
              <select
                value={festivalTopChartStore}
                onChange={(e) => setFestivalTopChartStore(e.target.value)}
              >
                <option value="">All Stores</option>
                {(filters.stores || []).map((s) => (
                  <option key={s.store_id} value={s.store_id}>
                    {s.store_name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {festivalTopLoading ? (
            <p>Loading top products...</p>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={festivalTopProductsChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sku_name" interval={0} angle={-20} textAnchor="end" height={90} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="uplift_pct" fill="#F59E0B" name="Festival Uplift %" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>

      </div>
    </div>
  );
}