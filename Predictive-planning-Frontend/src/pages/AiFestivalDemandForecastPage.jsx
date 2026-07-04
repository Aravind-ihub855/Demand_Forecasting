import { useEffect, useState } from "react";
import {
  fetchFestivalFilters,
  generateFestivalForecast,
} from "../api/aiFestivalForecastApi";
import ErrorState from "../components/ai-festival-forecast/ErrorState";
import ForecastDashboard from "../components/ai-festival-forecast/ForecastDashboard";
import ForecastForm from "../components/ai-festival-forecast/ForecastForm";
import LoadingState from "../components/ai-festival-forecast/LoadingState";
import "../styles/ai-festival-forecast.css";
import { pageBg } from "../components/ai-festival-forecast/themeClasses";

export default function AiFestivalDemandForecastPage() {
  const [festivals, setFestivals] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState("");
  const [selectedStore, setSelectedStore] = useState("");

  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [error, setError] = useState("");
  const [forecastData, setForecastData] = useState(null);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        setLoadingFilters(true);
        setError("");
        const data = await fetchFestivalFilters();

        if (!data?.success) {
          throw new Error("Failed to load festival and store options.");
        }

        setFestivals(data.festivals || []);
        setStores(data.stores || []);

        if (data.festivals?.length) {
          setSelectedFestival(data.festivals[0].fest_value);
        }
        if (data.stores?.length) {
          setSelectedStore(data.stores[0].store_value);
        }
      } catch (e) {
        setError(
          e?.response?.data?.message ||
            e?.message ||
            "Failed to load festival and store options."
        );
      } finally {
        setLoadingFilters(false);
      }
    };

    loadFilters();
  }, []);

  const handleSubmit = async () => {
    if (!selectedFestival || !selectedStore) {
      setError("Please select both a festival and a store.");
      return;
    }

    try {
      setLoadingForecast(true);
      setError("");
      setForecastData(null);

      const response = await generateFestivalForecast({
        festival: selectedFestival,
        store: selectedStore,
      });

      if (!response?.success) {
        throw new Error(
          response?.message || "Forecast generation failed. Please try again."
        );
      }

      setForecastData(response);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate festival forecast. Please try again."
      );
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleReset = () => {
    setForecastData(null);
    setError("");
  };

  if (!loadingFilters && !festivals.length && !stores.length && error) {
    return (
      <div className={`aff-scope min-h-full ${pageBg}`}>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className={`aff-scope min-h-full ${pageBg}`}>
      {loadingForecast && <LoadingState />}

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {!forecastData ? (
          <ForecastForm
            festivals={festivals}
            stores={stores}
            selectedFestival={selectedFestival}
            selectedStore={selectedStore}
            onFestivalChange={setSelectedFestival}
            onStoreChange={setSelectedStore}
            onSubmit={handleSubmit}
            loading={loadingForecast}
            loadingFilters={loadingFilters}
            error={error}
          />
        ) : (
          <ForecastDashboard data={forecastData} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
