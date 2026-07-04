# Backend Schema Report

## Overview

This backend uses **MongoDB + Mongoose** and defines its schema in:

- `Predictive-planning-Backend/src/models`

It contains **15 collections**.  
Relationships are modeled with logical ID fields (`*_id` as strings), not Mongo `ObjectId` refs.

---

## Collections and Columns

### 1) `users`

- `name`
- `email` (unique)
- `password` (`select: false`)
- `role` (`user` or `admin`)
- `createdAt`, `updatedAt`

### 2) `productcategories`

- `category_id` (unique)
- `category_name`
- `department`
- `storage_requirement`
- `perishable_flag`
- `status`
- `category_description`
- `avg_margin_percentage`
- `avg_inventory_turnover`
- `seasonality_type`
- `demand_pattern`
- `createdAt`, `updatedAt`

### 3) `suppliers`

- `supplier_id` (unique)
- `supplier_name`
- `supplier_type`
- `city`
- `state`
- `pincode`
- `contact_number`
- `supplied_categories`
- `lead_time_days`
- `minimum_order_quantity`
- `payment_terms`
- `supplier_rating`
- `status`
- `gst_number`
- `on_time_delivery_percentage`
- `defect_rate_percentage`
- `average_supply_capacity`
- `preferred_supplier_flag`
- `emergency_supply_support`
- `createdAt`, `updatedAt`

### 4) `warehouses`

- `warehouse_id` (unique)
- `warehouse_code`
- `warehouse_name`
- `warehouse_type`
- `city`
- `area`
- `state`
- `pincode`
- `latitude`
- `longitude`
- `total_capacity_units`
- `cold_storage_available`
- `loading_docks`
- `operating_hours`
- `manager_name`
- `status`
- `avg_dispatch_time_hours`
- `power_backup_flag`
- `automation_level`
- `warehouse_zone`
- `transport_partners`
- `security_level`
- `createdAt`, `updatedAt`

### 5) `stores`

- `store_id` (unique)
- `store_code`
- `store_name`
- `city`
- `area`
- `state`
- `pincode`
- `latitude`
- `longitude`
- `opening_time`
- `closing_time`
- `store_size_sqft`
- `warehouse_id`
- `max_storage_capacity`
- `avg_daily_customers`
- `store_type`
- `status`
- `parking_available`
- `premium_customer_ratio`
- `footfall_peak_hours`
- `online_delivery_supported`
- `demographic_profile`
- `income_segment`
- `createdAt`, `updatedAt`

### 6) `products`

- `sku_id` (unique)
- `sku_code`
- `sku_name`
- `category_id`
- `subcategory_id`
- `brand`
- `package_size`
- `unit_type`
- `mrp`
- `selling_price`
- `cost_price`
- `gst_percentage`
- `shelf_life_days`
- `perishable_flag`
- `storage_type`
- `behavior_type`
- `seasonal_flag`
- `festival_relevance`
- `private_label_flag`
- `supplier_id`
- `reorder_level`
- `reorder_quantity`
- `status`
- `product_margin_percentage`
- `weight_grams`
- `lead_time_days`
- `createdAt`, `updatedAt`

### 7) `inventorystates`

- `inventory_state_id` (unique)
- `state_name` (unique)
- `description`
- `severity_level`
- `replenishment_required`
- `sellable_flag`
- `auto_alert_flag`
- `dashboard_color_code`
- `escalation_required`
- `warehouse_action_required`
- `createdAt`, `updatedAt`

### 8) `stockpatterns`

- `stock_pattern_id` (unique)
- `sku_id` (unique)
- `movement_type`
- `avg_daily_sales`
- `replenishment_frequency_days`
- `demand_variability_score`
- `stockout_risk_level`
- `shelf_life_risk`
- `lead_time_days`
- `seasonal_peak_months`
- `weather_sensitivity`
- `promotion_sensitivity`
- `markdown_risk`
- `return_rate_percentage`
- `createdAt`, `updatedAt`

### 9) `warehousestorerelationships`

- `relationship_id` (unique)
- `warehouse_id`
- `store_id`
- `primary_supply_flag`
- `lead_time_hours`
- `delivery_frequency`
- `transport_mode`
- `max_daily_capacity`
- `status`
- `backup_warehouse_flag`
- `average_delivery_delay`
- `fuel_cost_estimate`
- `preferred_route`
- `traffic_risk_level`
- `createdAt`, `updatedAt`

**Unique composite key:** (`warehouse_id`, `store_id`)

### 10) `skuwarehousemappings`

- `sku_warehouse_mapping_id` (unique)
- `sku_id`
- `warehouse_id`
- `storage_priority`
- `max_storage_quantity`
- `min_storage_quantity`
- `preferred_storage_zone`
- `replenishment_source`
- `active_flag`
- `regional_demand_score`
- `procurement_priority`
- `storage_cost_per_unit`
- `emergency_stock_flag`
- `createdAt`, `updatedAt`

**Unique composite key:** (`sku_id`, `warehouse_id`)

### 11) `productdistributions`

- `distribution_id` (unique)
- `sku_id`
- `store_id`
- `demand_priority`
- `assortment_type`
- `min_stock_allocation`
- `max_stock_allocation`
- `preferred_customer_segment`
- `active_flag`
- `local_preference_score`
- `festival_relevance_score`
- `climate_relevance`
- `promotion_priority`
- `createdAt`, `updatedAt`

**Unique composite key:** (`sku_id`, `store_id`)

### 12) `productcategorydistributions`

- `distribution_id` (unique)
- `category_id`
- `expected_sku_count`
- `demand_priority`
- `storage_share_percentage`
- `avg_sales_share_percentage`
- `avg_profit_share`
- `seasonal_weight`
- `promotion_frequency`
- `createdAt`, `updatedAt`

### 13) `warehouseinventories`

- `warehouse_inventory_id` (unique)
- `warehouse_id`
- `sku_id`
- `batch_id`
- `quantity_on_hand`
- `allocated_quantity`
- `available_quantity`
- `damaged_quantity`
- `inbound_quantity`
- `outbound_quantity`
- `reorder_flag`
- `reorder_level`
- `inventory_status`
- `last_stock_update`
- `expiry_date`
- `storage_zone`
- `createdAt`, `updatedAt`

**Unique composite key:** (`warehouse_id`, `sku_id`, `batch_id`)

### 14) `storeinventories`

- `store_inventory_id` (unique)
- `store_id`
- `sku_id`
- `batch_id`
- `quantity_on_hand`
- `reserved_quantity`
- `available_quantity`
- `damaged_quantity`
- `expired_quantity`
- `inventory_status`
- `reorder_flag`
- `reorder_level`
- `last_restocked_date`
- `last_stock_update`
- `expiry_date`
- `storage_zone`
- `createdAt`, `updatedAt`

**Unique composite key:** (`store_id`, `sku_id`, `batch_id`)

### 15) `salestransactions`

- `transaction_id` (unique)
- `invoice_id`
- `sales_date`
- `sales_timestamp`
- `store_id`
- `warehouse_id`
- `sku_id`
- `sku_name`
- `category_id`
- `category_name`
- `supplier_id`
- `batch_id`
- `quantity_sold`
- `unit_price`
- `selling_price`
- `discount_percentage`
- `discount_amount`
- `total_sales_amount`
- `promotion_flag`
- `promotion_type`
- `festival_flag`
- `festival_name`
- `season_name`
- `weather_condition`
- `temperature_celsius`
- `competitor_activity_flag`
- `competitor_discount_percentage`
- `trend_score`
- `customer_footfall`
- `inventory_on_hand`
- `inventory_state`
- `stockout_flag`
- `reorder_level`
- `expiry_date`
- `days_to_expiry`
- `payment_mode`
- `customer_type`
- `sales_channel`
- `source_system`
- `ingestion_timestamp`
- `createdAt`, `updatedAt`

---

## Relationship Map

## Core Master Relations

- `products.category_id` -> `productcategories.category_id`
- `products.supplier_id` -> `suppliers.supplier_id`
- `stores.warehouse_id` -> `warehouses.warehouse_id` (default mapped warehouse)

## Inventory and Distribution Relations

- `storeinventories.store_id` -> `stores.store_id`
- `storeinventories.sku_id` -> `products.sku_id`
- `warehouseinventories.warehouse_id` -> `warehouses.warehouse_id`
- `warehouseinventories.sku_id` -> `products.sku_id`
- `stockpatterns.sku_id` -> `products.sku_id` (1:1 via unique constraint)
- `skuwarehousemappings.sku_id` -> `products.sku_id`
- `skuwarehousemappings.warehouse_id` -> `warehouses.warehouse_id`
- `warehousestorerelationships.warehouse_id` -> `warehouses.warehouse_id`
- `warehousestorerelationships.store_id` -> `stores.store_id`
- `productdistributions.sku_id` -> `products.sku_id`
- `productdistributions.store_id` -> `stores.store_id`
- `productcategorydistributions.category_id` -> `productcategories.category_id`

## Sales Fact Relations

- `salestransactions.store_id` -> `stores.store_id`
- `salestransactions.warehouse_id` -> `warehouses.warehouse_id`
- `salestransactions.sku_id` -> `products.sku_id`
- `salestransactions.category_id` -> `productcategories.category_id`
- `salestransactions.supplier_id` -> `suppliers.supplier_id`
- `salestransactions.inventory_state` -> `inventorystates.state_name` (logical match, not enforced FK)

---

## Data Integrity Notes

- No Mongo `ObjectId ref`-based constraints are used.
- IDs are connected using plain string fields (`*_id`).
- Referential integrity is managed by application logic/import order (not by MongoDB FK constraints).
- Import sequence is handled in `Predictive-planning-Backend/src/scripts/importDatasets.js`.

