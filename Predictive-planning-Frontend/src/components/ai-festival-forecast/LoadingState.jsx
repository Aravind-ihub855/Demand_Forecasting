import { useEffect, useState } from "react";
import { Cpu } from "lucide-react";
import {
  iconColor,
  loadingStepActive,
  loadingStepInactive,
  modalCard,
  overlay,
  progressTrack,
  textHeading,
  textMuted,
} from "./themeClasses";

const STEPS = [
  "Initializing Festival Intelligence Engine",
  "Building Retail Demand Context",
  "Analyzing Market, Trend & Seasonal Signals",
  "Forecasting Demand and Inventory Risks",
  "Preparing Executive Forecast Dashboard",
];

/** Hold on the 4th step (index 3) while the AI request runs. */
const HOLD_STEP_INDEX = 3;
const STEP_ADVANCE_MS = 6000;

export default function LoadingState() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((current) =>
        current < HOLD_STEP_INDEX ? current + 1 : current
      );
    }, STEP_ADVANCE_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={overlay}>
      <div className={modalCard}>
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            {/* Background ring */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800/40" />
            {/* Spinning active ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-400 dark:border-t-indigo-400 dark:border-r-violet-400 animate-spin" />

            {/* Inner CPU container with subtle pulsing */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 shadow-inner">
              <Cpu className={`h-8 w-8 animate-pulse ${iconColor.indigo}`} />
            </div>
          </div>
        </div>

        <h3 className={`text-center text-lg font-bold ${textHeading}`}>
          Generating Festival Forecast
        </h3>
        <p className={`mt-2 text-center text-sm ${textMuted}`}>
          AI agents are processing your request. This may take up to 10 minutes.
        </p>

        <div className="mt-6 space-y-2">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={i <= stepIndex ? loadingStepActive : loadingStepInactive}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${i < stepIndex
                    ? "bg-emerald-500"
                    : i === stepIndex
                      ? "animate-pulse bg-indigo-500 dark:bg-indigo-400"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
              />
              {step}
            </div>
          ))}
        </div>

        <div className={`mt-6 ${progressTrack}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
            style={{
              width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
