import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getRetailPulseCatalog,
  getRetailPulseOverview,
  getRetailPulseFilters,
  getRetailPulsePhaseComparison,
  getRetailPulseMonthlyTrend,
  getRetailPulseFestivalSpikeProducts,
  getRetailPulseFestivalCategorySpikes,
  getRetailPulseConfidenceReport,
  getRetailPulseDailySalesProducts,
  getRetailPulseDailySales,
} from "../api/retailPulseApi";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const COLORS = [
  "#5B7FFF", "#F59E0B", "#22C55E", "#EC4899", "#8B5CF6",
  "#14B8A6", "#F97316", "#06B6D4", "#EF4444", "#84CC16",
];

const TYPE_BADGE = {
  dimension: "so-badge-dim",
  fact: "so-badge-fact",
  external: "so-badge-ext",
};

function KpiCard({ title, value, subtitle }) {
  return (
    <article className="panel an-kpi-card">
      <p className="an-kpi-title">{title}</p>
      <h3>{value}</h3>
      {subtitle ? <p>{subtitle}</p> : null}
    </article>
  );
}

function formatNum(n) {
  return Number(n || 0).toLocaleString("en-IN");
}

function formatCr(n) {
  const val = Number(n || 0);
  if (val >= 1e7) return `₹${(val / 1e7).toFixed(1)} Cr`;
  if (val >= 1e5) return `₹${(val / 1e5).toFixed(1)} L`;
  return `₹${formatNum(val)}`;
}

function formatFestival(name) {
  return String(name || "").replace(/_/g, " ");
}

export default function SpikeObservatoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [catalog, setCatalog] = useState(null);
  const [overview, setOverview] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [phaseData, setPhaseData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [filters, setFilters] = useState({ festivals: [], stores: [] });

  const [selectedFestival, setSelectedFestival] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [spikeYear, setSpikeYear] = useState(2024);
  const [spikeProducts, setSpikeProducts] = useState([]);
  const [categorySpikes, setCategorySpikes] = useState([]);
  const [spikeMeta, setSpikeMeta] = useState(null);
  const [spikeLoading, setSpikeLoading] = useState(false);

  const [expandedTable, setExpandedTable] = useState(null);
  const [activeTab, setActiveTab] = useState("vault");

  const [dailyProducts, setDailyProducts] = useState([]);
  const [dailyCategory, setDailyCategory] = useState("");
  const [dailySku, setDailySku] = useState("");
  const [dailyYear, setDailyYear] = useState(2024);
  const [dailyMonth, setDailyMonth] = useState(11);
  const [dailyData, setDailyData] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [
          catalogRes,
          overviewRes,
          confidenceRes,
          phaseRes,
          trendRes,
          filterRes,
        ] = await Promise.all([
          getRetailPulseCatalog(),
          getRetailPulseOverview(),
          getRetailPulseConfidenceReport(),
          getRetailPulsePhaseComparison(),
          getRetailPulseMonthlyTrend(),
          getRetailPulseFilters(),
        ]);

        setCatalog(catalogRes);
        setOverview(overviewRes);
        setConfidence(confidenceRes);
        setPhaseData(phaseRes);
        setMonthlyTrend(trendRes);
        setFilters(filterRes);

        const firstFestival = filterRes.festivals?.[0] || "";
        setSelectedFestival(firstFestival);
        if (filterRes.years?.length) {
          setSpikeYear(filterRes.years[filterRes.years.length - 1]);
        }

        const firstCategory = filterRes.categories?.[0]?.categoryId || "";
        setDailyCategory(firstCategory);
      } catch (err) {
        console.error(err);
        setError("Failed to load Spike Observatory data. Ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedFestival || !spikeYear) return;

    async function loadSpikes() {
      setSpikeLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getRetailPulseFestivalSpikeProducts({
            festival: selectedFestival,
            year: spikeYear,
            storeId: selectedStore || undefined,
            limit: 50,
          }),
          getRetailPulseFestivalCategorySpikes(selectedFestival, spikeYear),
        ]);
        setSpikeProducts(productsRes.products || []);
        setCategorySpikes(categoriesRes.categories || []);
        setSpikeMeta({
          dataSource: productsRes.dataSource,
          granularity: productsRes.granularity,
          methodology: productsRes.methodology,
          year: productsRes.year,
          storeScope: productsRes.storeScope,
        });
      } catch (err) {
        console.error(err);
        setSpikeProducts([]);
        setCategorySpikes([]);
        setSpikeMeta(null);
      } finally {
        setSpikeLoading(false);
      }
    }
    loadSpikes();
  }, [selectedFestival, selectedStore, spikeYear]);

  // Daily sales — load products when category changes
  useEffect(() => {
    if (!dailyCategory) return;
    async function loadProducts() {
      try {
        const { products } = await getRetailPulseDailySalesProducts(dailyCategory);
        setDailyProducts(products || []);
        if (products?.length) {
          setDailySku((prev) =>
            products.some((p) => p.skuId === prev) ? prev : products[0].skuId
          );
        }
      } catch (err) {
        console.error("Failed to load daily sales products:", err);
      }
    }
    loadProducts();
  }, [dailyCategory]);

  // Daily sales — load month data
  useEffect(() => {
    if (!dailySku || !dailyYear || !dailyMonth) return;
    async function loadDaily() {
      setDailyLoading(true);
      try {
        const data = await getRetailPulseDailySales({
          skuId: dailySku,
          year: dailyYear,
          month: dailyMonth,
        });
        setDailyData(data);
      } catch (err) {
        console.error("Failed to load daily sales:", err);
        setDailyData(null);
      } finally {
        setDailyLoading(false);
      }
    }
    loadDaily();
  }, [dailySku, dailyYear, dailyMonth]);

  const phaseChartData = useMemo(
    () =>
      phaseData.map((p) => ({
        name: p.label,
        avgUnits: p.avgUnitsPerRecord,
        totalUnits: Math.round(p.totalUnits / 1000),
        sharePct: p.sharePct,
      })),
    [phaseData]
  );

  const monthlyChartData = useMemo(
    () =>
      monthlyTrend.map((m) => ({
        month: m.month.slice(5),
        normal: Math.round(m.normalUnits / 1000),
        festival: Math.round(m.festivalUnits / 1000),
        total: Math.round(m.totalUnits / 1000),
      })),
    [monthlyTrend]
  );

  const productChartData = useMemo(
    () =>
      spikeProducts.slice(0, 10).map((p) => ({
        name: p.productName.length > 22 ? `${p.productName.slice(0, 22)}…` : p.productName,
        fullName: p.productName,
        spikePct: p.spikePct,
        normalAvg: p.normalAvg,
        festivalAvg: p.festivalAvg,
      })),
    [spikeProducts]
  );

  const dailyChartData = useMemo(
    () =>
      (dailyData?.days || []).map((d) => ({
        label: String(d.day),
        units: d.unitsSold,
        revenue: d.revenue,
        isPeak: d.isPeak,
        isFestival: d.isFestival,
      })),
    [dailyData]
  );

  const dailyYears = useMemo(
    () => filters.years?.length ? filters.years : [2023, 2024, 2025],
    [filters.years]
  );

  if (loading) {
    return (
      <div className="so-page">
        <div className="so-loading">
          <div className="so-loading-spinner" />
          <p>Scanning 1.3M+ sales records across 24 database tables…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="so-page">
        <div className="panel so-error-panel">
          <h2>Unable to load Spike Observatory</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="so-page">
      {/* Hero */}
      <header className="panel so-hero">
        <div className="so-hero-top">
          <div>
            <p className="so-eyebrow">Retail Demand Proof Center</p>
            <h1>Spike Observatory</h1>
            <p className="so-hero-sub">
              Live view of the Demand Forecasting database — validate sales volume,
              compare normal vs festival demand, and identify which products spike during festivals.
            </p>
          </div>
          <div className="so-confidence-badge">
            <span className="so-confidence-score">{confidence?.score}%</span>
            <span className="so-confidence-label">Data Confidence</span>
            <span className="so-confidence-verdict">{confidence?.verdict}</span>
          </div>
        </div>

        <div className="so-confidence-checks">
          {confidence?.checks?.map((check) => (
            <div key={check.id} className={`so-check so-check--${check.status}`}>
              <span className="so-check-icon">{check.status === "pass" ? "✓" : "!"}</span>
              <div>
                <strong>{check.label}</strong>
                <span>{check.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* KPIs */}
      <section className="an-kpi-grid so-kpi-grid">
        <KpiCard
          title="Daily Sales Records"
          value={formatNum(overview?.recordCount)}
          subtitle={`${overview?.coveragePct}% of full store×SKU matrix`}
        />
        <KpiCard
          title="Total Revenue"
          value={formatCr(overview?.totalRevenue)}
          subtitle={`${formatNum(overview?.totalUnits)} units sold`}
        />
        <KpiCard
          title="Festival Day Uplift"
          value={`+${overview?.festivalUpliftPct}%`}
          subtitle={`${overview?.normalAvgUnits} → ${overview?.festivalDayAvgUnits} avg units/day`}
        />
        <KpiCard
          title="Database Tables"
          value={catalog?.summary?.totalTables}
          subtitle={`${formatNum(catalog?.summary?.totalRows)} total rows · ${catalog?.summary?.totalSizeMb} MB`}
        />
        <KpiCard
          title="Active SKUs"
          value={overview?.activeSkus}
          subtitle={`${overview?.activeStores} stores · 3-year history`}
        />
        <KpiCard
          title="Stockout Rate"
          value={`${overview?.stockoutRate}%`}
          subtitle={`${formatNum(overview?.lostSalesUnits)} lost sales units`}
        />
      </section>

      {/* Tabs */}
      <nav className="so-tabs">
        {[
          { id: "vault", label: "Data Vault", icon: "🗄️" },
          // { id: "pulse", label: "Sales Pulse", icon: "📊" },
          { id: "spikes", label: "Festival Spikes", icon: "🎆" },
          { id: "daily", label: "Daily Sales", icon: "📅" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`so-tab ${activeTab === tab.id ? "is-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab: Data Vault */}
      {activeTab === "vault" && (
        <section className="stack-panels">
          <article className="panel">
            <div className="so-section-header">
              <h2>Database Catalog</h2>
              <p>
                24 interconnected tables — {catalog?.summary?.dimensionTables} dimensions,{" "}
                {catalog?.summary?.factTables} facts, {catalog?.summary?.externalTables} external signals
              </p>
            </div>

            <div className="so-vault-summary">
              <div className="so-vault-stat">
                <span>Generated</span>
                <strong>{new Date(catalog?.generatedAt).toLocaleString()}</strong>
              </div>
              <div className="so-vault-stat">
                <span>Date Range</span>
                <strong>{overview?.dateRange?.from} → {overview?.dateRange?.to}</strong>
              </div>
              <div className="so-vault-stat">
                <span>Primary Fact</span>
                <strong>fact_daily_sales (1.3M rows)</strong>
              </div>
            </div>

            <div className="so-table-list">
              {catalog?.tables?.map((table) => (
                <div key={table.fileName} className="so-db-table">
                  <button
                    type="button"
                    className="so-db-table-header"
                    onClick={() =>
                      setExpandedTable(
                        expandedTable === table.fileName ? null : table.fileName
                      )
                    }
                  >
                    <div className="so-db-table-info">
                      <span className={`so-badge ${TYPE_BADGE[table.type]}`}>
                        {table.type}
                      </span>
                      <strong>{table.label}</strong>
                      <code>{table.tableName}</code>
                    </div>
                    <div className="so-db-table-meta">
                      <span>{formatNum(table.rowCount)} rows</span>
                      <span>{table.columnCount} cols</span>
                      <span>{table.sizeMb} MB</span>
                      {table.dateRange && (
                        <span>{table.dateRange.from} → {table.dateRange.to}</span>
                      )}
                      <span className="so-expand-icon">
                        {expandedTable === table.fileName ? "▾" : "▸"}
                      </span>
                    </div>
                  </button>

                  {expandedTable === table.fileName && (
                    <div className="so-db-table-body">
                      <p>{table.description}</p>
                      <div className="so-columns">
                        {table.columns?.map((col) => (
                          <span key={col} className="so-column-chip">{col}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {/* Tab: Sales Pulse */}
      {activeTab === "pulse" && (
        <section className="stack-panels">
          <div className="so-charts-row">
            <article className="panel so-chart-panel">
              <div className="so-section-header">
                <h2>Normal vs Festival Phases</h2>
                <p>Average units per record — clear demand spike on festival days</p>
              </div>
              {phaseChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={phaseChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--subtle)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "var(--subtle)", fontSize: 12 }} label={{ value: "Avg Units", angle: -90, position: "insideLeft", fill: "var(--subtle)" }} />
                    <Tooltip
                      contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                      formatter={(v, name) => [v, name === "avgUnits" ? "Avg Units/Record" : name]}
                    />
                    <Bar dataKey="avgUnits" name="Avg Units" radius={[6, 6, 0, 0]}>
                      {phaseChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="so-empty">No phase data available</p>
              )}

              <div className="so-phase-legend">
                {phaseData.map((p, i) => (
                  <div key={p.phase} className="so-phase-item">
                    <span className="so-phase-dot" style={{ background: COLORS[i] }} />
                    <strong>{p.label}</strong>
                    <span>{formatNum(p.totalUnits)} units ({p.sharePct}%)</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel so-chart-panel">
              <div className="so-section-header">
                <h2>Monthly Sales Trend</h2>
                <p>Normal vs festival-driven demand (thousands of units)</p>
              </div>
              {monthlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fill: "var(--subtle)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--subtle)", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
                    <Legend />
                    <Line type="monotone" dataKey="total" name="Total (K)" stroke="#5B7FFF" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="festival" name="Festival (K)" stroke="#F59E0B" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="normal" name="Normal (K)" stroke="#22C55E" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="so-empty">No trend data available</p>
              )}
            </article>
          </div>
        </section>
      )}

      {/* Tab: Festival Spikes */}
      {activeTab === "spikes" && (
        <section className="stack-panels">
          <article className="panel">
            <div className="so-section-header so-section-header--row">
              <div>
                <h2>Festival Product Spike Explorer</h2>
                <p>
                  High-demand products during festival windows vs normal-day average — sourced from{" "}
                  <code>fact_daily_sales</code> (daily units sold, not hourly)
                </p>
              </div>
              <div className="so-filters">
                <label className="an-filter">
                  <span>Year</span>
                  <select
                    value={spikeYear}
                    onChange={(e) => setSpikeYear(Number(e.target.value))}
                  >
                    {(filters.years?.length ? filters.years : [2023, 2024, 2025]).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </label>
                <label className="an-filter">
                  <span>Festival</span>
                  <select
                    value={selectedFestival}
                    onChange={(e) => setSelectedFestival(e.target.value)}
                  >
                    {filters.festivals?.map((f) => (
                      <option key={f} value={f}>{formatFestival(f)}</option>
                    ))}
                  </select>
                </label>
                <label className="an-filter">
                  <span>Store</span>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                  >
                    <option value="">All Stores</option>
                    {filters.stores?.map((s) => (
                      <option key={s.storeId} value={s.storeId}>{s.storeName}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {spikeMeta && (
              <div className="so-methodology-banner">
                <span className="so-badge so-badge-fact">Daily Sales</span>
                <span>
                  <strong>{spikeMeta.year}</strong> · {formatFestival(selectedFestival)} ·{" "}
                  {spikeMeta.storeScope === "all_stores"
                    ? "All stores aggregated"
                    : spikeMeta.storeScope}
                </span>
                <span className="so-methodology-text">{spikeMeta.methodology}</span>
              </div>
            )}

            {spikeLoading ? (
              <p className="so-loading-inline">Loading spike analysis…</p>
            ) : (
              <div className="so-spike-layout">
                <div className="so-spike-chart">
                  {productChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={380}>
                      <BarChart data={productChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" tick={{ fill: "var(--subtle)", fontSize: 11 }} unit="%" />
                        <YAxis type="category" dataKey="name" width={140} tick={{ fill: "var(--subtle)", fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                          formatter={(v, _n, props) => [
                            `+${v}% spike`,
                            props.payload.fullName,
                          ]}
                        />
                        <Bar dataKey="spikePct" name="Spike %" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="so-empty">No spike data for this selection</p>
                  )}
                </div>

                <div className="so-spike-table-wrap">
                  <h3>
                    High-Demand Products — {formatFestival(selectedFestival)} {spikeYear}
                    <span className="so-table-count">({spikeProducts.length} products)</span>
                  </h3>
                  <table className="fi-table so-spike-table">
                    <thead>
                      <tr>
                        <th>SKU ID</th>
                        <th>Product</th>
                        <th>Category ID</th>
                        <th>Category</th>
                        <th>Store</th>
                        <th>Normal avg/day</th>
                        <th>Festival avg/day</th>
                        <th>Spike</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spikeProducts.map((p) => (
                        <tr key={`${p.skuId}-${p.storeId}`}>
                          <td><code className="so-id-cell">{p.skuId}</code></td>
                          <td><strong>{p.productName}</strong></td>
                          <td><code className="so-id-cell">{p.categoryId}</code></td>
                          <td>{p.categoryName}</td>
                          <td>{p.storeName}</td>
                          <td>{p.normalAvg}</td>
                          <td className="so-festival-val">{p.festivalAvg}</td>
                          <td>
                            <span className={`so-spike-badge ${p.spikePct >= 100 ? "so-spike-high" : p.spikePct >= 50 ? "so-spike-med" : ""}`}>
                              +{p.spikePct}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </article>

          <article className="panel">
            <div className="so-section-header">
              <h2>Category Demand During {formatFestival(selectedFestival)} ({spikeYear})</h2>
              <p>Categories with strongest festival-driven spikes vs normal days — daily sales data</p>
            </div>
            {categorySpikes.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categorySpikes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="categoryName" tick={{ fill: "var(--subtle)", fontSize: 11 }} angle={-20} textAnchor="end" height={70} />
                  <YAxis tick={{ fill: "var(--subtle)", fontSize: 12 }} unit="%" />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="avgSpikePct" name="Avg Spike %" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="so-empty">No category spike data</p>
            )}
          </article>
        </section>
      )}

      {/* Tab: Daily Sales */}
      {activeTab === "daily" && (
        <section className="stack-panels">
          <article className="panel">
            <div className="so-section-header so-section-header--row">
              <div>
                <h2>Product Daily Sales Tracker</h2>
                <p>
                  Day-by-day demand for one product in a selected month — festival, season, and peak day highlighted
                </p>
              </div>
              <div className="so-filters so-filters--wrap">
                <label className="an-filter">
                  <span>Category</span>
                  <select
                    value={dailyCategory}
                    onChange={(e) => setDailyCategory(e.target.value)}
                  >
                    {filters.categories?.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="an-filter so-filter-wide">
                  <span>Product</span>
                  <select
                    value={dailySku}
                    onChange={(e) => setDailySku(e.target.value)}
                  >
                    {dailyProducts.map((p) => (
                      <option key={p.skuId} value={p.skuId}>
                        {p.skuId} — {p.productName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="an-filter">
                  <span>Year</span>
                  <select
                    value={dailyYear}
                    onChange={(e) => setDailyYear(Number(e.target.value))}
                  >
                    {dailyYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </label>
                <label className="an-filter">
                  <span>Month</span>
                  <select
                    value={dailyMonth}
                    onChange={(e) => setDailyMonth(Number(e.target.value))}
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={name} value={i + 1}>{name}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {dailyLoading ? (
              <p className="so-loading-inline">Loading daily sales…</p>
            ) : dailyData ? (
              <>
                <div className="so-daily-summary">
                  <div className="so-daily-summary-item">
                    <span>Product</span>
                    <strong>{dailyData.product.productName}</strong>
                    <code className="so-id-cell">{dailyData.product.skuId}</code>
                  </div>
                  <div className="so-daily-summary-item">
                    <span>Period</span>
                    <strong>{dailyData.monthLabel} {dailyData.year}</strong>
                  </div>
                  <div className="so-daily-summary-item">
                    <span>Peak Demand Day</span>
                    <strong>
                      {dailyData.summary.peakDate
                        ? `${dailyData.summary.peakDate} (${dailyData.summary.peakUnits} units)`
                        : "—"}
                    </strong>
                  </div>
                  <div className="so-daily-summary-item">
                    <span>Month Total</span>
                    <strong>{formatNum(dailyData.summary.totalUnits)} units</strong>
                  </div>
                  <div className="so-daily-summary-item">
                    <span>Daily Average</span>
                    <strong>{dailyData.summary.avgUnits} units</strong>
                  </div>
                  <div className="so-daily-summary-item">
                    <span>Festival Days</span>
                    <strong>{dailyData.summary.festivalDayCount} of {dailyData.summary.totalDays}</strong>
                  </div>
                </div>

                <div className="so-charts-row so-daily-charts">
                  <div className="so-daily-chart-block">
                    <h3>Daily Units Sold</h3>
                    {dailyChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={dailyChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="label" tick={{ fill: "var(--subtle)", fontSize: 11 }} label={{ value: "Day of Month", position: "insideBottom", offset: -2, fill: "var(--subtle)" }} />
                          <YAxis tick={{ fill: "var(--subtle)", fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            formatter={(v) => [formatNum(v), "Units"]}
                          />
                          <Bar dataKey="units" name="Units" radius={[4, 4, 0, 0]}>
                            {dailyChartData.map((d, i) => (
                              <Cell
                                key={i}
                                fill={d.isPeak ? "#EF4444" : d.isFestival ? "#F59E0B" : "#5B7FFF"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="so-empty">No chart data</p>
                    )}
                    <div className="so-chart-legend-inline">
                      <span><i className="so-dot so-dot-normal" /> Normal</span>
                      <span><i className="so-dot so-dot-festival" /> Festival</span>
                      <span><i className="so-dot so-dot-peak" /> Peak Day</span>
                    </div>
                  </div>

                  <div className="so-daily-chart-block">
                    <h3>Daily Revenue (₹)</h3>
                    {dailyChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={dailyChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="label" tick={{ fill: "var(--subtle)", fontSize: 11 }} />
                          <YAxis tick={{ fill: "var(--subtle)", fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            formatter={(v) => [`₹${formatNum(v)}`, "Revenue"]}
                          />
                          <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="so-empty">No chart data</p>
                    )}
                  </div>
                </div>

                <div className="so-daily-table-wrap">
                  <h3>
                    Daily Breakdown — {dailyData.monthLabel} {dailyData.year}
                    <span className="so-table-count">({dailyData.days.length} days)</span>
                  </h3>
                  <table className="fi-table so-daily-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Weekday</th>
                        <th>Units</th>
                        <th>Revenue</th>
                        <th>Festival?</th>
                        <th>Festival Name</th>
                        <th>Festival Phase</th>
                        <th>Season</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyData.days.map((d) => (
                        <tr key={d.date} className={d.isPeak ? "so-row-peak" : d.isFestival ? "so-row-festival" : ""}>
                          <td>{d.date}</td>
                          <td>{d.day}</td>
                          <td>{d.dayName}</td>
                          <td className={d.isPeak ? "so-peak-units" : ""}>{formatNum(d.unitsSold)}</td>
                          <td>₹{formatNum(d.revenue)}</td>
                          <td>
                            <span className={`so-fest-flag ${d.isFestival ? "is-yes" : ""}`}>
                              {d.isFestival ? "Yes" : "No"}
                            </span>
                          </td>
                          <td>{d.festivalName}</td>
                          <td>{d.festivalPhase}</td>
                          <td>{d.season}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="so-empty">Select filters to view daily sales</p>
            )}
          </article>
        </section>
      )}
    </div>
  );
}
