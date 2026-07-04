import { useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import {
  borderDefault,
  divideLight,
  emptyState,
  input,
  tableHead,
  tableRowHover,
  textBody,
  textMuted,
} from "./themeClasses";

export default function DataTable({
  columns,
  data = [],
  searchable = false,
  searchPlaceholder = "Search…",
  searchKeys = [],
  sortable = false,
  emptyMessage = "No data available.",
  getRowKey = (row, index) => row.id ?? row.product_name ?? index,
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const filtered = useMemo(() => {
    let rows = [...data];

    if (searchable && search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((row) =>
        (searchKeys.length ? searchKeys : Object.keys(row)).some((key) =>
          String(row[key] ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    }

    if (sortable && sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "number" && typeof bv === "number") {
          return sortDir === "asc" ? av - bv : bv - av;
        }
        return sortDir === "asc"
          ? String(av ?? "").localeCompare(String(bv ?? ""))
          : String(bv ?? "").localeCompare(String(av ?? ""));
      });
    }

    return rows;
  }, [data, search, searchKeys, sortKey, sortDir, searchable, sortable]);

  const handleSort = (key) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <Search
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${textMuted}`}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className={`${input} py-2 pl-9`}
          />
        </div>
      )}

      <div className={`overflow-x-auto rounded-xl border ${borderDefault}`}>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className={tableHead}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${textMuted} ${
                    sortable && col.sortable !== false
                      ? "cursor-pointer select-none"
                      : ""
                  }`}
                  onClick={() =>
                    sortable && col.sortable !== false && handleSort(col.key)
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortable && col.sortable !== false && (
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${divideLight}`}>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`px-4 py-10 ${emptyState}`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filtered.map((row, index) => (
                <tr key={getRowKey(row, index)} className={tableRowHover}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 align-top ${textBody}`}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {searchable && filtered.length > 0 && (
        <p className={`text-xs ${textMuted}`}>
          Showing {filtered.length} of {data.length} records
        </p>
      )}
    </div>
  );
}
