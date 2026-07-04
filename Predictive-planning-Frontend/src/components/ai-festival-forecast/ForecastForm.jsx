import {
  AlertCircle,
  CalendarDays,
  Loader2,
  MapPin,
  TrendingUp,
  Store,
} from "lucide-react";
import {
  btnPrimary,
  cardElevated,
  errorBox,
  iconColor,
  input,
  textAccent,
  textLabel,
  textMuted,
} from "./themeClasses";

export default function ForecastForm({
  festivals,
  stores,
  selectedFestival,
  selectedStore,
  onFestivalChange,
  onStoreChange,
  onSubmit,
  loading,
  loadingFilters,
  error,
}) {
  const canSubmit =
    selectedFestival && selectedStore && !loading && !loadingFilters;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className={cardElevated}>
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-8 py-10 text-slate-900">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900">
              Festival Demand Forecasting Engine
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              Generate festival demand forecasts and inventory
              recommendations for your retail network.
            </p>
          </div>

          <form
            className="space-y-6 px-8 py-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSubmit) onSubmit();
            }}
          >
            {error && (
              <div className={errorBox}>
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="festival"
                className={`flex items-center gap-2 text-sm font-semibold ${textLabel}`}
              >
                <CalendarDays className={`h-4 w-4 ${textAccent}`} />
                Festival
              </label>
              <select
                id="festival"
                value={selectedFestival}
                onChange={(e) => onFestivalChange(e.target.value)}
                disabled={loadingFilters || loading}
                className={input}
              >
                <option value="">
                  {loadingFilters ? "Loading festivals…" : "Select a festival"}
                </option>
                {festivals.map((f) => (
                  <option key={f.fest_id} value={f.fest_value}>
                    {f.fest_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="store"
                className={`flex items-center gap-2 text-sm font-semibold ${textLabel}`}
              >
                <Store className={`h-4 w-4 ${textAccent}`} />
                Store
              </label>
              <select
                id="store"
                value={selectedStore}
                onChange={(e) => onStoreChange(e.target.value)}
                disabled={loadingFilters || loading}
                className={input}
              >
                <option value="">
                  {loadingFilters ? "Loading stores…" : "Select a store"}
                </option>
                {stores.map((s) => (
                  <option key={s.store_id} value={s.store_value}>
                    {s.store_name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={!canSubmit} className={btnPrimary}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Forecast…
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Generate Forecast
                </>
              )}
            </button>

            <p className={`flex items-center justify-center gap-1.5 text-center text-xs ${textMuted}`}>
              <MapPin className="h-3 w-3" />
              Forecasts tailored to Coimbatore D-Mart locations
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
