import { Inbox } from "lucide-react";
import { card, textHeading, textMuted } from "./themeClasses";

export default function EmptyState({ title = "No data", message }) {
  return (
    <div
      className={`${card} flex flex-col items-center justify-center px-6 py-14 text-center`}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-[#0f2344]">
        <Inbox className="h-7 w-7 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className={`text-base font-semibold ${textHeading}`}>{title}</h3>
      {message && (
        <p className={`mt-2 max-w-sm text-sm ${textMuted}`}>{message}</p>
      )}
    </div>
  );
}
