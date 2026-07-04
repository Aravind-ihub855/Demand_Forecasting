import http from "./http";

export async function getInventoryMeta() {
  const { data } = await http.get("/inventory/meta");
  return data;
}

export async function getWarehouseInventory(warehouseId, { limit } = {}) {
  const params = {};
  if (limit) params.limit = limit;
  const { data } = await http.get(`/inventory/warehouse/${warehouseId}`, { params });
  return data;
}

export async function getStoreInventory(storeId, { limit } = {}) {
  const params = {};
  if (limit) params.limit = limit;
  const { data } = await http.get(`/inventory/store/${storeId}`, { params });
  return data;
}

