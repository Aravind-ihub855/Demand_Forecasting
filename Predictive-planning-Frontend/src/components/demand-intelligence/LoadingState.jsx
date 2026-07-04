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
  "Initializing Demand Intelligence Engine",
  "Analyzing Festival & Store Context",
  "Processing Product Classification Layers",
  "Validating Historical Demand Signals",
  "Preparing Executive Dashboard",
];

const HOLD_STEP_INDEX = 3;
const STEP_ADVANCE_MS = Number(import.meta.env.VITE_STEP_ADVANCE_MS) || 20000;

function StepIndicator({ index, activeIndex }) {
  if (index < activeIndex) {
    // Completed step: green badge with checkmark
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }

  if (index === activeIndex) {
    // Active step: tiny spinning loader
    return (
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="absolute h-4.5 w-4.5 rounded-full border-2 border-indigo-100 dark:border-indigo-950/85" />
        <span className="absolute h-4.5 w-4.5 rounded-full border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
      </span>
    );
  }

  // Pending step: empty slate ring
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-800 bg-transparent" />
  );
}

export default function LoadingState({ isCompleted = false, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (isCompleted) {
      setStepIndex(STEPS.length);
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, onComplete]);

  useEffect(() => {
    if (isCompleted) return;

    const interval = setInterval(() => {
      setStepIndex((current) =>
        current < HOLD_STEP_INDEX ? current + 1 : current
      );
    }, STEP_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [isCompleted]);

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
          Generating Demand Intelligence
        </h3>
        <p className={`mt-2 text-center text-sm ${textMuted}`}>
          AI agents are analyzing product demand patterns. This may take a few
          minutes.
        </p>

        <div className="mt-6 space-y-2">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={
                i <= stepIndex ? loadingStepActive : loadingStepInactive
              }
            >
              <StepIndicator index={i} activeIndex={stepIndex} />
              <span className="truncate">{step}</span>
            </div>
          ))}
        </div>

        <div className={`mt-6 ${progressTrack}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
            style={{
              width: `${Math.min(((stepIndex + 1) / STEPS.length) * 100, 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
