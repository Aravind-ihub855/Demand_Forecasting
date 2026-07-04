import { useMemo, useState } from "react";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, ListFilter } from "lucide-react";
import {
  borderDefault,
  divideLight,
  emptyState,
  input,
  tableHead,
  tableRowHover,
  textBody,
  textHeading,
  textMuted,
  surfaceMuted,
} from "./themeClasses";

export default function EnterpriseTable({
  columns,
  data = [],
  searchable = true,
  searchPlaceholder = "Search products…",
  searchKeys = [],
  sortable = true,
  emptyMessage = "No products found.",
  getRowKey = (row, index) => row.id ?? row.product_name ?? row.sku_id ?? index,
  loading = false,
  pageSizeOptions = [5, 10, 20, 50],
  defaultPageSize = 10,
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset page when search changes
  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // 1. Filter and Sort
  const processedData = useMemo(() => {
    let rows = [...data];

    // Filter
    if (searchable && search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((row) => {
        const targetKeys = searchKeys.length > 0 ? searchKeys : Object.keys(row);
        return targetKeys.some((key) =>
          String(row[key] ?? "")
            .toLowerCase()
            .includes(q)
        );
      });
    }

    // Sort
    if (sortable && sortKey) {
      rows.sort((a, b) => {
        let av = a[sortKey];
        let bv = b[sortKey];

        // Handle numeric values stored as strings, or extract spike percentages
        if (typeof av === "string" && !isNaN(Number(av.replace(/%/g, "")))) {
          av = Number(av.replace(/%/g, ""));
        }
        if (typeof bv === "string" && !isNaN(Number(bv.replace(/%/g, "")))) {
          bv = Number(bv.replace(/%/g, ""));
        }

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

  // 2. Pagination Math
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = useMemo(() => {
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, startIndex, pageSize]);

  // Reset page if it exceeds total pages after filtering
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

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
      {/* Search and Metadata Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchable && (
          <div className="relative w-full max-w-sm">
            <Search
              className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${textMuted}`}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={`${input} py-2 pl-9 pr-4 text-xs sm:text-sm`}
            />
          </div>
        )}

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Row count info */}
          <span className={`text-xs ${textMuted}`}>
            {totalItems === 0
              ? "No records"
              : `Showing ${startIndex + 1}-${Math.min(
                startIndex + pageSize,
                totalItems
              )} of ${totalItems}`}
          </span>

          {/* Page size dropdown */}
          <div className="flex items-center gap-1.5">
            <span className={`text-xs ${textMuted}`}>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-[#19345f] dark:bg-[#0f2344] dark:text-[#eef5ff]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div
        className={`relative overflow-x-auto rounded-xl border ${borderDefault} shadow-sm max-h-[400px] overflow-y-auto`}
      >
        <table className="w-full min-w-[700px] table-fixed text-left text-sm">
          {/* Sticky Header */}
          <thead className={`sticky top-0 z-10 ${tableHead} backdrop-blur-md`}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width || "auto" }}
                  className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider border-b ${borderDefault} ${textMuted} ${sortable && col.sortable !== false
                      ? "cursor-pointer select-none hover:text-indigo-600 dark:hover:text-indigo-400"
                      : ""
                    }`}
                  onClick={() =>
                    sortable && col.sortable !== false && handleSort(col.key)
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortable && col.sortable !== false && (
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${divideLight} bg-white dark:bg-[#0c1a33]`}>
            {loading ? (
              // Loading Skeleton State
              Array.from({ length: Math.min(5, pageSize) }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded w-5/6" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length}
                  className={`px-4 py-16 text-center ${emptyState}`}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <ListFilter className={`h-8 w-8 ${textMuted} opacity-40`} />
                    <p className={`font-medium ${textHeading}`}>{emptyMessage}</p>
                    {search && (
                      <p className={`text-xs ${textMuted}`}>
                        Try clearing search terms or filters
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              paginatedData.map((row, index) => (
                <tr key={getRowKey(row, index)} className={`${tableRowHover} group`}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 align-middle text-xs sm:text-sm overflow-hidden text-ellipsis ${textBody}`}
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

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className={`text-xs ${textMuted}`}>
            Page {currentPage} of {totalPages}
          </p>

          <div className="inline-flex gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-[#19345f] dark:text-[#eef5ff] dark:hover:bg-[#152a4d]`}
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-[#19345f] dark:text-[#eef5ff] dark:hover:bg-[#152a4d]`}
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
