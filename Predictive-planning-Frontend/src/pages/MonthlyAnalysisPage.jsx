import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getMonthlyAnalysisFilters,
  getFestivalSpikeByMonth,
  getProductSpikeByMonth,
  getProductSpikeByFestival,
} from "../api/monthlyAnalysisApi";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F", "#FFBB28",
  "#FF8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8",
];

export default function MonthlyAnalysisPage() {
  const [year, setYear] = useState(2024);
  const [availableYears, setAvailableYears] = useState([2024]);
  const [availableFestivals, setAvailableFestivals] = useState([]);

  const [festivalSpikeData, setFestivalSpikeData] = useState([]);
  const [festivalSpikeLoading, setFestivalSpikeLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState("January");
  const [productByMonthData, setProductByMonthData] = useState([]);
  const [productByMonthLoading, setProductByMonthLoading] = useState(false);

  const [selectedFestival, setSelectedFestival] = useState("");
  const [productByFestivalData, setProductByFestivalData] = useState([]);
  const [productByFestivalLoading, setProductByFestivalLoading] = useState(false);

  // Load filters
  useEffect(() => {
    async function loadFilters() {
      try {
        const filters = await getMonthlyAnalysisFilters();
        setAvailableYears(filters.years || [2024]);
        setAvailableFestivals(filters.festivals || []);
        if (filters.festivals?.length > 0) {
          setSelectedFestival(filters.festivals[0]);
        }
      } catch (err) {
        console.error("Failed to load filters:", err);
      }
    }
    loadFilters();
  }, []);

  // Chart 1
  useEffect(() => {
    async function loadData() {
      setFestivalSpikeLoading(true);
      try {
        const data = await getFestivalSpikeByMonth(year);
        setFestivalSpikeData(data);
      } catch (err) {
        console.error("Failed to load festival spike data:", err);
      } finally {
        setFestivalSpikeLoading(false);
      }
    }
    loadData();
  }, [year]);

  // Chart 2
  useEffect(() => {
    async function loadData() {
      setProductByMonthLoading(true);
      try {
        const data = await getProductSpikeByMonth(selectedMonth, year);
        setProductByMonthData(data);
      } catch (err) {
        console.error("Failed to load product by month data:", err);
      } finally {
        setProductByMonthLoading(false);
      }
    }
    loadData();
  }, [selectedMonth, year]);

  // Chart 3
  useEffect(() => {
    if (!selectedFestival) return;
    async function loadData() {
      setProductByFestivalLoading(true);
      try {
        const data = await getProductSpikeByFestival(selectedFestival, year);
        setProductByFestivalData(data);
      } catch (err) {
        console.error("Failed to load product by festival data:", err);
      } finally {
        setProductByFestivalLoading(false);
      }
    }
    loadData();
  }, [selectedFestival, year]);

  return (
    <div className="ma-page">
      {/* Header */}
      <header className="ma-header">
        <h1>📊 Monthly Analysis <span className="ma-header-sub">(Festival &amp; Spike Insights)</span></h1>
        <div className="ma-year-row">
          <label className="an-filter">
            <span>Year</span>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {/* Chart 1: Festival Demand Spike by Month */}
      <section className="panel ma-chart-section">
        <div className="ma-section-header">
          <h2>🎉 Festival Demand Spike by Month</h2>
          <p className="subtle">Average spike percentage across all products during festival months</p>
        </div>
        {festivalSpikeLoading ? (
          <div className="ma-loading">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={festivalSpikeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--subtle)", fontSize: 12 }} />
              <YAxis
                label={{ value: "Spike %", angle: -90, position: "insideLeft", fill: "var(--subtle)" }}
                tick={{ fill: "var(--subtle)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text)",
                }}
                formatter={(value) => [`${value.toFixed(1)}%`, "Spike Percentage"]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend wrapperStyle={{ color: "var(--subtle)" }} />
              <Bar dataKey="spikePercentage" name="Festival Spike %" fill="#8884d8">
                {festivalSpikeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Chart 2: Month-wise Product Spike */}
      <section className="panel ma-chart-section">
        <div className="ma-section-header ma-section-header--row">
          <h2>📅 Month-wise Product Spike Percentage</h2>
          <label className="an-filter">
            <span>Month</span>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="subtle">Top 20 products with highest spike in {selectedMonth} {year}</p>
        {productByMonthLoading ? (
          <div className="ma-loading">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={productByMonthData.slice(0, 20)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                label={{ value: "Spike %", position: "insideBottom", offset: -5, fill: "var(--subtle)" }}
                tick={{ fill: "var(--subtle)", fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="productName"
                width={150}
                tick={{ fill: "var(--subtle)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text)",
                }}
                formatter={(value) => [`${value.toFixed(1)}%`, "Spike %"]}
                labelFormatter={(label) => `Product: ${label}`}
              />
              <Bar dataKey="spikePercentage" name="Spike %" fill="#82ca9d" radius={[0, 4, 4, 0]}>
                {productByMonthData.slice(0, 20).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Chart 3: Festival-wise Product Spike */}
      <section className="panel ma-chart-section">
        <div className="ma-section-header ma-section-header--row">
          <h2>🎊 Festival-wise Product Spike Percentage</h2>
          <label className="an-filter">
            <span>Festival</span>
            <select value={selectedFestival} onChange={(e) => setSelectedFestival(e.target.value)}>
              {availableFestivals.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="subtle">Top 20 products with highest spike during {selectedFestival} {year}</p>
        {productByFestivalLoading ? (
          <div className="ma-loading">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={productByFestivalData.slice(0, 20)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                label={{ value: "Spike %", position: "insideBottom", offset: -5, fill: "var(--subtle)" }}
                tick={{ fill: "var(--subtle)", fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="productName"
                width={150}
                tick={{ fill: "var(--subtle)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text)",
                }}
                formatter={(value) => [`${value.toFixed(1)}%`, "Spike %"]}
                labelFormatter={(label) => `Product: ${label}`}
              />
              <Bar dataKey="spikePercentage" name="Spike %" fill="#ffc658" radius={[0, 4, 4, 0]}>
                {productByFestivalData.slice(0, 20).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
