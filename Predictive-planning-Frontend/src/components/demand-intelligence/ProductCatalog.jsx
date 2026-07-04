import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  Boxes,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import productCsv from "../../../data/department_store_products_1000.csv?raw";

const PAGE_SIZE = 25;

const numericFields = new Set([
  "usual_monthly_sales",
  "current_stock",
  "safety_stock",
  "reorder_point",
  "lead_time_days",
  "unit_price",
]);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  const [headers, ...records] = rows;
  return records.map((record) =>
    headers.reduce((product, header, index) => {
      const rawValue = record[index] ?? "";
      product[header] = numericFields.has(header)
        ? Number(rawValue)
        : rawValue.trim();
      return product;
    }, {})
  );
}

function getUniqueOptions(products, key) {
  return [...new Set(products.map((product) => product[key]).filter(Boolean))].sort();
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function getStockStatus(product) {
  if (product.current_stock <= product.safety_stock) return "critical";
  if (product.current_stock <= product.reorder_point) return "reorder";
  return "healthy";
}

const sortOptions = [
  { value: "sku_id", label: "SKU ID" },
  { value: "sku_name", label: "Product Name" },
  { value: "current_stock", label: "Current Stock" },
  { value: "usual_monthly_sales", label: "Monthly Sales" },
  { value: "reorder_point", label: "Reorder Point" },
  { value: "unit_price", label: "Unit Price" },
];

export default function ProductCatalog() {
  const products = useMemo(() => parseCsv(productCsv), []);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [category, setCategory] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [sortField, setSortField] = useState("sku_id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);

  const departments = useMemo(() => getUniqueOptions(products, "department"), [products]);
  const categories = useMemo(() => getUniqueOptions(products, "category"), [products]);
  const warehouses = useMemo(() => getUniqueOptions(products, "warehouse"), [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesQuery =
          !normalizedQuery ||
          [
            product.sku_id,
            product.sku_name,
            product.department,
            product.category,
            product.subcategory,
            product.brand,
            product.warehouse,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesDepartment =
          department === "all" || product.department === department;
        const matchesCategory = category === "all" || product.category === category;
        const matchesWarehouse = warehouse === "all" || product.warehouse === warehouse;
        const matchesStock =
          stockStatus === "all" || getStockStatus(product) === stockStatus;
        const matchesActive =
          activeStatus === "all" || product.is_active === activeStatus;

        return (
          matchesQuery &&
          matchesDepartment &&
          matchesCategory &&
          matchesWarehouse &&
          matchesStock &&
          matchesActive
        );
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        const direction = sortDirection === "asc" ? 1 : -1;

        if (typeof aValue === "number" && typeof bValue === "number") {
          return (aValue - bValue) * direction;
        }

        return String(aValue).localeCompare(String(bValue), undefined, {
          numeric: true,
        }) * direction;
      });
  }, [
    activeStatus,
    category,
    department,
    products,
    query,
    sortDirection,
    sortField,
    stockStatus,
    warehouse,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const summary = useMemo(() => {
    const critical = products.filter((product) => getStockStatus(product) === "critical").length;
    const reorder = products.filter((product) => getStockStatus(product) === "reorder").length;
    const stockValue = products.reduce(
      (total, product) => total + product.current_stock * product.unit_price,
      0
    );

    return {
      products: products.length,
      departments: departments.length,
      critical,
      reorder,
      stockValue,
    };
  }, [departments.length, products]);

  const resetFilters = () => {
    setQuery("");
    setDepartment("all");
    setCategory("all");
    setWarehouse("all");
    setStockStatus("all");
    setActiveStatus("all");
    setSortField("sku_id");
    setSortDirection("asc");
    setPage(1);
  };

  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  return (
    <section className="product-catalog animate-fadeIn">
      <div className="catalog-header">
        <div>
          <p className="catalog-eyebrow">Product catalog</p>
          <h2>Department store products</h2>
          <p className="catalog-subtitle">
            Browse the 1,000 SKU product master with inventory, reorder, warehouse, and pricing context.
          </p>
        </div>
        <div className="catalog-header-icon" aria-hidden="true">
          <PackageSearch className="h-7 w-7" />
        </div>
      </div>

      <div className="catalog-summary-grid">
        <div className="catalog-summary-card">
          <span>Total products</span>
          <strong>{formatNumber(summary.products)}</strong>
        </div>
        <div className="catalog-summary-card">
          <span>Departments</span>
          <strong>{formatNumber(summary.departments)}</strong>
        </div>
        {/* <div className="catalog-summary-card">
          <span>Below safety stock</span>
          <strong>{formatNumber(summary.critical)}</strong>
        </div> */}
        {/* <div className="catalog-summary-card">
          <span>At reorder point</span>
          <strong>{formatNumber(summary.reorder)}</strong>
        </div> */}
        <div className="catalog-summary-card">
          <span>Stock value</span>
          <strong>₹{formatNumber(summary.stockValue)}</strong>
        </div>
      </div>

      <div className="catalog-toolbar">
        <div className="catalog-filters">
          <div className="catalog-search flex-grow min-w-[280px]">
            <Search className="h-4 w-4" />
            <input
              type="search"
              value={query}
              onChange={updateFilter(setQuery)}
              placeholder="Search SKU, product, brand, category, warehouse"
            />
          </div>
          <label>
            <span>Department</span>
            <select value={department} onChange={updateFilter(setDepartment)}>
              <option value="all">All departments</option>
              {departments.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Category</span>
            <select value={category} onChange={updateFilter(setCategory)}>
              <option value="all">All categories</option>
              {categories.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          {/* <label>
            <span>Warehouse</span>
            <select value={warehouse} onChange={updateFilter(setWarehouse)}>
              <option value="all">All warehouses</option>
              {warehouses.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label> */}

          <label>
            <span>Stock</span>
            <select value={stockStatus} onChange={updateFilter(setStockStatus)}>
              <option value="all">All stock levels</option>
              <option value="healthy">Healthy</option>
              <option value="reorder">At reorder point</option>
              <option value="critical">Below safety stock</option>
            </select>
          </label>

          <label>
            <span>Status</span>
            <select value={activeStatus} onChange={updateFilter(setActiveStatus)}>
              <option value="all">All products</option>
              <option value="True">Active</option>
              <option value="False">Inactive</option>
            </select>
          </label>

          <label>
            <span>Sort by</span>
            <select value={sortField} onChange={updateFilter(setSortField)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="catalog-icon-btn"
            onClick={() => setSortDirection((value) => (value === "asc" ? "desc" : "asc"))}
            title="Toggle sort direction"
          >
            <ArrowDownUp className="h-4 w-4" />
            <span>{sortDirection === "asc" ? "Asc" : "Desc"}</span>
          </button>
          
          <button type="button" className="catalog-reset-btn" onClick={resetFilters}>
            <SlidersHorizontal className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="catalog-results-bar">
        <div>
          <Boxes className="h-4 w-4" />
          Showing <strong>{formatNumber(pagedProducts.length)}</strong> of{" "}
          <strong>{formatNumber(filteredProducts.length)}</strong> products
        </div>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      <div className="catalog-table-wrap">
        <table className="catalog-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Department</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Monthly sales</th>
              <th>Stock</th>
              <th>Reorder</th>
              {/* <th>Warehouse</th> */}
              <th>Lead time</th>
              <th>Unit price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.map((product) => {
              const status = getStockStatus(product);

              return (
                <tr key={product.sku_id}>
                  <td>
                    <code>{product.sku_id}</code>
                  </td>
                  <td>
                    <strong>{product.sku_name}</strong>
                    <span>{product.subcategory}</span>
                  </td>
                  <td>{product.department}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>{formatNumber(product.usual_monthly_sales)}</td>
                  <td>
                    <strong>{formatNumber(product.current_stock)}</strong>
                    <span>{product.unit}</span>
                  </td>
                  <td>
                    <strong>{formatNumber(product.reorder_point)}</strong>
                    <span>Safety {formatNumber(product.safety_stock)}</span>
                  </td>
                  {/* <td>{product.warehouse}</td> */}
                  <td>{product.lead_time_days} days</td>
                  <td>₹{formatNumber(product.unit_price)}</td>
                  <td>
                    <span className={`catalog-stock-pill is-${status}`}>
                      {status === "critical"
                        ? "Below safety"
                        : status === "reorder"
                          ? "Reorder"
                          : "Healthy"}
                    </span>
                    <span className={`catalog-active-pill ${product.is_active === "True" ? "is-active" : ""}`}>
                      {product.is_active === "True" ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="catalog-pagination">
        <button
          type="button"
          className="catalog-page-btn"
          disabled={currentPage === 1}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span>{currentPage} / {totalPages}</span>
        <button
          type="button"
          className="catalog-page-btn"
          disabled={currentPage === totalPages}
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
