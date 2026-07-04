const Warehouse = require("../models/Warehouse");
const Store = require("../models/Store");
const Product = require("../models/Product");
const ProductCategory = require("../models/ProductCategory");
const WarehouseInventory = require("../models/WarehouseInventory");
const StoreInventory = require("../models/StoreInventory");

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

async function enrichWarehouseItems(inventoryDocs) {
  const skuIds = [...new Set(inventoryDocs.map((d) => d.sku_id))];
  const products = await Product.find({ sku_id: { $in: skuIds } }).lean();
  const productBySku = new Map(products.map((p) => [p.sku_id, p]));

  const catIds = [...new Set(products.map((p) => p.category_id).filter(Boolean))];
  const categories = await ProductCategory.find({ category_id: { $in: catIds } }).lean();
  const categoryById = new Map(categories.map((c) => [c.category_id, c]));

  return inventoryDocs.map((d) => {
    const p = productBySku.get(d.sku_id);
    const c = p ? categoryById.get(p.category_id) : undefined;

    return {
      sku_id: d.sku_id,
      sku_name: p?.sku_name || d.sku_id,
      category_id: p?.category_id,
      category_name: c?.category_name,
      supplier_id: p?.supplier_id,
      batch_id: d.batch_id,

      brand: p?.brand,
      package_size: p?.package_size,
      unit_type: p?.unit_type,
      mrp: p?.mrp,
      selling_price: p?.selling_price,
      storage_type: p?.storage_type,
      behavior_type: p?.behavior_type,
      shelf_life_days: p?.shelf_life_days,
      perishable_flag: p?.perishable_flag,

      quantity_on_hand: d.quantity_on_hand,
      allocated_quantity: d.allocated_quantity,
      available_quantity: d.available_quantity,
      damaged_quantity: d.damaged_quantity,
      inbound_quantity: d.inbound_quantity,
      outbound_quantity: d.outbound_quantity,

      reorder_flag: d.reorder_flag,
      reorder_level: d.reorder_level,
      inventory_status: d.inventory_status,
      expiry_date: d.expiry_date,
      storage_zone: d.storage_zone,
    };
  });
}

async function enrichStoreItems(inventoryDocs) {
  const skuIds = [...new Set(inventoryDocs.map((d) => d.sku_id))];
  const products = await Product.find({ sku_id: { $in: skuIds } }).lean();
  const productBySku = new Map(products.map((p) => [p.sku_id, p]));

  const catIds = [...new Set(products.map((p) => p.category_id).filter(Boolean))];
  const categories = await ProductCategory.find({ category_id: { $in: catIds } }).lean();
  const categoryById = new Map(categories.map((c) => [c.category_id, c]));

  return inventoryDocs.map((d) => {
    const p = productBySku.get(d.sku_id);
    const c = p ? categoryById.get(p.category_id) : undefined;

    return {
      sku_id: d.sku_id,
      sku_name: p?.sku_name || d.sku_id,
      category_id: p?.category_id,
      category_name: c?.category_name,
      supplier_id: p?.supplier_id,
      batch_id: d.batch_id,

      brand: p?.brand,
      package_size: p?.package_size,
      unit_type: p?.unit_type,
      mrp: p?.mrp,
      selling_price: p?.selling_price,
      storage_type: p?.storage_type,
      behavior_type: p?.behavior_type,
      shelf_life_days: p?.shelf_life_days,
      perishable_flag: p?.perishable_flag,

      quantity_on_hand: d.quantity_on_hand,
      reserved_quantity: d.reserved_quantity,
      available_quantity: d.available_quantity,
      damaged_quantity: d.damaged_quantity,
      expired_quantity: d.expired_quantity,

      reorder_flag: d.reorder_flag,
      reorder_level: d.reorder_level,
      inventory_status: d.inventory_status,
      expiry_date: d.expiry_date,
      storage_zone: d.storage_zone,
    };
  });
}

exports.getInventoryMeta = async (req, res) => {
  const [warehouses, stores] = await Promise.all([
    Warehouse.find().lean(),
    Store.find().lean(),
  ]);

  const warehouseById = new Map(warehouses.map((w) => [w.warehouse_id, w]));

  const outlets = stores.map((s) => {
    const w = warehouseById.get(s.warehouse_id);
    return {
      store_id: s.store_id,
      store_code: s.store_code,
      store_name: s.store_name,
      store_type: s.store_type,
      area: s.area,

      warehouse_id: s.warehouse_id,
      warehouse_code: w?.warehouse_code,
      warehouse_name: w?.warehouse_name,
      warehouse_type: w?.warehouse_type,
    };
  });

  res.json({
    warehouses: warehouses.map((w) => ({
      warehouse_id: w.warehouse_id,
      warehouse_code: w.warehouse_code,
      warehouse_name: w.warehouse_name,
      warehouse_type: w.warehouse_type,
    })),
    stores: stores.map((s) => ({
      store_id: s.store_id,
      store_code: s.store_code,
      store_name: s.store_name,
      store_type: s.store_type,
    })),
    outlets,
  });
};

exports.getWarehouseInventory = async (req, res) => {
  const warehouseId = req.params.warehouse_id;
  const limit = toNumber(req.query.limit);

  const query = { warehouse_id: warehouseId };
  const inventoryDocs = await WarehouseInventory.find(query)
    .limit(limit || 5000)
    .lean();

  const items = await enrichWarehouseItems(inventoryDocs);
  res.json({
    warehouse_id: warehouseId,
    count: items.length,
    items,
  });
};

exports.getStoreInventory = async (req, res) => {
  const storeId = req.params.store_id;
  const limit = toNumber(req.query.limit);

  const inventoryDocs = await StoreInventory.find({ store_id: storeId })
    .limit(limit || 5000)
    .lean();

  const items = await enrichStoreItems(inventoryDocs);
  res.json({
    store_id: storeId,
    count: items.length,
    items,
  });
};

