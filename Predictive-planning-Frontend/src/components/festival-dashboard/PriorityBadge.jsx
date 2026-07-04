const LEVEL_CLASS = {
  Critical: "fd-badge fd-badge-critical",
  High: "fd-badge fd-badge-high",
  Medium: "fd-badge fd-badge-medium",
  Low: "fd-badge fd-badge-low",
  "Very High": "fd-badge fd-badge-critical",
};

export default function PriorityBadge({ value }) {
  const label = value || "—";
  const cls = LEVEL_CLASS[label] || "fd-badge";
  return <span className={cls}>{label}</span>;
}
