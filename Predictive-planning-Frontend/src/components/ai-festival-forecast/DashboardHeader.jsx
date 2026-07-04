import { Calendar, MapPin, RotateCcw, ShieldCheck } from "lucide-react";
import {
  btnSecondary,
  card,
  confidenceBox,
  confidenceLabel,
  confidenceValue,
  iconColor,
  surfaceMuted,
  textAccent,
  textHeading,
  textMuted,
} from "./themeClasses";
import { formatTimestamp } from "./utils";

export default function DashboardHeader({ data, onReset }) {
  const festival =
    data?.metadata?.festival || data?.summary?.festival_name || "—";
  const location =
    data?.metadata?.location || data?.summary?.store_location || "—";
  const generatedAt = formatTimestamp(data?.metadata?.generated_at);
  const confidenceScore =
    data?.summary?.confidence_score ?? data?.summary?.forecast_confidence;

  return (
    <div className={`${card} p-6`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest ${textAccent}`}>
            Executive Forecast Report
          </p>
          <h1 className={`mt-1 text-2xl font-bold tracking-tight sm:text-3xl ${textHeading}`}>
            Festival Demand Forecast
          </h1>
        </div>

        {onReset && (
          <button type="button" onClick={onReset} className={btnSecondary}>
            <RotateCcw className="h-4 w-4" />
            New Forecast
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${surfaceMuted}`}>
          <Calendar className={`h-5 w-5 ${iconColor.indigo}`} />
          <div>
            <p className={`text-xs font-medium ${textMuted}`}>Festival</p>
            <p className={`text-sm font-semibold ${textHeading}`}>{festival}</p>
          </div>
        </div>

        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${surfaceMuted}`}>
          <MapPin className={`h-5 w-5 ${iconColor.indigo}`} />
          <div>
            <p className={`text-xs font-medium ${textMuted}`}>Store Location</p>
            <p className={`text-sm font-semibold ${textHeading}`}>{location}</p>
          </div>
        </div>

        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${surfaceMuted}`}>
          <Calendar className={`h-5 w-5 ${iconColor.indigo}`} />
          <div>
            <p className={`text-xs font-medium ${textMuted}`}>Generated</p>
            <p className={`text-sm font-semibold ${textHeading}`}>{generatedAt}</p>
          </div>
        </div>

        <div className={confidenceBox}>
          <ShieldCheck className={`h-5 w-5 ${iconColor.emerald}`} />
          <div>
            <p className={confidenceLabel}>Confidence Score</p>
            <p className={confidenceValue}>
              {typeof confidenceScore === "number"
                ? `${confidenceScore}%`
                : confidenceScore || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
