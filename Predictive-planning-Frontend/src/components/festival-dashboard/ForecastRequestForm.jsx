import { FESTIVAL_OPTIONS, FORECAST_YEARS } from "../../data/festivalDashboardData";

const DEFAULT_FORM = {
  festival_name: "Diwali",
  store_id: "",
  store_name: "",
  forecast_year: 2025,
  top_products_limit: 10,
  include_inventory_risk: true,
  include_recommendations: true,
  include_category_analysis: true,
};

export { DEFAULT_FORM };

export default function ForecastRequestForm({
  form,
  onChange,
  onSubmit,
  stores = [],
  loading,
  error,
}) {
  const set = (key, value) => onChange({ ...form, [key]: value });

  const handleStoreChange = (storeId) => {
    const store = stores.find((s) => s.store_id === storeId);
    onChange({
      ...form,
      store_id: storeId,
      store_name: store?.store_name || store?.name || "",
    });
  };

  return (
    <article className="panel fd-form-panel">
      <div className="fd-form-header">
        <div>
          <p className="fd-eyebrow">Step 1 — Configure Forecast Request</p>
          <h2>Festival Demand Forecasting &amp; Planning</h2>
          <p className="subtle">
            AI-Powered Festival Intelligence for Inventory Planning
          </p>
        </div>
        <div className="fd-form-badge">Webhook Trigger</div>
      </div>

      <form
        className="fd-form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label className="an-filter fd-field">
          <span>
            Festival <em className="fd-required">*</em>
          </span>
          <select
            value={form.festival_name}
            onChange={(e) => set("festival_name", e.target.value)}
            required
          >
            {FESTIVAL_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label className="an-filter fd-field">
          <span>
            Store <em className="fd-required">*</em>
          </span>
          <select
            value={form.store_id}
            onChange={(e) => handleStoreChange(e.target.value)}
            required
          >
            <option value="">Select store</option>
            {stores.map((s) => (
              <option key={s.store_id} value={s.store_id}>
                {s.store_id}
                {s.store_name || s.name ? ` — ${s.store_name || s.name}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="an-filter fd-field">
          <span>
            Forecast Year <em className="fd-required">*</em>
          </span>
          <select
            value={form.forecast_year}
            onChange={(e) => set("forecast_year", Number(e.target.value))}
            required
          >
            {FORECAST_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className="an-filter fd-field">
          <span>
            Top Products Limit <em className="fd-required">*</em>
          </span>
          <input
            type="number"
            min={1}
            max={50}
            value={form.top_products_limit}
            onChange={(e) => set("top_products_limit", Number(e.target.value))}
            required
          />
        </label>

        <label className="an-filter fd-field fd-field-wide">
          <span>Store Name (optional)</span>
          <input
            type="text"
            placeholder="Auto-filled from store selection"
            value={form.store_name}
            onChange={(e) => set("store_name", e.target.value)}
          />
        </label>

        <fieldset className="fd-toggle-group fd-field-wide">
          <legend>Optional analysis modules</legend>
          <label className="fd-toggle">
            <input
              type="checkbox"
              checked={form.include_inventory_risk}
              onChange={(e) => set("include_inventory_risk", e.target.checked)}
            />
            <span>Include inventory risk</span>
          </label>
          <label className="fd-toggle">
            <input
              type="checkbox"
              checked={form.include_recommendations}
              onChange={(e) => set("include_recommendations", e.target.checked)}
            />
            <span>Include AI recommendations</span>
          </label>
          <label className="fd-toggle">
            <input
              type="checkbox"
              checked={form.include_category_analysis}
              onChange={(e) => set("include_category_analysis", e.target.checked)}
            />
            <span>Include category analysis</span>
          </label>
        </fieldset>

        {error ? <p className="an-error fd-field-wide">{error}</p> : null}

        <div className="fd-form-actions fd-field-wide">
          <button type="submit" className="fd-submit-btn" disabled={loading}>
            {loading ? "Triggering forecast…" : "Generate Festival Forecast"}
          </button>
          <p className="subtle">
            Required: festival, store, forecast year, top products limit
          </p>
        </div>
      </form>
    </article>
  );
}
