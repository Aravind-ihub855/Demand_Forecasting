import { useEffect, useMemo, useState } from "react";
import {
  getInventoryMeta,
  getStoreInventory,
  getWarehouseInventory,
} from "../api/inventoryApi";

function formatDate(v) {
  if (!v) return "";
  return String(v);
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`inv-tab-btn ${active ? "is-active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function InventoryTable({ items, mode }) {
  // mode: "warehouse" | "store"
  return (
    <div className="inv-table-wrap">
      <table className="inv-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Brand</th>
            <th>Package</th>
            <th>Unit</th>
            <th>Category</th>
            <th>MRP</th>
            <th>Selling</th>
            <th>On Hand</th>
            {mode === "warehouse" ? <th>Allocated</th> : <th>Reserved</th>}
            <th>Available</th>
            <th>Damaged</th>
            {mode === "store" && <th>Expired</th>}
            <th>Expiry</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={`${it.sku_id}:${it.batch_id || ""}`}>
              <td>{it.sku_name}</td>
              <td>{it.brand || "-"}</td>
              <td>{it.package_size || "-"}</td>
              <td>{it.unit_type || "-"}</td>
              <td>{it.category_name || it.category_id}</td>
              <td>{it.mrp ?? "-"}</td>
              <td>{it.selling_price ?? "-"}</td>
              <td>{it.quantity_on_hand}</td>
              {mode === "warehouse" ? <td>{it.allocated_quantity}</td> : <td>{it.reserved_quantity}</td>}
              <td>{it.available_quantity}</td>
              <td>{it.damaged_quantity}</td>
              {mode === "store" && <td>{it.expired_quantity}</td>}
              <td>{formatDate(it.expiry_date)}</td>
              <td>{it.inventory_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const InventoryPage = () => {
  const [meta, setMeta] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");

  const [activeTab, setActiveTab] = useState("outlets");
  const [loadingStock, setLoadingStock] = useState(false);
  const [stockError, setStockError] = useState("");

  const [inventoryCache, setInventoryCache] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        setMetaLoading(true);
        const data = await getInventoryMeta();
        setMeta(data);
      } catch (e) {
        setMetaError(e?.response?.data?.message || "Failed to load inventory meta");
      } finally {
        setMetaLoading(false);
      }
    };
    load();
  }, []);

  const orderedWarehouses = useMemo(() => {
    if (!meta?.warehouses) return [];
    return [...meta.warehouses].sort((a, b) => a.warehouse_id.localeCompare(b.warehouse_id));
  }, [meta]);

  const orderedStores = useMemo(() => {
    if (!meta?.stores) return [];
    return [...meta.stores].sort((a, b) => a.store_id.localeCompare(b.store_id));
  }, [meta]);

  const tabs = useMemo(() => {
    const t = [];
    t.push({ key: "outlets", label: "Warehouses & Stores" });
    orderedWarehouses.forEach((w) => {
      t.push({
        key: w.warehouse_id,
        label: w.warehouse_name,
      });
    });
    orderedStores.forEach((s) => {
      t.push({
        key: s.store_id,
        label: s.store_name,
      });
    });
    return t;
  }, [orderedStores, orderedWarehouses]);

  const activeMode = useMemo(() => {
    if (activeTab === "outlets") return "outlets";
    if (orderedWarehouses.some((w) => w.warehouse_id === activeTab)) return "warehouse";
    return "store";
  }, [activeTab, orderedWarehouses]);

  const loadStock = async () => {
    if (!meta) return;
    setStockError("");

    const cacheKey =
      activeMode === "warehouse" ? `warehouse:${activeTab}` : `store:${activeTab}`;
    if (inventoryCache[cacheKey]) return;

    try {
      setLoadingStock(true);
      const limit = 500; // UI-friendly cap; adjust if you want all rows
      let data;
      if (activeMode === "warehouse") {
        data = await getWarehouseInventory(activeTab, { limit });
      } else {
        data = await getStoreInventory(activeTab, { limit });
      }
      setInventoryCache((prev) => ({ ...prev, [cacheKey]: data.items || [] }));
    } catch (e) {
      setStockError(e?.response?.data?.message || "Failed to load inventory stock");
    } finally {
      setLoadingStock(false);
    }
  };

  useEffect(() => {
    if (activeMode === "outlets") return;
    // Lint note: loadStock updates React state, but this is intentional to reflect async API results.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeMode, meta]);

  const activeItems = useMemo(() => {
    if (activeMode === "outlets") return [];
    const cacheKey =
      activeMode === "warehouse" ? `warehouse:${activeTab}` : `store:${activeTab}`;
    return inventoryCache[cacheKey] || [];
  }, [activeMode, activeTab, inventoryCache]);

  return (
    <section className="stack-panels inv-page">
      <div className="inv-header">
        <h2 className="inv-title">Inventory</h2>
        <p className="subtle">Warehouses, stores and current stock snapshots</p>
      </div>

      <div className="inv-tabs" role="tablist" aria-label="Inventory tabs">
        {tabs.map((t) => (
          <TabButton key={t.key} active={activeTab === t.key} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </TabButton>
        ))}
      </div>

      {metaLoading && <div className="panel">Loading inventory meta...</div>}
      {metaError && <div className="panel error">{metaError}</div>}

      {!metaLoading && meta && activeMode === "outlets" && (
        <div className="inv-outlets-grid">
          {meta.outlets.map((o) => (
            <article className="panel inv-outlet-card" key={o.store_id}>
              <h3>{o.store_name}</h3>
              <p>
                <strong>Store:</strong> {o.store_code} ({o.store_type})
              </p>
              <p>
                <strong>Area:</strong> {o.area}
              </p>
              <p>
                <strong>Warehouse:</strong> {o.warehouse_name} ({o.warehouse_code})
              </p>
              <p>
                <strong>Warehouse Type:</strong> {o.warehouse_type}
              </p>
            </article>
          ))}
        </div>
      )}

      {!metaLoading && meta && activeMode !== "outlets" && (
        <div className="panel">
          <div className="inv-stock-top">
            <h3 className="inv-stock-title">
              {activeMode === "warehouse" ? "Warehouse stock" : "Store stock"} — {activeTab}
            </h3>
            {loadingStock ? <p>Loading...</p> : <p>{activeItems.length} items</p>}
          </div>
          {stockError && <div className="error">{stockError}</div>}
          {loadingStock ? null : activeItems.length > 0 ? (
            <InventoryTable items={activeItems} mode={activeMode} />
          ) : (
            <p>No stock data found.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default InventoryPage;

