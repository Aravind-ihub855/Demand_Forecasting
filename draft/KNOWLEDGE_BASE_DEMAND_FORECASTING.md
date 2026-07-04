# Demand Forecasting Knowledge Base

This document is a complete knowledge-transfer reference for the Demand Forecasting project, with special focus on:

- What data exists in the platform
- What data is useful for forecasting
- How LLM-based forecasting is implemented
- How token limits, rate limits, and quota are handled safely

---

## 1) Project Scope (Current State)

The platform simulates and analyzes enterprise retail demand for a D-Mart-like grocery chain, including:

- Master data and inventory data
- High-volume sales transactions (2025 history, ~1.4M+ imported records)
- Analytics dashboards (Inventory + Analytics + Festival Intelligence)
- LLM-assisted demand intelligence (Gemini) with fallback logic

Core stack:

- Backend: Node.js + Express + MongoDB + Mongoose
- Frontend: React + Recharts
- AI: Gemini API for business reasoning (not raw-row processing)

---

## 2) Data Available in the System

### 2.1 Master and Reference Data

The data model includes these core entities:

- `STORE_MASTER`
- `WAREHOUSE_MASTER`
- `WAREHOUSE_STORE_RELATIONSHIP`
- `SUPPLIER_MASTER`
- `PRODUCT_CATEGORY`
- `PRODUCT_MASTER`
- `PRODUCT_CATEGORY_DISTRIBUTION`
- `PRODUCT_DISTRIBUTION`
- `SKU_WAREHOUSE_MAPPING`

### 2.2 Inventory and Operations Data

- `STORE_INVENTORY`
- `WAREHOUSE_INVENTORY`
- `STOCK_PATTERNS`
- `INVENTORY_STATES`

### 2.3 Sales Transaction Data (High Volume)

`sales_transactions` collection (MongoDB) contains operationally rich rows including:

- Date/time fields (`sales_date`, `sales_timestamp`)
- Outlet dimensions (`store_id`, `warehouse_id`)
- Product dimensions (`sku_id`, `sku_name`, `category_id`, `category_name`)
- Commercial metrics (`quantity_sold`, `unit_price`, `discount_amount`, `total_sales_amount`)
- Event/context signals:
  - `festival_flag`, `festival_name`
  - `promotion_flag`, `promotion_type`
  - `weather_condition`, `temperature_celsius`
  - `competitor_activity_flag`, `competitor_discount_percentage`
  - `customer_footfall`
  - `inventory_on_hand`, `stockout_flag`, `inventory_state`

This is why forecasting can be event-aware and not only time-series-only.

---

## 3) Forecasting-Ready Features (What We Use)

From the above data, these features are actively used/derivable:

- Baseline demand (normal non-festival daily average)
- Festival demand (festival-window daily average)
- Demand uplift and incremental units
- Store-level demand growth during event windows
- Promotion effectiveness (festival-window baseline)
- Inventory sufficiency vs forecast demand
- Stockout risk signals
- Category-level festival concentration
- Footfall and weather context

These are computed via MongoDB aggregation pipelines before any LLM call.

---

## 4) LLM Forecasting Strategy (Important)

## 4.1 What LLM is used for

LLM is used for:

- Demand explanation
- Executive summary
- Prioritized recommendations
- Risk narrative and key insights

## 4.2 What LLM is NOT used for

LLM is **not** used to process all 1.4M raw records directly.

We do **not** send raw transaction tables to Gemini.

## 4.3 Actual processing pipeline

1. MongoDB aggregates raw transactions into compact business summaries
2. Backend builds token-compressed prompt JSON (top N rows only)
3. Gemini generates intelligence text/structured outputs
4. If Gemini fails or quota is hit, fallback heuristic logic is used

This architecture is the key to scale and cost control.

---

## 5) Festival Forecast Logic (Current)

For each SKU/store:

- Compute `normal_demand` = non-festival daily average
- Compute `festival_forecast` = event-window daily avg (optionally buffered)
- Compute `incremental_demand` = `max(0, festival_forecast - normal_demand)`
- Compute `demand_uplift_pct`

Ranking is impact-first:

1. `incremental_demand` (highest first)
2. `festival_forecast`
3. `demand_uplift_pct`

This avoids misleading ranking by percentage-only on low-base items.

---

## 6) Rate Limit and LLM Quota Handling

The platform controls rate/usage through multiple layers:

### 6.1 Token Compression

- Only summary payloads go to Gemini (top products, key stores, key risks, etc.)
- Prompt is intentionally compact and structured

### 6.2 Caching

- Aggregation cache keys for same filter set
- AI output cache keys for same filter set
- Versioned cache keys are used when logic changes

### 6.3 Graceful Fallback

If Gemini is unavailable (e.g., 429/503/network issue):

- Backend returns deterministic heuristic output
- API remains available (no hard failure to UI)

### 6.4 Request Hygiene

- Frontend avoids duplicate in-flight calls for identical params
- Heavy sections load with visual loading state, reducing repeated user retries

---

## 7) Why Some Percentages Can Become Negative

A negative percentage means event-window value < chosen baseline.

This can be real (certain store/product combinations) or caused by a poor baseline definition.

Recent corrections include:

- Promotion impact comparison anchored within same festival window
- Better normalization by distinct day counts
- Use of impact-first sorting to avoid percentage traps

---

## 8) Core API Surfaces (Current)

Primary intelligence endpoint:

- `POST /api/festival-intelligence/analyze`

Related analytics endpoint:

- `GET /api/analytics/festival-promotion-products`

Auth-protected routes require valid JWT token.

---

## 9) Auth and Session Behavior

- JWT-based authentication
- Current expiry configured to `3d`
- Middleware distinguishes:
  - token expired
  - token invalid

For users: after expiry setting changes, re-login once to obtain new token policy.

---

## 10) Operational Best Practices

- Keep event-window baselines localized (avoid broad annual baselines for event metrics)
- Always normalize by distinct day count when comparing periods
- Prefer incremental units over % for inventory/replenishment prioritization
- Keep LLM payload bounded and deterministic in shape
- Cache aggressively by filter combination and model/prompt version

---

## 11) What This Enables in Business Terms

With this setup, the platform can provide:

- Festival-aware forecast and replenishment
- Store-level demand opportunity and risk map
- Promotion impact diagnostics
- Explainable AI-assisted decisions with fallback reliability

---

## 12) Suggested Next Enhancements

- Add automated token budget estimator in backend logs
- Add confidence score per forecast row
- Add baseline mode selector (normal/rolling-week/weekday-matched)
- Add forecast audit trail (input summary + output + user action)
- Export-ready reporting bundles (CSV/PDF/Slack summary)

