import { useEffect, useState } from "react";
import { triggerFestivalForecast } from "../api/festivalDashboardApi";
import { getFestivalIntelligenceFilters } from "../api/festivalIntelligenceApi";
import ForecastRequestForm, { DEFAULT_FORM } from "../components/festival-dashboard/ForecastRequestForm";
import FestivalDashboardView from "../components/festival-dashboard/FestivalDashboardView";
import { normalizeFestivalDashboard } from "../data/festivalDashboardData";

const LOADING_STEPS = [
  "Validating forecast request payload…",
  "Triggering festival intelligence webhook…",
  "Aggregating demand signals & historical patterns…",
  "Running AI risk & procurement analysis…",
  "Preparing dashboard insights…",
];

function LoadingOverlay({ stepIndex, isCompleted, onComplete }) {
  const [localStepIndex, setLocalStepIndex] = useState(0);

  useEffect(() => {
    if (isCompleted) {
      setLocalStepIndex(LOADING_STEPS.length);
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, onComplete]);

  useEffect(() => {
    if (isCompleted) return;
    setLocalStepIndex(stepIndex);
  }, [stepIndex, isCompleted]);

  return (
    <div className="fi-loading-overlay fd-loading-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="fi-loading-card fd-loading-card">
        <div className="fi-loader-orbit">
          <span className="fi-orbit fi-orbit-1" />
          <span className="fi-orbit fi-orbit-2" />
          <span className="fi-orbit fi-orbit-3" />
          <span className="fi-core" />
        </div>
        <h3>Generating Festival Forecast</h3>
        <p>AI agents are processing your request. This may take up to 10 minutes.</p>
        <div className="fd-loading-steps">
          {LOADING_STEPS.map((step, i) => (
            <div
              key={step}
              className={`fd-loading-step ${i <= localStepIndex ? "is-active" : ""} ${i < localStepIndex ? "is-done" : ""}`}
            >
              <span className="fd-step-dot" />
              <span>{step}</span>
            </div>
          ))}
        </div>
        <div className="fd-progress-bar">
          <div
            className="fd-progress-fill"
            style={{ width: `${Math.min(((localStepIndex + 1) / LOADING_STEPS.length) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function FestivalDashboardPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [stores, setStores] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [pendingError, setPendingError] = useState("");
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingFilters(true);
        const data = await getFestivalIntelligenceFilters();
        setStores(data.stores || []);
        if (data.stores?.length && !form.store_id) {
          setForm((prev) => ({
            ...prev,
            store_id: data.stores[0].store_id,
            store_name: data.stores[0].store_name || data.stores[0].name || "",
          }));
        }
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load store list");
      } finally {
        setLoadingFilters(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loadingForecast || isCompleted) return undefined;

    const stepAdvance = Number(import.meta.env.VITE_STEP_ADVANCE_MS) || 20000;
    const interval = setInterval(() => {
      setLoadingStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
    }, stepAdvance);

    return () => clearInterval(interval);
  }, [loadingForecast, isCompleted]);

  const handleSubmit = async () => {
    if (!form.festival_name || !form.store_id || !form.forecast_year || !form.top_products_limit) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoadingForecast(true);
      setLoadingStep(0);
      setIsCompleted(false);
      setPendingData(null);
      setPendingError("");
      setError("");
      setDashboardData(null);

      const payload = {
        festival_name: form.festival_name,
        store_id: form.store_id,
        forecast_year: Number(form.forecast_year),
        top_products_limit: Number(form.top_products_limit),
        ...(form.store_name ? { store_name: form.store_name } : {}),
        include_inventory_risk: form.include_inventory_risk,
        include_recommendations: form.include_recommendations,
        include_category_analysis: form.include_category_analysis,
      };

      const response = await triggerFestivalForecast(payload);
      const normalized = normalizeFestivalDashboard(response, payload);
      setPendingData(normalized);
      setIsCompleted(true);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to generate festival forecast. Please try again.";
      setPendingError(msg);
      setIsCompleted(true);
    }
  };

  const handleLoadingComplete = () => {
    if (pendingError) {
      setError(pendingError);
      setDashboardData(null);
    } else if (pendingData) {
      setDashboardData(pendingData);
      setError("");
    }
    setLoadingForecast(false);
    setIsCompleted(false);
  };

  const handleReset = () => {
    setDashboardData(null);
    setError("");
  };

  return (
    <section className="stack-panels analytics-page fd-page">
      {loadingForecast && (
        <LoadingOverlay
          stepIndex={loadingStep}
          isCompleted={isCompleted}
          onComplete={handleLoadingComplete}
        />
      )}

      {!dashboardData ? (
        <ForecastRequestForm
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          stores={stores}
          loading={loadingForecast || loadingFilters}
          error={error}
        />
      ) : (
        <FestivalDashboardView data={dashboardData} onReset={handleReset} />
      )}
    </section>
  );
}
