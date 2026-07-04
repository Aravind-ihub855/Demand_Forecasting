const path = require("path");
const fs = require("fs");
const csvParser = require("csv-parser");

const connectDb = require("../config/db");

const ProductCategory = require("../models/ProductCategory");
const ProductCategoryDistribution = require("../models/ProductCategoryDistribution");
const Supplier = require("../models/Supplier");
const Warehouse = require("../models/Warehouse");
const Store = require("../models/Store");
const Product = require("../models/Product");
const InventoryState = require("../models/InventoryState");
const StockPattern = require("../models/StockPattern");
const WarehouseStoreRelationship = require("../models/WarehouseStoreRelationship");
const SkuWarehouseMapping = require("../models/SkuWarehouseMapping");
const ProductDistribution = require("../models/ProductDistribution");
const WarehouseInventory = require("../models/WarehouseInventory");
const StoreInventory = require("../models/StoreInventory");

function datasetsDir() {
  // Predictive-planning-Backend/src/scripts -> Predictive-planning-Backend -> Demand Forecasting -> Datasets
  return path.resolve(__dirname, "..", "..", "..", "Datasets");
}

function toNumber(v) {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toBool(v) {
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

async function streamCsv(filePath, onRow) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => onRow(row))
      .on("end", resolve)
      .on("error", reject);
  });
}

async function upsertFromCsv({ fileName, model, uniqueKey, mapRow, batchSize = 1000 }) {
  const filePath = path.join(datasetsDir(), fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing dataset file: ${filePath}`);
  }

  let ops = [];
  let count = 0;

  await streamCsv(filePath, (row) => {
    const doc = mapRow(row);
    const keyVal = doc[uniqueKey];
    if (!keyVal) return;

    ops.push({
      updateOne: {
        filter: { [uniqueKey]: keyVal },
        update: { $set: doc },
        upsert: true,
      },
    });

    if (ops.length >= batchSize) {
      model.bulkWrite(ops, { ordered: false }).catch(() => {});
      count += ops.length;
      ops = [];
    }
  });

  if (ops.length > 0) {
    await model.bulkWrite(ops, { ordered: false });
    count += ops.length;
  }

  // eslint-disable-next-line no-console
  console.log(`Upserted ~${count} rows into ${model.modelName} from ${fileName}`);
}

async function run() {
  await connectDb();

  // Import order ensures references exist before dependent collections.
  await upsertFromCsv({
    fileName: "PRODUCT_CATEGORY.csv",
    model: ProductCategory,
    uniqueKey: "category_id",
    mapRow: (r) => ({
      category_id: r.category_id,
      category_name: r.category_name,
      department: r.department,
      storage_requirement: r.storage_requirement,
      perishable_flag: toBool(r.perishable_flag),
      status: r.status,
      category_description: r.category_description,
      avg_margin_percentage: toNumber(r.avg_margin_percentage),
      avg_inventory_turnover: toNumber(r.avg_inventory_turnover),
      seasonality_type: r.seasonality_type,
      demand_pattern: r.demand_pattern,
    }),
  });

  await upsertFromCsv({
    fileName: "PRODUCT_CATEGORY_DISTRIBUTION.csv",
    model: ProductCategoryDistribution,
    uniqueKey: "distribution_id",
    mapRow: (r) => ({
      distribution_id: r.distribution_id,
      category_id: r.category_id,
      expected_sku_count: toNumber(r.expected_sku_count),
      demand_priority: r.demand_priority,
      storage_share_percentage: toNumber(r.storage_share_percentage),
      avg_sales_share_percentage: toNumber(r.avg_sales_share_percentage),
      avg_profit_share: toNumber(r.avg_profit_share),
      seasonal_weight: toNumber(r.seasonal_weight),
      promotion_frequency: r.promotion_frequency,
    }),
  });

  await upsertFromCsv({
    fileName: "WAREHOUSE_MASTER.csv",
    model: Warehouse,
    uniqueKey: "warehouse_id",
    mapRow: (r) => ({
      warehouse_id: r.warehouse_id,
      warehouse_code: r.warehouse_code,
      warehouse_name: r.warehouse_name,
      warehouse_type: r.warehouse_type,
      city: r.city,
      area: r.area,
      state: r.state,
      pincode: r.pincode,
      latitude: toNumber(r.latitude),
      longitude: toNumber(r.longitude),
      total_capacity_units: toNumber(r.total_capacity_units),
      cold_storage_available: toBool(r.cold_storage_available),
      loading_docks: toNumber(r.loading_docks),
      operating_hours: r.operating_hours,
      manager_name: r.manager_name,
      status: r.status,
      avg_dispatch_time_hours: toNumber(r.avg_dispatch_time_hours),
      power_backup_flag: toBool(r.power_backup_flag),
      automation_level: r.automation_level,
      warehouse_zone: r.warehouse_zone,
      transport_partners: r.transport_partners,
      security_level: r.security_level,
    }),
  });

  await upsertFromCsv({
    fileName: "STORE_MASTER.csv",
    model: Store,
    uniqueKey: "store_id",
    mapRow: (r) => ({
      store_id: r.store_id,
      store_code: r.store_code,
      store_name: r.store_name,
      city: r.city,
      area: r.area,
      state: r.state,
      pincode: r.pincode,
      latitude: toNumber(r.latitude),
      longitude: toNumber(r.longitude),
      opening_time: r.opening_time,
      closing_time: r.closing_time,
      store_size_sqft: toNumber(r.store_size_sqft),
      warehouse_id: r.warehouse_id,
      max_storage_capacity: toNumber(r.max_storage_capacity),
      avg_daily_customers: toNumber(r.avg_daily_customers),
      store_type: r.store_type,
      status: r.status,
      parking_available: toBool(r.parking_available),
      premium_customer_ratio: toNumber(r.premium_customer_ratio),
      footfall_peak_hours: r.footfall_peak_hours,
      online_delivery_supported: toBool(r.online_delivery_supported),
      demographic_profile: r.demographic_profile,
      income_segment: r.income_segment,
    }),
  });

  await upsertFromCsv({
    fileName: "SUPPLIER_MASTER.csv",
    model: Supplier,
    uniqueKey: "supplier_id",
    mapRow: (r) => ({
      supplier_id: r.supplier_id,
      supplier_name: r.supplier_name,
      supplier_type: r.supplier_type,
      city: r.city,
      state: r.state,
      pincode: r.pincode,
      contact_number: r.contact_number,
      supplied_categories: r.supplied_categories,
      lead_time_days: toNumber(r.lead_time_days),
      minimum_order_quantity: toNumber(r.minimum_order_quantity),
      payment_terms: r.payment_terms,
      supplier_rating: r.supplier_rating,
      status: r.status,
      gst_number: r.gst_number,
      on_time_delivery_percentage: toNumber(r.on_time_delivery_percentage),
      defect_rate_percentage: toNumber(r.defect_rate_percentage),
      average_supply_capacity: toNumber(r.average_supply_capacity),
      preferred_supplier_flag: toBool(r.preferred_supplier_flag),
      emergency_supply_support: toBool(r.emergency_supply_support),
    }),
  });

  await upsertFromCsv({
    fileName: "PRODUCT_MASTER.csv",
    model: Product,
    uniqueKey: "sku_id",
    mapRow: (r) => ({
      sku_id: r.sku_id,
      sku_code: r.sku_code,
      sku_name: r.sku_name,
      category_id: r.category_id,
      subcategory_id: r.subcategory_id,
      brand: r.brand,
      package_size: r.package_size,
      unit_type: r.unit_type,
      mrp: toNumber(r.mrp),
      selling_price: toNumber(r.selling_price),
      cost_price: toNumber(r.cost_price),
      gst_percentage: toNumber(r.gst_percentage),
      shelf_life_days: toNumber(r.shelf_life_days),
      perishable_flag: toBool(r.perishable_flag),
      storage_type: r.storage_type,
      behavior_type: r.behavior_type,
      seasonal_flag: toBool(r.seasonal_flag),
      festival_relevance: r.festival_relevance,
      private_label_flag: toBool(r.private_label_flag),
      supplier_id: r.supplier_id,
      reorder_level: toNumber(r.reorder_level),
      reorder_quantity: toNumber(r.reorder_quantity),
      status: r.status,
      product_margin_percentage: toNumber(r.product_margin_percentage),
      weight_grams: toNumber(r.weight_grams),
      lead_time_days: toNumber(r.lead_time_days),
    }),
  });

  await upsertFromCsv({
    fileName: "INVENTORY_STATES.csv",
    model: InventoryState,
    uniqueKey: "inventory_state_id",
    mapRow: (r) => ({
      inventory_state_id: r.inventory_state_id,
      state_name: r.state_name,
      description: r.description,
      severity_level: r.severity_level,
      replenishment_required: toBool(r.replenishment_required),
      sellable_flag: toBool(r.sellable_flag),
      auto_alert_flag: toBool(r.auto_alert_flag),
      dashboard_color_code: r.dashboard_color_code,
      escalation_required: toBool(r.escalation_required),
      warehouse_action_required: toBool(r.warehouse_action_required),
    }),
  });

  await upsertFromCsv({
    fileName: "STOCK_PATTERNS.csv",
    model: StockPattern,
    uniqueKey: "sku_id",
    mapRow: (r) => ({
      stock_pattern_id: r.stock_pattern_id,
      sku_id: r.sku_id,
      movement_type: r.movement_type,
      avg_daily_sales: toNumber(r.avg_daily_sales),
      replenishment_frequency_days: toNumber(r.replenishment_frequency_days),
      demand_variability_score: toNumber(r.demand_variability_score),
      stockout_risk_level: r.stockout_risk_level,
      shelf_life_risk: r.shelf_life_risk,
      lead_time_days: toNumber(r.lead_time_days),
      seasonal_peak_months: r.seasonal_peak_months,
      weather_sensitivity: r.weather_sensitivity,
      promotion_sensitivity: r.promotion_sensitivity,
      markdown_risk: r.markdown_risk,
      return_rate_percentage: toNumber(r.return_rate_percentage),
    }),
  });

  await upsertFromCsv({
    fileName: "WAREHOUSE_STORE_RELATIONSHIP.csv",
    model: WarehouseStoreRelationship,
    uniqueKey: "relationship_id",
    mapRow: (r) => ({
      relationship_id: r.relationship_id,
      warehouse_id: r.warehouse_id,
      store_id: r.store_id,
      primary_supply_flag: toBool(r.primary_supply_flag),
      lead_time_hours: toNumber(r.lead_time_hours),
      delivery_frequency: r.delivery_frequency,
      transport_mode: r.transport_mode,
      max_daily_capacity: toNumber(r.max_daily_capacity),
      status: r.status,
      backup_warehouse_flag: toBool(r.backup_warehouse_flag),
      average_delivery_delay: toNumber(r.average_delivery_delay),
      fuel_cost_estimate: toNumber(r.fuel_cost_estimate),
      preferred_route: r.preferred_route,
      traffic_risk_level: r.traffic_risk_level,
    }),
  });

  await upsertFromCsv({
    fileName: "SKU_WAREHOUSE_MAPPING.csv",
    model: SkuWarehouseMapping,
    uniqueKey: "sku_warehouse_mapping_id",
    mapRow: (r) => ({
      sku_warehouse_mapping_id: r.sku_warehouse_mapping_id,
      sku_id: r.sku_id,
      warehouse_id: r.warehouse_id,
      storage_priority: r.storage_priority,
      max_storage_quantity: toNumber(r.max_storage_quantity),
      min_storage_quantity: toNumber(r.min_storage_quantity),
      preferred_storage_zone: r.preferred_storage_zone,
      replenishment_source: r.replenishment_source,
      active_flag: toBool(r.active_flag),
      regional_demand_score: toNumber(r.regional_demand_score),
      procurement_priority: r.procurement_priority,
      storage_cost_per_unit: toNumber(r.storage_cost_per_unit),
      emergency_stock_flag: toBool(r.emergency_stock_flag),
    }),
  });

  await upsertFromCsv({
    fileName: "PRODUCT_DISTRIBUTION.csv",
    model: ProductDistribution,
    uniqueKey: "distribution_id",
    mapRow: (r) => ({
      distribution_id: r.distribution_id,
      sku_id: r.sku_id,
      store_id: r.store_id,
      demand_priority: r.demand_priority,
      assortment_type: r.assortment_type,
      min_stock_allocation: toNumber(r.min_stock_allocation),
      max_stock_allocation: toNumber(r.max_stock_allocation),
      preferred_customer_segment: r.preferred_customer_segment,
      active_flag: toBool(r.active_flag),
      local_preference_score: toNumber(r.local_preference_score),
      festival_relevance_score: toNumber(r.festival_relevance_score),
      climate_relevance: r.climate_relevance,
      promotion_priority: r.promotion_priority,
    }),
  });

  await upsertFromCsv({
    fileName: "WAREHOUSE_INVENTORY.csv",
    model: WarehouseInventory,
    uniqueKey: "warehouse_inventory_id",
    mapRow: (r) => ({
      warehouse_inventory_id: r.warehouse_inventory_id,
      warehouse_id: r.warehouse_id,
      sku_id: r.sku_id,
      batch_id: r.batch_id,
      quantity_on_hand: toNumber(r.quantity_on_hand),
      allocated_quantity: toNumber(r.allocated_quantity),
      available_quantity: toNumber(r.available_quantity),
      damaged_quantity: toNumber(r.damaged_quantity),
      inbound_quantity: toNumber(r.inbound_quantity),
      outbound_quantity: toNumber(r.outbound_quantity),
      reorder_flag: toBool(r.reorder_flag),
      reorder_level: toNumber(r.reorder_level),
      inventory_status: r.inventory_status,
      last_stock_update: r.last_stock_update,
      expiry_date: r.expiry_date,
      storage_zone: r.storage_zone,
    }),
  });

  await upsertFromCsv({
    fileName: "STORE_INVENTORY.csv",
    model: StoreInventory,
    uniqueKey: "store_inventory_id",
    mapRow: (r) => ({
      store_inventory_id: r.store_inventory_id,
      store_id: r.store_id,
      sku_id: r.sku_id,
      batch_id: r.batch_id,
      quantity_on_hand: toNumber(r.quantity_on_hand),
      reserved_quantity: toNumber(r.reserved_quantity),
      available_quantity: toNumber(r.available_quantity),
      damaged_quantity: toNumber(r.damaged_quantity),
      expired_quantity: toNumber(r.expired_quantity),
      inventory_status: r.inventory_status,
      reorder_flag: toBool(r.reorder_flag),
      reorder_level: toNumber(r.reorder_level),
      last_restocked_date: r.last_restocked_date,
      last_stock_update: r.last_stock_update,
      expiry_date: r.expiry_date,
      storage_zone: r.storage_zone,
    }),
  });

  // eslint-disable-next-line no-console
  console.log("Datasets import complete.");
  process.exit(0);
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("Import failed:", e);
  process.exit(1);
});

