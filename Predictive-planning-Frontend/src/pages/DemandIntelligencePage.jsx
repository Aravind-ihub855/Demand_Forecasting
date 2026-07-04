import { useEffect, useState } from "react";
import {
  fetchDemandIntelFilters,
  generateDemandIntelligence,
} from "../api/demandIntelligenceApi";
import { MOCK_DEMAND_INTELLIGENCE } from "../components/demand-intelligence/mockData";
import FilterForm from "../components/demand-intelligence/FilterForm";
import DemandIntelligenceDashboard from "../components/demand-intelligence/DemandIntelligenceDashboard";
import LoadingState from "../components/demand-intelligence/LoadingState";
import EmptyState from "../components/demand-intelligence/EmptyState";
import { pageBg } from "../components/demand-intelligence/themeClasses";
import "../styles/demand-intelligence.css";

export default function DemandIntelligencePage() {
  const [festivals, setFestivals] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [planningDate, setPlanningDate] = useState("15/11/2025");

  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [pendingError, setPendingError] = useState("");
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(() => {
    const cached = localStorage.getItem("last_demand_intel_data");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse cached demand intel data:", e);
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const loadFilters = async () => {
      try {
        setLoadingFilters(true);
        setError("");
        const data = await fetchDemandIntelFilters();

        if (!data?.success) {
          throw new Error("Failed to load festival and store options.");
        }

        const fetchedFestivals = data.festivals || [];
        const fetchedStores = data.stores || [];

        setFestivals(fetchedFestivals);
        setStores(fetchedStores);

        if (fetchedFestivals.length) {
          const pongalFest = fetchedFestivals.find(f => f.fest_value?.toLowerCase() === "pongal");
          setSelectedFestival(pongalFest ? pongalFest.fest_value : fetchedFestivals[0].fest_value);
        }
        if (fetchedStores.length) {
          const dmartStore = fetchedStores.find(s => s.store_name?.toLowerCase().includes("saravanampatti") || s.store_value?.toLowerCase().includes("saravanampatti"));
          setSelectedStore(dmartStore ? dmartStore.store_value : fetchedStores[0].store_value);
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
    if (!selectedFestival || !selectedStore || !planningDate) {
      setError("Please select a festival, store, and planning date.");
      return;
    }

    try {
      setLoadingDashboard(true);
      setIsCompleted(false);
      setPendingData(null);
      setPendingError("");
      setError("");
      setDashboardData(null);

      // Convert date from DD/MM/YYYY to YYYY-MM-DD
      const [day, month, year] = planningDate.split("/");
      const formattedDate = `${year}-${month}-${day}`;

      const response = await generateDemandIntelligence({
        festival: selectedFestival,
        store: selectedStore,
        planning_date: formattedDate,
      });

      // Handle webhook nested items[0].json envelope
      let parsedData = response;
      if (
        response?.items &&
        Array.isArray(response.items) &&
        response.items.length > 0 &&
        response.items[0].json
      ) {
        parsedData = response.items[0].json;
      }

      if (!parsedData?.kpis) {
        throw new Error("Invalid response from demand intelligence service.");
      }

      const festivalName =
        festivals.find((f) => f.fest_value === selectedFestival)?.fest_name ??
        parsedData.executive_summary?.festival;
      const storeName =
        stores.find((s) => s.store_value === selectedStore)?.store_name ??
        parsedData.executive_summary?.store;

      const finalData = {
        ...parsedData,
        executive_summary: {
          ...parsedData.executive_summary,
          festival: festivalName,
          store: storeName,
        },
      };

      setPendingData(finalData);
      setIsCompleted(true);
    } catch (e) {
      if (import.meta.env.DEV) {
        const festivalName =
          festivals.find((f) => f.fest_value === selectedFestival)?.fest_name ??
          "Pongal";
        const storeName =
          stores.find((s) => s.store_value === selectedStore)?.store_name ??
          "D-Mart Saravanampatti";

        // Convert date format for dev mock fallback
        const [day, month, year] = planningDate.split("/");
        const formattedDate = `${year}-${month}-${day}`;

        const devData = {
          ...MOCK_DEMAND_INTELLIGENCE,
          executive_summary: {
            ...MOCK_DEMAND_INTELLIGENCE.executive_summary,
            festival: festivalName,
            store: storeName,
            planning_date: formattedDate,
          },
        };

        setPendingData(devData);
        setIsCompleted(true);
      } else {
        const errMsg =
          e?.response?.data?.message ||
          e?.message ||
          "Failed to generate demand intelligence. Please try again.";
        setPendingError(errMsg);
        setIsCompleted(true);
      }
    }
  };

  const handleLoadingComplete = () => {
    if (pendingError) {
      setError(pendingError);
      setDashboardData(null);
    } else if (pendingData) {
      setDashboardData(pendingData);
      localStorage.setItem("last_demand_intel_data", JSON.stringify(pendingData));
      setError("");
    }
    setLoadingDashboard(false);
    setIsCompleted(false);
  };

  const handleReset = () => {
    setDashboardData(null);
    setError("");
    localStorage.removeItem("last_demand_intel_data");
  };

  if (!loadingFilters && !festivals.length && !stores.length && error) {
    return (
      <div className={`di-scope min-h-full ${pageBg} px-4 py-10`}>
        <EmptyState title="Unable to load filters" message={error} />
      </div>
    );
  }

  return (
    <div className={`di-scope min-h-full ${pageBg}`}>
      {loadingDashboard && (
        <LoadingState
          isCompleted={isCompleted}
          onComplete={handleLoadingComplete}
        />
      )}

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {!dashboardData ? (
          <FilterForm
            festivals={festivals}
            stores={stores}
            selectedFestival={selectedFestival}
            selectedStore={selectedStore}
            planningDate={planningDate}
            onFestivalChange={setSelectedFestival}
            onStoreChange={setSelectedStore}
            onPlanningDateChange={setPlanningDate}
            onSubmit={handleSubmit}
            loading={loadingDashboard}
            loadingFilters={loadingFilters}
            error={error}
          />
        ) : (
          <DemandIntelligenceDashboard
            data={dashboardData}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}


