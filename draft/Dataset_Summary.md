# Demand Forecasting — Dataset Summary

> **Project:** D-Mart Coimbatore Demand Forecasting  
> **Total Datasets:** 13 CSV files  
> **Scope:** 5 Stores · 2 Warehouses · 300 SKUs · 150 Suppliers

---

## 1. PRODUCT_MASTER.csv

**Description:** The primary product reference table. Contains detailed metadata for every SKU including pricing, costs, GST, shelf life, storage requirements, supplier linkage, and reorder parameters.

**Total Records:** 303 rows (300 active SKUs + header)

| Column | Description |
|---|---|
| sku_id | Unique SKU identifier (e.g. SKU0001) |
| sku_code | EAN/barcode of the product |
| sku_name | Full product name with size/variant |
| category_id | Linked category (CAT01–CAT12) |
| subcategory_id | Sub-group within category (e.g. Rice, Pulses) |
| brand | Brand name |
| package_size | Pack size (e.g. 25kg, 1kg, 500ml) |
| unit_type | Unit format (Bag, Pack, Bottle, etc.) |
| mrp | Maximum retail price (₹) |
| selling_price | Actual selling price (₹) |
| cost_price | Procurement cost (₹) |
| gst_percentage | Applicable GST % |
| shelf_life_days | Product shelf life in days |
| perishable_flag | true/false — is it perishable? |
| storage_type | Ambient / Cold / Frozen |
| behavior_type | Stable_Demand / Seasonal / Volatile |
| seasonal_flag | true/false — seasonal product? |
| festival_relevance | Associated festival (Pongal, Diwali, etc.) |
| private_label_flag | D-Mart own brand? |
| supplier_id | Linked supplier (SUP001…) |
| reorder_level | Minimum quantity before reorder trigger |
| reorder_quantity | Quantity to order when reorder is triggered |
| status | Active / Inactive |
| product_margin_percentage | Gross margin % |
| weight_grams | Product weight in grams |
| lead_time_days | Supplier delivery lead time |

**Sample Data:**

| sku_id | sku_name | category_id | brand | mrp | cost_price | shelf_life_days | storage_type | reorder_level | lead_time_days |
|---|---|---|---|---|---|---|---|---|---|
| SKU0001 | Ponni Rice 25kg | CAT01 | D-Mart Premia | 1650 | 1450 | 365 | Ambient | 30 | 3 |
| SKU0002 | Ponni Rice 10kg | CAT01 | India Gate | 1350 | 1180 | 365 | Ambient | 35 | 6 |
| SKU0003 | Idly Rice 10kg | CAT01 | Aachi | 1250 | 1080 | 365 | Ambient | 40 | 5 |
| SKU0006 | Wheat Flour Atta 5kg | CAT01 | Aashirvaad | 305 | 255 | 270 | Ambient | 80 | 5 |
| SKU0010 | Toor Dal 1kg | CAT01 | Tata Sampann | 185 | 160 | 365 | Ambient | 70 | 5 |

---

## 2. PRODUCT_CATEGORY.csv

**Description:** Master list of the 12 product categories used across the D-Mart assortment. Defines department, storage requirement, perishability, turnover rates, and demand characteristics for each category.

**Total Records:** 12 rows

| Column | Description |
|---|---|
| category_id | Unique category ID (CAT01–CAT12) |
| category_name | Category label (e.g. Grocery, Dairy) |
| department | Department grouping (Food & Staples, Home Care, etc.) |
| storage_requirement | Ambient / Cold / Frozen |
| perishable_flag | true/false |
| status | Active / Inactive |
| category_description | Brief description of the category |
| avg_margin_percentage | Average gross margin % |
| avg_inventory_turnover | Average turns per year |
| seasonality_type | Stable / Summer_Peak / Weather_Sensitive / Seasonal |
| demand_pattern | Stable / Fast_Moving / Volatile / Seasonal / Slow_Moving / Niche |

**Sample Data:**

| category_id | category_name | department | storage_requirement | avg_margin_% | avg_inventory_turnover | demand_pattern |
|---|---|---|---|---|---|---|
| CAT01 | Grocery | Food & Staples | Ambient | 12% | 8 | Stable |
| CAT02 | Dairy | Fresh Food | Cold | 15% | 20 | Fast_Moving |
| CAT03 | Beverages | Food & Staples | Ambient | 18% | 15 | Fast_Moving |
| CAT07 | Fruits & Vegetables | Fresh Food | Cold | 22% | 25 | Fast_Moving |
| CAT08 | Frozen Foods | Frozen | Frozen | 30% | 10 | Seasonal |
| CAT10 | Stationery | General Merchandise | Ambient | 18% | 3 | Slow_Moving |

---

## 3. PRODUCT_CATEGORY_DISTRIBUTION.csv

**Description:** Defines how each category is distributed across stores in terms of storage share, sales share, profit contribution, seasonality weight, and promotion frequency. Used to plan category-level assortment.

**Total Records:** 12 rows

| Column | Description |
|---|---|
| distribution_id | Unique record ID (CD001–CD012) |
| category_id | Linked category |
| expected_sku_count | Number of SKUs expected in this category |
| demand_priority | High / Medium / Low |
| storage_share_percentage | % of total store storage allocated |
| avg_sales_share_percentage | % of total sales revenue |
| avg_profit_share | % of total profit |
| seasonal_weight | Seasonal impact weight (0–1) |
| promotion_frequency | Low / Medium / High |

**Sample Data:**

| distribution_id | category_id | expected_sku_count | demand_priority | storage_share_% | avg_sales_share_% | avg_profit_share | promotion_frequency |
|---|---|---|---|---|---|---|---|
| CD001 | CAT01 | 50 | High | 30% | 32% | 28% | Low |
| CD002 | CAT02 | 20 | High | 12% | 14% | 13% | Medium |
| CD003 | CAT03 | 25 | High | 10% | 12% | 14% | High |
| CD004 | CAT04 | 25 | High | 8% | 10% | 15% | High |
| CD007 | CAT07 | 15 | High | 5% | 7% | 6% | Low |

---

## 4. PRODUCT_DISTRIBUTION.csv

**Description:** Maps every SKU to every store, defining allocation limits, demand priority, assortment type, customer segment targeting, and store-specific relevance scores. Drives replenishment targets at the store level.

**Total Records:** 1,500 rows (300 SKUs × 5 stores)

| Column | Description |
|---|---|
| distribution_id | Unique ID (PD0001…) |
| sku_id | Linked SKU |
| store_id | Linked store (ST001–ST005) |
| demand_priority | High / Medium / Low |
| assortment_type | Core / Seasonal / Optional |
| min_stock_allocation | Minimum units to hold at the store |
| max_stock_allocation | Maximum units allowed at the store |
| preferred_customer_segment | Target locality/segment |
| active_flag | true/false |
| local_preference_score | Score 0–1 for local demand fit |
| festival_relevance_score | Score 0–1 for festival demand |
| climate_relevance | None / Summer / Winter |
| promotion_priority | Low / Medium / High |

**Sample Data:**

| distribution_id | sku_id | store_id | demand_priority | assortment_type | min_stock | max_stock | preferred_segment |
|---|---|---|---|---|---|---|---|
| PD0001 | SKU0001 | ST001 | High | Core | 36 | 84 | Gandhipuram |
| PD0002 | SKU0001 | ST002 | High | Core | 36 | 72 | RS_Puram |
| PD0003 | SKU0001 | ST003 | High | Core | 48 | 108 | Singanallur |
| PD0004 | SKU0001 | ST004 | High | Core | 36 | 84 | Saibaba |
| PD0005 | SKU0001 | ST005 | High | Core | 42 | 96 | Avinashi |

---

## 5. STORE_MASTER.csv

**Description:** Reference table for the 5 D-Mart stores operating in Coimbatore. Contains location coordinates, store size, warehouse assignment, customer demographics, and operational details.

**Total Records:** 5 rows

| Column | Description |
|---|---|
| store_id | Unique store ID (ST001–ST005) |
| store_code | Human-readable code (e.g. DM-CBE-GP) |
| store_name | Full store name |
| city | City (all Coimbatore) |
| area | Local area name |
| state | Tamil Nadu |
| pincode | Postal code |
| latitude / longitude | GPS coordinates |
| opening_time / closing_time | Operating hours |
| store_size_sqft | Floor space in sq ft |
| warehouse_id | Primary supplying warehouse |
| max_storage_capacity | Max inventory units the store can hold |
| avg_daily_customers | Average footfall per day |
| store_type | Supermarket / Hypermarket |
| status | Active / Inactive |
| parking_available | true/false |
| premium_customer_ratio | Ratio of premium shoppers |
| footfall_peak_hours | Busiest hours of the day |
| online_delivery_supported | true/false |
| demographic_profile | Description of customer base |
| income_segment | Upper_Middle / High / Middle / Lower_Middle |

**Sample Data:**

| store_id | store_name | area | store_size_sqft | warehouse_id | avg_daily_customers | store_type | income_segment |
|---|---|---|---|---|---|---|---|
| ST001 | D-Mart Gandhipuram | Gandhipuram | 28,000 | WH001 | 2,600 | Supermarket | Upper_Middle |
| ST002 | D-Mart RS Puram | RS Puram | 32,000 | WH001 | 2,100 | Supermarket | High |
| ST003 | D-Mart Singanallur | Singanallur | 35,000 | WH002 | 3,400 | Hypermarket | Middle |
| ST004 | D-Mart Saibaba Colony | Saibaba Colony | 26,000 | WH001 | 2,300 | Supermarket | Lower_Middle |
| ST005 | D-Mart Avinashi Road | Avinashi Road | 30,000 | WH002 | 2,900 | Supermarket | Middle |

---

## 6. WAREHOUSE_MASTER.csv

**Description:** Reference table for the 2 warehouses that supply all 5 stores. Contains location, capacity, infrastructure details (cold storage, loading docks), automation level, and transport partners.

**Total Records:** 2 rows

| Column | Description |
|---|---|
| warehouse_id | Unique ID (WH001, WH002) |
| warehouse_code | Short code (DM-CBE-WH1, DM-CBE-WH2) |
| warehouse_name | Full name |
| warehouse_type | Central / Regional |
| city / area / state | Location details |
| pincode | Postal code |
| latitude / longitude | GPS coordinates |
| total_capacity_units | Max units that can be stored |
| cold_storage_available | true/false |
| loading_docks | Number of loading bays |
| operating_hours | Daily operation window |
| manager_name | Warehouse manager |
| status | Active / Inactive |
| avg_dispatch_time_hours | Average time from order to dispatch |
| power_backup_flag | true/false |
| automation_level | Low / Medium / High |
| warehouse_zone | Geographic zone |
| transport_partners | Logistics partners used |
| security_level | High / Medium / Low |

**Sample Data:**

| warehouse_id | warehouse_name | warehouse_type | total_capacity_units | cold_storage | loading_docks | avg_dispatch_hrs | automation_level |
|---|---|---|---|---|---|---|---|
| WH001 | D-Mart Coimbatore Central Warehouse | Central | 800,000 | Yes | 12 | 6 | Medium |
| WH002 | D-Mart Regional Distribution Warehouse | Regional | 600,000 | Yes | 10 | 4 | High |

---

## 7. WAREHOUSE_STORE_RELATIONSHIP.csv

**Description:** Defines the supply chain link between each warehouse and store it serves. Captures delivery frequency, lead times, transport mode, maximum daily capacity, and route details.

**Total Records:** 5 rows

| Column | Description |
|---|---|
| relationship_id | Unique ID (WSR001–WSR005) |
| warehouse_id | Supplying warehouse |
| store_id | Receiving store |
| primary_supply_flag | true — this is the main supply source |
| lead_time_hours | Hours from warehouse to store |
| delivery_frequency | Daily / Alternate_Day |
| transport_mode | Truck |
| max_daily_capacity | Max units that can be delivered per day |
| status | Active |
| backup_warehouse_flag | true/false — acts as backup |
| average_delivery_delay | Avg delay in hours |
| fuel_cost_estimate | Estimated fuel cost per trip (₹) |
| preferred_route | Named road route |
| traffic_risk_level | Low / Medium / High |

**Sample Data:**

| relationship_id | warehouse_id | store_id | lead_time_hours | delivery_frequency | max_daily_capacity | traffic_risk_level |
|---|---|---|---|---|---|---|
| WSR001 | WH001 | ST001 | 8 | Daily | 800 | Medium |
| WSR002 | WH001 | ST002 | 8 | Daily | 700 | Low |
| WSR003 | WH001 | ST004 | 10 | Alternate_Day | 600 | Medium |
| WSR004 | WH002 | ST003 | 6 | Daily | 900 | Medium |
| WSR005 | WH002 | ST005 | 6 | Daily | 850 | High |

---

## 8. SUPPLIER_MASTER.csv

**Description:** Contains details of all 150 suppliers providing products to the D-Mart network. Captures supplier type, location, categories supplied, lead times, minimum order quantities, payment terms, and reliability metrics.

**Total Records:** 150 rows

| Column | Description |
|---|---|
| supplier_id | Unique ID (SUP001–SUP150) |
| supplier_name | Legal name of the supplier |
| supplier_type | Manufacturer / Distributor |
| city / state / pincode | Location |
| contact_number | Phone number |
| supplied_categories | Pipe-separated list of categories (CAT01\|CAT04…) |
| lead_time_days | Standard delivery lead time |
| minimum_order_quantity | MOQ in units |
| payment_terms | e.g. 30 Days, 14 Days |
| supplier_rating | Gold / Silver / Bronze |
| status | Active / Inactive |
| gst_number | GST registration number |
| on_time_delivery_percentage | % of deliveries on time |
| defect_rate_percentage | % of defective/rejected goods |
| average_supply_capacity | Max units supplier can supply per cycle |
| preferred_supplier_flag | true/false |
| emergency_supply_support | Can supply urgently? true/false |

**Sample Data:**

| supplier_id | supplier_name | supplier_type | lead_time_days | supplier_rating | on_time_delivery_% | defect_rate_% | emergency_support |
|---|---|---|---|---|---|---|---|
| SUP001 | ITC Limited | Manufacturer | 5 | Gold | 96% | 0.7% | Yes |
| SUP004 | PepsiCo India | Manufacturer | 4 | Gold | 93% | 1.1% | Yes |
| SUP007 | Amul (GCMMF) | Manufacturer | 3 | Gold | 97% | 0.6% | Yes |
| SUP008 | Aavin Tamil Nadu Co-op | Manufacturer | 2 | Gold | 96% | 0.9% | Yes |
| SUP010 | Local Fresh Produce Aggregator | Distributor | 1 | Silver | 90% | 2.5% | Yes |

---

## 9. SKU_WAREHOUSE_MAPPING.csv

**Description:** Maps each SKU to its assigned warehouse, defining storage priority, quantity bounds, preferred storage zone, procurement source, regional demand score, and cost per unit. Controls how each product is managed at the warehouse level.

**Total Records:** 300 rows (one per SKU, all mapped to WH001 as primary)

| Column | Description |
|---|---|
| sku_warehouse_mapping_id | Unique ID (SWM0001…) |
| sku_id | Linked SKU |
| warehouse_id | Assigned warehouse |
| storage_priority | High / Medium / Low |
| min_storage_quantity | Minimum units to hold in the warehouse |
| max_storage_quantity | Maximum units the warehouse should stock |
| preferred_storage_zone | Ambient / Cold / Frozen |
| replenishment_source | Supplier / Transfer |
| active_flag | true/false |
| regional_demand_score | Score 0–1 reflecting regional demand strength |
| procurement_priority | High / Medium / Low |
| storage_cost_per_unit | Cost (₹) per unit per day |
| emergency_stock_flag | true/false — emergency buffer maintained? |

**Sample Data:**

| sku_id | warehouse_id | storage_priority | min_storage_qty | max_storage_qty | regional_demand_score | storage_cost_per_unit | emergency_stock |
|---|---|---|---|---|---|---|---|
| SKU0001 | WH001 | High | 800 | 2,400 | 0.85 | ₹0.20 | Yes |
| SKU0002 | WH001 | High | 600 | 1,800 | 0.80 | ₹0.20 | Yes |
| SKU0005 | WH001 | Medium | 150 | 450 | 0.68 | ₹0.25 | No |
| SKU0006 | WH001 | High | 960 | 2,880 | 0.90 | ₹0.18 | Yes |
| SKU0010 | WH001 | High | 1,040 | 3,120 | 0.85 | ₹0.15 | Yes |

---

## 10. STOCK_PATTERNS.csv

**Description:** Behavioural profile for each SKU used directly in demand forecasting. Captures movement type, average daily sales, replenishment frequency, demand variability, stockout risk, seasonal peaks, and promotional sensitivity.

**Total Records:** 300 rows (one per SKU)

| Column | Description |
|---|---|
| stock_pattern_id | Unique ID (SP0001…) |
| sku_id | Linked SKU |
| movement_type | Stable / Seasonal / Volatile / Slow_Moving |
| avg_daily_sales | Average units sold per day |
| replenishment_frequency_days | How often to reorder (in days) |
| demand_varability_score | Score 0–1 (higher = more unpredictable) |
| stockout_risk_level | Low / Medium / High |
| shelf_life_risk | Low / Medium / High |
| lead_time_days | Expected supplier lead time |
| seasonal_peak_months | Months with elevated demand (e.g. "Oct,Nov,Jan") |
| weather_sensitivity | None / Summer / Rain |
| promotion_sensitivity | Low / Medium / High |
| markdown_risk | Low / Medium / High |
| return_rate_percentage | % of units returned |

**Sample Data:**

| sku_id | movement_type | avg_daily_sales | replenishment_freq_days | demand_variability | stockout_risk | seasonal_peak_months |
|---|---|---|---|---|---|---|
| SKU0001 | Stable | 8.0 | 5 | 0.20 | Low | All |
| SKU0002 | Stable | 6.0 | 7 | 0.18 | Low | All |
| SKU0004 | Stable | 5.0 | 10 | 0.15 | Low | Jan |
| SKU0005 | Seasonal | 3.0 | 7 | 0.25 | Low | Oct, Nov, Jan |
| SKU0006 | Stable | 12.0 | 4 | 0.18 | Low | All |

---

## 11. WAREHOUSE_INVENTORY.csv

**Description:** Real-time snapshot of inventory held in both warehouses. Tracks on-hand quantities, allocated vs. available stock, damaged goods, inbound/outbound movements, reorder status, and expiry dates by batch.

**Total Records:** 600 rows (300 SKUs × 2 warehouses)

| Column | Description |
|---|---|
| warehouse_inventory_id | Unique ID (WI0001…) |
| warehouse_id | WH001 or WH002 |
| sku_id | Linked SKU |
| batch_id | Batch identifier with date stamp |
| quantity_on_hand | Total physical units in warehouse |
| allocated_quantity | Units reserved for store dispatch |
| available_quantity | Units free to allocate (on_hand − allocated) |
| damaged_quantity | Damaged/unsellable units |
| inbound_quantity | Units expected to arrive |
| outbound_quantity | Units scheduled to leave |
| reorder_flag | true/false — reorder needed? |
| reorder_level | Minimum quantity before reorder trigger |
| inventory_status | Normal / Low Stock / Critical / Overstock |
| last_stock_update | Date of last update |
| expiry_date | Product batch expiry date |
| storage_zone | Ambient / Cold / Frozen |

**Sample Data:**

| warehouse_inventory_id | warehouse_id | sku_id | qty_on_hand | allocated_qty | available_qty | damaged_qty | reorder_flag | inventory_status |
|---|---|---|---|---|---|---|---|---|
| WI0001 | WH001 | SKU0001 | 750 | 300 | 450 | 8 | false | Normal |
| WI0002 | WH002 | SKU0001 | 450 | 180 | 270 | 4 | false | Normal |
| WI0003 | WH001 | SKU0002 | 875 | 350 | 525 | 9 | false | Normal |
| WI0005 | WH001 | SKU0003 | 1,000 | 400 | 600 | 10 | false | Normal |
| WI0011 | WH001 | SKU0006 | 2,000 | 800 | 1,200 | 20 | false | Normal |

---

## 12. STORE_INVENTORY.csv

**Description:** Real-time inventory snapshot at the store level. Tracks stock on hand, reserved quantities, available units, damaged and expired goods, reorder status, and batch/zone details for every SKU in every store.

**Total Records:** 1,500 rows (300 SKUs × 5 stores)

| Column | Description |
|---|---|
| store_inventory_id | Unique ID (SI0001…) |
| store_id | Store (ST001–ST005) |
| sku_id | Linked SKU |
| batch_id | Batch reference with store and date |
| quantity_on_hand | Total units physically present |
| reserved_quantity | Units held for specific orders/promotions |
| available_quantity | Sellable units (on_hand − reserved) |
| damaged_quantity | Damaged units |
| expired_quantity | Expired units |
| inventory_status | Normal / Low Stock / Critical / Overstock |
| reorder_flag | true/false — needs restock? |
| reorder_level | Threshold quantity for reorder |
| last_restocked_date | Date of last replenishment |
| last_stock_update | Date of last stock count |
| expiry_date | Batch expiry date |
| storage_zone | Rack-A / Cold-B / Frozen-C etc. |

**Sample Data:**

| store_inventory_id | store_id | sku_id | qty_on_hand | reserved_qty | available_qty | damaged_qty | reorder_flag | inventory_status |
|---|---|---|---|---|---|---|---|---|
| SI0001 | ST001 | SKU0001 | 48 | 1 | 47 | 0 | false | Normal |
| SI0002 | ST002 | SKU0001 | 48 | 1 | 47 | 0 | false | Normal |
| SI0003 | ST003 | SKU0001 | 72 | 1 | 71 | 0 | false | Normal |
| SI0004 | ST004 | SKU0001 | 48 | 1 | 47 | 0 | false | Normal |
| SI0005 | ST005 | SKU0001 | 60 | 1 | 59 | 0 | false | Normal |

---

## 13. INVENTORY_STATES.csv

**Description:** A reference/lookup table defining all possible inventory states with their severity, action flags, and dashboard display color. Used to standardize status labels across store and warehouse inventory records.

**Total Records:** 9 rows

| Column | Description |
|---|---|
| inventory_state_id | Unique state code (IS01–IS09) |
| state_name | Human-readable state label |
| description | What the state means |
| severity_level | Low / Medium / High |
| replenishment_required | true/false |
| sellable_flag | true/false — can this stock be sold? |
| auto_alert_flag | true/false — auto-trigger alert? |
| dashboard_color_code | Hex color for UI display |
| escalation_required | true/false |
| warehouse_action_required | true/false |

**Sample Data:**

| inventory_state_id | state_name | severity_level | replenishment_required | sellable_flag | auto_alert | dashboard_color |
|---|---|---|---|---|---|---|
| IS01 | Normal | Low | No | Yes | No | #4CAF50 (Green) |
| IS02 | Low Stock | Medium | Yes | Yes | Yes | #FFC107 (Amber) |
| IS03 | Critical Stock | High | Yes | Yes | Yes | #F44336 (Red) |
| IS04 | Overstock | Medium | No | Yes | No | #2196F3 (Blue) |
| IS05 | Damaged | Medium | No | No | Yes | #9C27B0 (Purple) |
| IS06 | Expired | High | No | No | Yes | #000000 (Black) |
| IS07 | Reserved | Low | No | Yes | No | #3F51B5 (Indigo) |
| IS08 | Quarantined | High | No | No | Yes | #795548 (Brown) |
| IS09 | In Transit | Low | No | No | No | #009688 (Teal) |

---

## Entity Relationship Overview

```
SUPPLIER_MASTER ──────────────────────────► PRODUCT_MASTER
                                                  │
                    ┌─────────────────────────────┤
                    │                             │
                    ▼                             ▼
         SKU_WAREHOUSE_MAPPING          PRODUCT_CATEGORY
                    │                       PRODUCT_CATEGORY_DISTRIBUTION
                    ▼
         WAREHOUSE_MASTER ◄──── WAREHOUSE_STORE_RELATIONSHIP ────► STORE_MASTER
                    │                                                    │
                    ▼                                                    ▼
         WAREHOUSE_INVENTORY                                   STORE_INVENTORY
                    │                                                    │
                    └───────────────────────────────────────────────────┘
                                         │
                                         ▼
                              STOCK_PATTERNS (forecasting)
                              PRODUCT_DISTRIBUTION (allocation)
                              INVENTORY_STATES (status lookup)
```

---

## Dataset Quick Reference

| # | Dataset | Records | Key Role |
|---|---|---|---|
| 1 | PRODUCT_MASTER | 300 | SKU attributes, pricing, shelf life |
| 2 | PRODUCT_CATEGORY | 12 | Category rules, turnover, margins |
| 3 | PRODUCT_CATEGORY_DISTRIBUTION | 12 | Category-level store allocation strategy |
| 4 | PRODUCT_DISTRIBUTION | 1,500 | SKU-to-store allocation targets |
| 5 | STORE_MASTER | 5 | Store metadata, demographics |
| 6 | WAREHOUSE_MASTER | 2 | Warehouse infrastructure details |
| 7 | WAREHOUSE_STORE_RELATIONSHIP | 5 | Warehouse-to-store supply routes |
| 8 | SUPPLIER_MASTER | 150 | Supplier reliability, lead times |
| 9 | SKU_WAREHOUSE_MAPPING | 300 | Warehouse storage rules per SKU |
| 10 | STOCK_PATTERNS | 300 | Demand behaviour & forecasting signals |
| 11 | WAREHOUSE_INVENTORY | 600 | Live warehouse stock levels |
| 12 | STORE_INVENTORY | 1,500 | Live store stock levels |
| 13 | INVENTORY_STATES | 9 | Status classification lookup |

---

*Document generated for the D-Mart Coimbatore Demand Forecasting project.*
