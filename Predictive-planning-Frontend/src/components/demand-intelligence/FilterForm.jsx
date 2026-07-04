import { useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Loader2,
  MapPin,
  TrendingUp,
  Store,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  btnPrimary,
  cardElevated,
  errorBox,
  input,
  textAccent,
  textLabel,
  textMuted,
} from "./themeClasses";

export default function FilterForm({
  festivals,
  stores,
  selectedFestival,
  selectedStore,
  planningDate,
  onFestivalChange,
  onStoreChange,
  onPlanningDateChange,
  onSubmit,
  loading,
  loadingFilters,
  error,
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (planningDate && /^\d{2}\/\d{2}\/\d{4}$/.test(planningDate)) {
      const [, m, y] = planningDate.split("/").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  // Simple validation for DD/MM/YYYY
  const isValidDate = (dateStr) => {
    if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false;
    const [day, month, year] = dateStr.split("/").map(Number);
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    const dateObj = new Date(year, month - 1, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  };

  const dateLength = planningDate?.length ?? 0;
  const isDateInvalid = dateLength === 10 && !isValidDate(planningDate);
  const canSubmit =
    selectedFestival &&
    selectedStore &&
    planningDate &&
    isValidDate(planningDate) &&
    !loading &&
    !loadingFilters;

  const handleOpenCalendar = () => {
    if (planningDate && /^\d{2}\/\d{2}\/\d{4}$/.test(planningDate)) {
      const [, m, y] = planningDate.split("/").map(Number);
      setViewDate(new Date(y, m - 1, 1));
    }
    setShowCalendar(true);
  };

  // Calendar Math
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const selectDay = (dayNum) => {
    const formattedDay = String(dayNum).padStart(2, "0");
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const selectedStr = `${formattedDay}/${formattedMonth}/${viewYear}`;
    onPlanningDateChange(selectedStr);
    setShowCalendar(false);
  };

  const daysArray = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-[#19345f] dark:bg-[#0c1a33] dark:shadow-black/40 overflow-visible relative">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-8 sm:px-8 sm:py-10 text-slate-900 rounded-t-2xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900">
              Demand Forecast Engine
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              Generate executive-grade demand intelligence with product
              classification, historical validation, and actionable retail
              insights.
            </p>
          </div>

          <form
            className="space-y-6 px-4 py-6 sm:px-8 sm:py-8"
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

            {/* Festival Dropdown */}
            <div className="space-y-2">
              <label
                htmlFor="di-festival"
                className={`flex items-center gap-2 text-sm font-semibold ${textLabel}`}
              >
                <CalendarDays className={`h-4 w-4 ${textAccent}`} />
                Festival
              </label>
              <select
                id="di-festival"
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

            {/* Store Dropdown */}
            <div className="space-y-2">
              <label
                htmlFor="di-store"
                className={`flex items-center gap-2 text-sm font-semibold ${textLabel}`}
              >
                <Store className={`h-4 w-4 ${textAccent}`} />
                Store
              </label>
              <select
                id="di-store"
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

            {/* Planning Date Picker */}
            <div className="space-y-2">
              <label
                className={`flex items-center gap-2 text-sm font-semibold ${textLabel}`}
              >
                <CalendarDays className={`h-4 w-4 ${textAccent}`} />
                Planning Date
              </label>

              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={planningDate}
                  onClick={handleOpenCalendar}
                  placeholder="DD/MM/YYYY (e.g. 15/11/2025)"
                  className={`${input} font-mono cursor-pointer pr-10`}
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={handleOpenCalendar}
                >
                  <CalendarDays className={`h-4.5 w-4.5 ${textMuted}`} />
                </div>

                {/* Click-outside backdrop overlay */}
                {showCalendar && (
                  <div
                    className="fixed inset-0 z-35 bg-transparent"
                    onClick={() => setShowCalendar(false)}
                  />
                )}

                {/* Custom Styled Calendar Popover Dropdown */}
                {showCalendar && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 z-40 mb-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-[#19345f] dark:bg-[#0c1a33] animate-in fade-in slide-in-from-bottom-1 duration-200">
                    {/* Calendar Header Navigator */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded-lg border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-600 dark:border-[#19345f] dark:hover:bg-[#152a4d] dark:text-[#eef5ff] transition duration-150 outline-none focus:outline-none cursor-pointer flex items-center justify-center"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={viewMonth}
                          onChange={(e) => setViewDate(new Date(viewYear, Number(e.target.value), 1))}
                          className="calendar-header-select"
                        >
                          {monthNames.map((monthName, idx) => (
                            <option key={monthName} value={idx}>
                              {monthName}
                            </option>
                          ))}
                        </select>
                        <select
                          value={viewYear}
                          onChange={(e) => setViewDate(new Date(Number(e.target.value), viewMonth, 1))}
                          className="calendar-header-select"
                        >
                          {Array.from({ length: 21 }, (_, i) => 2020 + i).map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-600 dark:border-[#19345f] dark:hover:bg-[#152a4d] dark:text-[#eef5ff] transition duration-150 outline-none focus:outline-none cursor-pointer flex items-center justify-center"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                        <div key={day} className="w-8 h-8 flex items-center justify-center">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Month Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {daysArray.map((day, idx) => {
                        if (day === null) {
                          return <div key={`empty-${idx}`} className="w-8 h-8" />;
                        }

                        const isSelected = (() => {
                          if (!planningDate) return false;
                          const [d, m, y] = planningDate.split("/").map(Number);
                          return d === day && (m - 1) === viewMonth && y === viewYear;
                        })();

                        const isToday = (() => {
                          const today = new Date();
                          return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                        })();

                        return (
                          <button
                            key={`day-${day}`}
                            type="button"
                            onClick={() => selectDay(day)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-150 p-0 m-0 border-0 outline-none focus:outline-none ${isSelected
                                ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 dark:bg-indigo-500 dark:shadow-indigo-500/25"
                                : isToday
                                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-850 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30"
                                  : "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-[#c5d0e6] dark:hover:bg-[#152a4d] dark:hover:text-[#eef5ff]"
                              }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {isDateInvalid && (
                <p className="text-xs font-semibold text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Please enter a valid calendar date (DD/MM/YYYY).
                </p>
              )}
            </div>

            <button type="submit" disabled={!canSubmit} className={btnPrimary}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Demand Intelligence…
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Generate Forecast
                </>
              )}
            </button>

            <p
              className={`flex items-center justify-center gap-1.5 text-center text-xs ${textMuted}`}
            >
              <MapPin className="h-3 w-3" />
              Tailored intelligence for Coimbatore D-Mart locations
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
