import { useEffect, useState } from "react";

export default function useAppTheme() {
  const [theme, setTheme] = useState(
    () => document.body.getAttribute("data-theme") || "light"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.body.getAttribute("data-theme") || "light");
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

export function getChartTheme(theme) {
  const isDark = theme === "dark";
  return {
    grid: isDark ? "#19345f" : "#e2e8f0",
    tick: isDark ? "#a9b7d6" : "#64748b",
    tooltip: {
      bg: isDark ? "#0c1a33" : "#ffffff",
      border: isDark ? "#19345f" : "#e2e8f0",
      text: isDark ? "#eef5ff" : "#0f172a",
      accent: isDark ? "#818cf8" : "#4f46e5",
    },
  };
}
